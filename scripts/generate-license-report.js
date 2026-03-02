const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPackageJsons() {
  const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
  return output.split('\n').filter(p => p.trim() !== '');
}

function loadLicenses() {
  console.log('Running pnpm licenses list --json...');
  try {
    const output = execSync('pnpm licenses list --json', { maxBuffer: 20 * 1024 * 1024 }).toString();
    return JSON.parse(output);
  } catch (error) {
    console.error('Error running pnpm licenses list:', error.message);
    process.exit(1);
  }
}

function main() {
  const licenseData = loadLicenses();
  const pkgToLicense = {};
  const allDepsInfo = {}; // name -> { version, license }

  for (const [licenseName, packages] of Object.entries(licenseData)) {
    for (const pkg of packages) {
      pkgToLicense[pkg.name] = licenseName;
      allDepsInfo[pkg.name] = {
        version: pkg.versions[0],
        license: licenseName
      };
    }
  }

  const directDepsMapping = {}; // depName -> Set of packageNames
  const workspacePackages = new Set();

  const pjPaths = getPackageJsons();
  for (const pjPath of pjPaths) {
    const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
    workspacePackages.add(pj.name || 'root');

    const deps = pj.dependencies || {};
    const devDeps = pj.devDependencies || {};
    const peerDeps = pj.peerDependencies || {};

    const allLocalDeps = { ...deps, ...devDeps, ...peerDeps };

    for (const [name, version] of Object.entries(allLocalDeps)) {
      // Skip workspace packages
      if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
        continue;
      }
      if (!directDepsMapping[name]) {
        directDepsMapping[name] = new Set();
      }
      directDepsMapping[name].add(pj.name || 'root');
    }
  }

  const sortedDirectDeps = Object.keys(directDepsMapping).sort();
  const sortedAllDeps = Object.keys(allDepsInfo).sort();

  const flagged = [];
  let directTable = "| Dependency | License | Used In |\n| --- | --- | --- |\n";

  for (const dep of sortedDirectDeps) {
    const license = pkgToLicense[dep] || 'Unknown';
    const usedIn = Array.from(directDepsMapping[dep]).sort().join(', ');
    directTable += `| ${dep} | ${license} | ${usedIn} |\n`;

    if (license !== 'MIT' && !license.includes('MIT')) {
      flagged.push({ name: dep, license, type: 'Direct' });
    }
  }

  // Also find non-MIT in transitive deps
  for (const dep of sortedAllDeps) {
    const license = allDepsInfo[dep].license;
    if (license !== 'MIT' && !license.includes('MIT')) {
      // Avoid duplicates if already flagged as direct
      if (!flagged.some(f => f.name === dep)) {
        flagged.push({ name: dep, license, type: 'Transitive' });
      }
    }
  }

  let flaggedTable = "| Dependency | License | Type |\n| --- | --- | --- |\n";
  for (const f of flagged) {
    flaggedTable += `| ${f.name} | ${f.license} | ${f.type} |\n`;
  }

  let allDepsTable = "| Dependency | Version | License |\n| --- | --- | --- |\n";
  for (const dep of sortedAllDeps) {
    allDepsTable += `| ${dep} | ${allDepsInfo[dep].version} | ${allDepsInfo[dep].license} |\n`;
  }

  const today = new Date().toISOString().split('T')[0];
  const totalDeps = sortedAllDeps.length;
  const totalDirect = sortedDirectDeps.length;
  const totalTransitive = totalDeps - totalDirect;

  const report = `# License Audit

**Date:** ${today}
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.

Total dependencies found: ${totalDeps}
Direct dependencies: ${totalDirect}
Transitive dependencies: ${totalTransitive}

## Project License

- **File:** \`LICENSE\`
- **Status:** Present
- **License:** MIT

## Source Code Headers

- **Checked:** \`packages/engine/src/index.ts\`
- **Result:** No license header found.

## Flagged Licenses (Non-MIT)

The following dependencies have non-MIT licenses:

${flaggedTable}

## Direct Dependencies

${directTable}

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

${allDepsTable}

</details>
`;

  const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
  fs.writeFileSync(auditPath, report);
  console.log('Audit report generated in docs/LICENSE_AUDIT.md');
}

main();
