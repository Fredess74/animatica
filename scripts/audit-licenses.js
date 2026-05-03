const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Finds all package.json files in the monorepo, excluding node_modules.
 */
function getPackageJsons() {
  const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
  return output.split('\n').filter(p => p.trim() !== '');
}

/**
 * Loads all dependency licenses using pnpm.
 */
function loadLicenses() {
  console.log('Running pnpm licenses list --json...');
  // Use high maxBuffer as the output can be large in monorepos
  const output = execSync('pnpm licenses list --json', { maxBuffer: 100 * 1024 * 1024 }).toString();
  const data = JSON.parse(output);

  const pkgToLicense = {};
  for (const [licenseName, packages] of Object.entries(data)) {
    for (const pkg of packages) {
      pkgToLicense[pkg.name] = {
        license: licenseName,
        version: pkg.versions ? pkg.versions[0] : 'Unknown',
        vendorUrl: pkg.vendorUrl,
      };
    }
  }
  return pkgToLicense;
}

function main() {
  const pkgToLicense = loadLicenses();
  const directDeps = {};

  for (const pjPath of getPackageJsons()) {
    const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
    const pkgName = pj.name || 'root';

    const deps = pj.dependencies || {};
    const devDeps = pj.devDependencies || {};
    const peerDeps = pj.peerDependencies || {};

    for (const [name, version] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
      // Exclude internal workspace packages
      if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
        continue;
      }

      if (!directDeps[name]) {
        directDeps[name] = {
          license: pkgToLicense[name] ? pkgToLicense[name].license : 'Unknown',
          version: pkgToLicense[name] ? pkgToLicense[name].version : 'Unknown',
          usedIn: new Set()
        };
      }
      directDeps[name].usedIn.add(pkgName);
    }
  }

  // All dependencies (including transitive)
  const allDepsSorted = Object.keys(pkgToLicense)
    .filter(name => !name.startsWith('@Animatica/'))
    .sort();

  // 1. Flagged Licenses (Non-MIT)
  let flaggedTable = "| Dependency | Version | License | Type |\n";
  flaggedTable += "| --- | --- | --- | --- |\n";
  const flaggedRows = [];

  for (const name of allDepsSorted) {
    const info = pkgToLicense[name];
    if (!info.license.includes('MIT')) {
      const type = directDeps[name] ? "**Direct**" : "Transitive";
      flaggedRows.push(`| ${name} | ${info.version} | ${info.license} | ${type} |`);
    }
  }
  flaggedTable += flaggedRows.join('\n');

  // 2. Direct Dependencies
  let directTable = "| Dependency | Version | License | Used In |\n";
  directTable += "| --- | --- | --- | --- |\n";
  const directRows = Object.keys(directDeps).sort().map(name => {
    const info = directDeps[name];
    const usedIn = Array.from(info.usedIn).sort().join(', ');
    return `| ${name} | ${info.version} | ${info.license} | ${usedIn} |`;
  });
  directTable += directRows.join('\n');

  // 3. All Dependencies (including transitive)
  let allTable = "| Dependency | Version | License | Type |\n";
  allTable += "| --- | --- | --- | --- |\n";
  const allRows = allDepsSorted.map(name => {
    const info = pkgToLicense[name];
    const type = directDeps[name] ? "**Direct**" : "Transitive";
    return `| ${name} | ${info.version} | ${info.license} | ${type} |`;
  });
  allTable += allRows.join('\n');

  const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
  let auditContent = fs.readFileSync(auditPath, 'utf8');

  // Update sections based on headers
  const updateSection = (content, header, newTable, nextHeader) => {
    const startIdx = content.indexOf(header);
    if (startIdx === -1) return content;

    const afterHeaderIdx = content.indexOf('\n', startIdx) + 1;
    // Skip optional descriptive text until the next table or header
    let tableStartIdx = content.indexOf('|', afterHeaderIdx);
    if (tableStartIdx === -1 || (nextHeader && tableStartIdx > content.indexOf(nextHeader, afterHeaderIdx))) {
       tableStartIdx = afterHeaderIdx;
    }

    const endIdx = nextHeader ? content.indexOf(nextHeader, tableStartIdx) : content.length;

    if (endIdx === -1) return content;

    return content.substring(0, tableStartIdx) + newTable + '\n\n' + content.substring(endIdx);
  };

  auditContent = updateSection(auditContent, "## Flagged Licenses (Non-MIT)", flaggedTable, "## Direct Dependencies");
  auditContent = updateSection(auditContent, "## Direct Dependencies", directTable, "## All Dependencies (including transitive)");

  // For the last section, it might be inside a <details> tag
  const allDepsHeader = "## All Dependencies (including transitive)";
  const allDepsStartIdx = auditContent.indexOf(allDepsHeader);
  if (allDepsStartIdx !== -1) {
    const detailsStart = auditContent.indexOf('<details>', allDepsStartIdx);
    const detailsEnd = auditContent.indexOf('</details>', allDepsStartIdx);
    if (detailsStart !== -1 && detailsEnd !== -1) {
      const summaryEnd = auditContent.indexOf('</summary>', detailsStart) + 10;
      auditContent = auditContent.substring(0, summaryEnd) + '\n\n' + allTable + '\n\n' + auditContent.substring(detailsEnd);
    } else {
      auditContent = updateSection(auditContent, allDepsHeader, allTable, null);
    }
  }

  // Update Date
  const today = new Date().toISOString().split('T')[0];
  auditContent = auditContent.replace(/\*\*Date:\*\* .*/, `**Date:** ${today}`);

  // Update Summary Counts
  const totalDeps = allDepsSorted.length;
  const directCount = Object.keys(directDeps).length;
  const transitiveCount = totalDeps - directCount;

  auditContent = auditContent.replace(/Total dependencies found: \d+/, `Total dependencies found: ${totalDeps}`);
  auditContent = auditContent.replace(/Direct dependencies: \d+/, `Direct dependencies: ${directCount}`);
  auditContent = auditContent.replace(/Transitive dependencies: \d+/, `Transitive dependencies: ${transitiveCount}`);

  fs.writeFileSync(auditPath, auditContent);
  console.log(`Audit report updated in ${auditPath}`);
}

main();
