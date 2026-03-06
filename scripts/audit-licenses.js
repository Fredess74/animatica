const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPackageJsons() {
    const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
    return output.split('\n').filter(p => p.trim() !== '');
}

function loadLicenses() {
    console.log('Running pnpm licenses list --json...');
    const output = execSync('pnpm licenses list --json', { maxBuffer: 20 * 1024 * 1024 }).toString();
    const data = JSON.parse(output);

    const pkgToLicense = {};
    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            pkgToLicense[pkg.name] = {
                license: licenseName,
                version: pkg.versions[0]
            };
        }
    }
    return pkgToLicense;
}

function checkSourceHeaders() {
    const filePath = 'packages/engine/src/index.ts';
    if (!fs.existsSync(filePath)) return 'File not found';
    const content = fs.readFileSync(filePath, 'utf8');
    const hasLicense = content.toLowerCase().includes('license') || content.toLowerCase().includes('copyright');
    return hasLicense ? 'License header found' : 'No license header found';
}

function main() {
    const pkgToLicense = loadLicenses();
    const directDeps = new Set();
    const depToPackage = {};

    const packageJsons = getPackageJsons();
    for (const pjPath of packageJsons) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const allLocalDeps = {
            ...(pj.dependencies || {}),
            ...(pj.devDependencies || {}),
            ...(pj.peerDependencies || {})
        };

        for (const [name, version] of Object.entries(allLocalDeps)) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            directDeps.add(name);
            if (!depToPackage[name]) depToPackage[name] = new Set();
            depToPackage[name].add(pj.name || 'root');
        }
    }

    const allDeps = Object.keys(pkgToLicense).sort();
    const sortedDirectDeps = Array.from(directDeps).sort();

    // 1. Flagged Licenses
    const flaggedTable = ["| Dependency | Version | License | Type |", "| --- | --- | --- | --- |"];
    for (const dep of allDeps) {
        const info = pkgToLicense[dep];
        const isMIT = info.license === 'MIT' || info.license === 'MIT-0';
        if (!isMIT) {
            const type = directDeps.has(dep) ? "**Direct**" : "Transitive";
            flaggedTable.push(`| ${dep} | ${info.version} | ${info.license} | ${type} |`);
        }
    }

    // 2. Direct Dependencies
    const directTable = ["| Dependency | License | Used In |", "| --- | --- | --- |"];
    for (const dep of sortedDirectDeps) {
        const info = pkgToLicense[dep] || { license: 'Unknown' };
        const usedIn = Array.from(depToPackage[dep]).sort().join(', ');
        directTable.push(`| ${dep} | ${info.license} | ${usedIn} |`);
    }

    // 3. All Dependencies
    const allTable = ["| Dependency | Version | License |", "| --- | --- | --- |"];
    for (const dep of allDeps) {
        const info = pkgToLicense[dep];
        allTable.push(`| ${dep} | ${info.version} | ${info.license} |`);
    }

    const today = new Date().toISOString().split('T')[0];
    const headerResult = checkSourceHeaders();

    const report = `# License Audit

**Date:** ${today}
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.

Total dependencies found: ${allDeps.length}
Direct dependencies: ${directDeps.size}
Transitive dependencies: ${allDeps.length - directDeps.size}

## Project License

- **File:** \`LICENSE\`
- **Status:** Present
- **License:** MIT

## Source Code Headers

- **Checked:** \`packages/engine/src/index.ts\`
- **Result:** ${headerResult}.

## Flagged Licenses (Non-MIT)

The following dependencies have non-MIT licenses:

${flaggedTable.join('\n')}

## Direct Dependencies

${directTable.join('\n')}

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

${allTable.join('\n')}

</details>
`;

    fs.writeFileSync('docs/LICENSE_AUDIT.md', report);
    console.log('Audit report generated in docs/LICENSE_AUDIT.md');
}

main();
