const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPackageJsons() {
  const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
  return output.split('\n').filter(p => p.trim() !== '');
}

function loadLicenseData() {
  console.log('Running pnpm licenses list --json...');
  const output = execSync('pnpm licenses list --json', { maxBuffer: 100 * 1024 * 1024 }).toString();
  return JSON.parse(output);
}

function main() {
  const data = loadLicenseData();
  const allPkgs = [];
  for (const [license, pkgs] of Object.entries(data)) {
    for (const pkg of pkgs) {
      allPkgs.push({ ...pkg, license });
    }
  }
  allPkgs.sort((a, b) => a.name.localeCompare(b.name));

  const directDepsMap = {};
  for (const pjPath of getPackageJsons()) {
    try {
      const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
      const deps = { ...pj.dependencies, ...pj.devDependencies, ...pj.peerDependencies };
      for (const [name, version] of Object.entries(deps)) {
        if (name.startsWith('@Animatica/') || (typeof version === 'string' && (version.startsWith('workspace:') || version.startsWith('link:')))) {
          continue;
        }
        if (!directDepsMap[name]) {
          directDepsMap[name] = new Set();
        }
        directDepsMap[name].add(pj.name || 'root');
      }
    } catch (e) {
      console.error(`Error parsing ${pjPath}:`, e.message);
    }
  }

  const directDepsList = Object.keys(directDepsMap).sort();

  // Summary counts
  const totalDeps = allPkgs.length;
  const directDepsCount = directDepsList.length;
  const transitiveDepsCount = totalDeps - directDepsCount;

  // 1. Flagged Licenses Table
  const flaggedTable = ["| Dependency | Version | License | Type |", "| --- | --- | --- | --- |"];
  for (const pkg of allPkgs) {
    if (pkg.license !== 'MIT' && !pkg.license.includes('MIT')) {
      const type = directDepsMap[pkg.name] ? "**Direct**" : "Transitive";
      const version = pkg.versions ? pkg.versions.join(', ') : 'Unknown';
      flaggedTable.push(`| ${pkg.name} | ${version} | ${pkg.license} | ${type} |`);
    }
  }

  // 2. Direct Dependencies Table
  const directTable = ["| Dependency | License | Used In |", "| --- | --- | --- |"];
  for (const dep of directDepsList) {
    const pkgInfo = allPkgs.find(p => p.name === dep);
    const license = pkgInfo ? pkgInfo.license : "Unknown";
    const usedIn = Array.from(directDepsMap[dep]).sort().join(', ');
    directTable.push(`| ${dep} | ${license} | ${usedIn} |`);
  }

  // 3. All Dependencies Table
  const allTable = ["| Dependency | Version | License |", "| --- | --- | --- |"];
  for (const pkg of allPkgs) {
    const version = pkg.versions ? pkg.versions.join(', ') : 'Unknown';
    allTable.push(`| ${pkg.name} | ${version} | ${pkg.license} |`);
  }

  const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
  let content = "";

  if (fs.existsSync(auditPath)) {
    content = fs.readFileSync(auditPath, 'utf8');
  } else {
    // Create default structure if not exists
    content = `# License Audit

**Date:** 2026-01-01
**Auditor:** Jules (License Auditor)

## Summary

Total dependencies found: 0
Direct dependencies: 0
Transitive dependencies: 0

## Project License

- **File:** \`LICENSE\`
- **Status:** Present
- **License:** MIT

## Source Code Headers

- **Checked:** \`packages/engine/src/index.ts\`
- **Result:** No license header found.

## Flagged Licenses (Non-MIT)

The following dependencies have non-MIT licenses:

| Dependency | Version | License | Type |
| --- | --- | --- | --- |

## Direct Dependencies

| Dependency | License | Used In |
| --- | --- | --- |

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

| Dependency | Version | License |
| --- | --- | --- |

</details>
`;
  }

  // Update Summary
  content = content.replace(/Total dependencies found: \d+/, `Total dependencies found: ${totalDeps}`);
  content = content.replace(/Direct dependencies: \d+/, `Direct dependencies: ${directDepsCount}`);
  content = content.replace(/Transitive dependencies: \d+/, `Transitive dependencies: ${transitiveDepsCount}`);

  // Update Date
  const today = new Date().toISOString().split('T')[0];
  content = content.replace(/\*\*Date:\*\* \d{4}-\d{2}-\d{2}/, `**Date:** ${today}`);

  // Update Sections
  function replaceTable(fullContent, header, newTableRows) {
    const startIdx = fullContent.indexOf(`## ${header}`);
    if (startIdx === -1) return fullContent;

    const nextSectionIdx = fullContent.indexOf("\n## ", startIdx + 5);
    const searchEnd = nextSectionIdx !== -1 ? nextSectionIdx : fullContent.length;

    const tableStartIdx = fullContent.indexOf("|", startIdx);
    if (tableStartIdx === -1 || tableStartIdx > searchEnd) {
      // Just append
      return fullContent.substring(0, startIdx + header.length + 3) + "\n\n" + newTableRows.join('\n') + "\n\n" + fullContent.substring(startIdx + header.length + 3);
    }

    // Find where the table ends (first non-table line after table start)
    const lines = fullContent.substring(tableStartIdx, searchEnd).split('\n');
    let tableEndInSearch = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('|')) {
        tableEndInSearch += lines[i].length + 1;
      } else if (lines[i].trim() === '') {
        tableEndInSearch += lines[i].length + 1;
      } else {
        break;
      }
    }

    return fullContent.substring(0, tableStartIdx) + newTableRows.join('\n') + "\n" + fullContent.substring(tableStartIdx + tableEndInSearch);
  }

  content = replaceTable(content, "Flagged Licenses (Non-MIT)", flaggedTable);
  content = replaceTable(content, "Direct Dependencies", directTable);

  // All Dependencies is special due to <details>
  const allStart = content.indexOf("## All Dependencies (including transitive)");
  if (allStart !== -1) {
    const detailsStart = content.indexOf("<details>", allStart);
    const detailsEnd = content.indexOf("</details>", allStart);
    if (detailsStart !== -1 && detailsEnd !== -1) {
      const newAll = `<details>\n<summary>Click to expand full dependency list</summary>\n\n${allTable.join('\n')}\n\n</details>`;
      content = content.substring(0, detailsStart) + newAll + content.substring(detailsEnd + 10);
    }
  }

  fs.writeFileSync(auditPath, content);
  console.log('LICENSE_AUDIT.md updated.');
}

main();
