const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPackageJsons() {
  const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
  return output.split('\n').filter(p => p.trim() !== '' && !p.includes('/node_modules/'));
}

function loadLicenses() {
  console.log('Running pnpm licenses list --json...');
  const output = execSync('pnpm licenses list --json', { maxBuffer: 20 * 1024 * 1024 }).toString();
  const data = JSON.parse(output);

  const pkgToInfo = {};
  for (const [licenseName, packages] of Object.entries(data)) {
    for (const pkg of packages) {
      pkgToInfo[pkg.name] = {
        license: licenseName,
        version: pkg.versions ? pkg.versions[0] : 'Unknown'
      };
    }
  }
  return pkgToInfo;
}

function checkLicenseHeader(filePath) {
  if (!fs.existsSync(filePath)) return 'File not found';
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').slice(0, 5);
  const hasLicense = lines.some(line => line.toLowerCase().includes('license') || line.toLowerCase().includes('copyright'));
  return hasLicense ? 'License header found' : 'No license header found';
}

function main() {
  const pkgToInfo = loadLicenses();
  const allDirectDeps = {};
  const packageJsons = getPackageJsons();

  for (const pjPath of packageJsons) {
    const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
    const deps = pj.dependencies || {};
    const devDeps = pj.devDependencies || {};

    for (const [name, version] of Object.entries({ ...deps, ...devDeps })) {
      // Skip workspace packages
      if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
        continue;
      }
      if (!allDirectDeps[name]) {
        allDirectDeps[name] = new Set();
      }
      allDirectDeps[name].add(pj.name || 'root');
    }
  }

  const allDepNames = Object.keys(pkgToInfo).sort();
  const directDepNames = Object.keys(allDirectDeps).sort();
  const transitiveDepNames = allDepNames.filter(name => !allDirectDeps[name]);

  const flagged = [];
  for (const name of allDepNames) {
    const info = pkgToInfo[name];
    if (info.license !== 'MIT' && !info.license.includes('MIT')) {
      flagged.push({
        name,
        version: info.version,
        license: info.license,
        type: allDirectDeps[name] ? '**Direct**' : 'Transitive'
      });
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const projectLicenseStatus = fs.existsSync('LICENSE') ? 'Present' : 'Missing';
  const headerCheckResult = checkLicenseHeader('packages/engine/src/index.ts');

  let report = `# License Audit

**Date:** ${today}
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.

Total dependencies found: ${allDepNames.length}
Direct dependencies: ${directDepNames.length}
Transitive dependencies: ${transitiveDepNames.length}

## Project License

- **File:** \`LICENSE\`
- **Status:** ${projectLicenseStatus}
- **License:** MIT

## Source Code Headers

- **Checked:** \`packages/engine/src/index.ts\`
- **Result:** ${headerCheckResult}

## Flagged Licenses (Non-MIT)

The following dependencies have non-MIT licenses:

| Dependency | Version | License | Type |
| --- | --- | --- | --- |
${flagged.map(f => `| ${f.name} | ${f.version} | ${f.license} | ${f.type} |`).join('\n')}

## Direct Dependencies

| Dependency | License | Used In |
| --- | --- | --- |
${directDepNames.map(name => `| ${name} | ${pkgToInfo[name]?.license || 'Unknown'} | ${Array.from(allDirectDeps[name]).sort().join(', ')} |`).join('\n')}

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

| Dependency | Version | License |
| --- | --- | --- |
${allDepNames.map(name => `| ${name} | ${pkgToInfo[name].version} | ${pkgToInfo[name].license} |`).join('\n')}

</details>
`;

  fs.writeFileSync('docs/LICENSE_AUDIT.md', report);
  console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
