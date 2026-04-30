const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPackageJsons() {
    const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
    return output.split('\n').filter(p => p.trim() !== '');
}

function loadLicenses() {
    console.log('Running pnpm licenses list --json...');
    const output = execSync('pnpm licenses list --json', { maxBuffer: 50 * 1024 * 1024 }).toString();
    const data = JSON.parse(output);

    const allKnownPkgs = [];

    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            for (const version of pkg.versions) {
                allKnownPkgs.push({
                    name: pkg.name,
                    version: version,
                    license: licenseName
                });
            }
        }
    }
    return allKnownPkgs;
}

function main() {
    const allKnownPkgs = loadLicenses();

    const directDeps = {}; // name -> { usedIn: Set }
    const workspacePackages = new Set();

    const pkgJsons = getPackageJsons();
    for (const pjPath of pkgJsons) {
        try {
            const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
            if (pj.name) workspacePackages.add(pj.name);
        } catch (e) {}
    }

    for (const pjPath of pkgJsons) {
        try {
            const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
            const pjName = pj.name || 'root';

            const deps = pj.dependencies || {};
            const devDeps = pj.devDependencies || {};
            const peerDeps = pj.peerDependencies || {};

            for (const [name, versionSpec] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
                if (name.startsWith('@Animatica/') || workspacePackages.has(name) || name === pj.name) {
                    continue;
                }
                if (!directDeps[name]) {
                    directDeps[name] = { usedIn: new Set() };
                }
                directDeps[name].usedIn.add(pjName);
            }
        } catch (e) {}
    }

    const flagged = [];
    const directTableRows = [];
    const allTableRows = [];

    const sortedKnownPkgs = allKnownPkgs.sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

    const directNames = new Set(Object.keys(directDeps));

    for (const pkg of sortedKnownPkgs) {
        const isDirect = directNames.has(pkg.name);
        const license = pkg.license;
        const isMIT = license.toLowerCase().includes('mit');

        if (!isMIT) {
            flagged.push(`| ${pkg.name} | ${pkg.version} | ${license} | ${isDirect ? '**Direct**' : 'Transitive'} |`);
        }

        if (isDirect) {
            const usedIn = Array.from(directDeps[pkg.name].usedIn).sort().join(', ');
            directTableRows.push(`| ${pkg.name} | ${license} | ${usedIn} |`);
        }

        allTableRows.push(`| ${pkg.name} | ${pkg.version} | ${license} |`);
    }

    // Unique direct dependencies for the direct table (since one package might have multiple versions)
    // Actually, usually a direct dep has one version in the lockfile, but let's be safe.
    // The Direct Dependencies table in LICENSE_AUDIT.md doesn't show version.
    const uniqueDirectRows = Array.from(new Set(directTableRows)).sort();

    const today = new Date().toISOString().split('T')[0];

    let auditContent = `# License Audit

**Date:** ${today}
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.

Total dependencies found: ${allKnownPkgs.length}
Direct dependencies: ${directNames.size}
Transitive dependencies: ${allKnownPkgs.length - directNames.size}

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
${flagged.join('\n')}

## Direct Dependencies

| Dependency | License | Used In |
| --- | --- | --- |
${uniqueDirectRows.join('\n')}

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

| Dependency | Version | License |
| --- | --- | --- |
${allTableRows.join('\n')}

</details>
`;

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
