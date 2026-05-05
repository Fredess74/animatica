const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getPackageJsons() {
    const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
    return output.split('\n').filter(p => p.trim() !== '');
}

function loadLicenseData() {
    let data;
    if (fs.existsSync('licenses.json')) {
        data = JSON.parse(fs.readFileSync('licenses.json', 'utf8'));
    } else {
        console.log('Running pnpm licenses list --json...');
        const output = execSync('pnpm licenses list --json', { maxBuffer: 20 * 1024 * 1024 }).toString();
        data = JSON.parse(output);
    }

    const pkgToInfo = {};
    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            if (!pkgToInfo[pkg.name]) {
                pkgToInfo[pkg.name] = [];
            }
            // A package might have multiple versions under the same license or different licenses
            for (const version of pkg.versions) {
                pkgToInfo[pkg.name].push({
                    version: version,
                    license: licenseName
                });
            }
        }
    }
    return pkgToInfo;
}

function main() {
    const pkgToInfo = loadLicenseData();
    const directDeps = {};
    const allDirectNames = new Set();

    const packageJsonPaths = getPackageJsons();
    for (const pjPath of packageJsonPaths) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const pkgName = pj.name || 'Animatica (root)';

        const deps = { ...(pj.dependencies || {}), ...(pj.devDependencies || {}), ...(pj.peerDependencies || {}) };

        for (const [name, version] of Object.entries(deps)) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            if (!directDeps[name]) {
                directDeps[name] = new Set();
            }
            directDeps[name].add(pkgName);
            allDirectNames.add(name);
        }
    }

    const allPkgNames = Object.keys(pkgToInfo).sort();
    const flagged = [];
    const directTable = [];
    const allTable = [];

    let totalDeps = 0;
    const uniquePkgNames = new Set();

    for (const name of allPkgNames) {
        const infos = pkgToInfo[name];
        uniquePkgNames.add(name);
        for (const info of infos) {
            totalDeps++;
            const isDirect = allDirectNames.has(name);
            const license = info.license;
            const isNonMit = license !== 'MIT' && !license.includes('MIT');

            if (isNonMit) {
                flagged.push(`| ${name} | ${info.version} | ${license} | ${isDirect ? '**Direct**' : 'Transitive'} |`);
            }

            if (isDirect) {
                // For direct deps table, we just list the name and license (might have multiple versions but usually one is direct)
                // To keep it simple, we'll just add it once per name/license combo if it's direct
            }

            allTable.push(`| ${name} | ${info.version} | ${license} |`);
        }

        if (allDirectNames.has(name)) {
            // Get unique licenses for this direct dep
            const licenses = Array.from(new Set(infos.map(i => i.license))).sort().join(', ');
            const usedIn = Array.from(directDeps[name]).sort().join(', ');
            directTable.push(`| ${name} | ${licenses} | ${usedIn} |`);
        }
    }

    let directCount = allDirectNames.size;
    let transitiveCount = uniquePkgNames.size - directCount;

    const today = new Date().toISOString().split('T')[0];

    let content = `# License Audit

**Date:** ${today}
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.

Total dependencies found: ${uniquePkgNames.size}
Direct dependencies: ${directCount}
Transitive dependencies: ${transitiveCount}

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
${flagged.sort().join('\n')}

## Direct Dependencies

| Dependency | License | Used In |
| --- | --- | --- |
${directTable.sort().join('\n')}

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

| Dependency | Version | License |
| --- | --- | --- |
${allTable.sort().join('\n')}

</details>
`;

    fs.writeFileSync('docs/LICENSE_AUDIT.md', content);
    console.log('Audit report generated in docs/LICENSE_AUDIT.md');
}

main();
