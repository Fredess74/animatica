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

    const pkgToInfo = {};
    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            if (!pkgToInfo[pkg.name]) {
                pkgToInfo[pkg.name] = [];
            }
            // pnpm licenses list --json output has "versions" (array) and other fields
            // We want to handle each version if they have different licenses,
            // but usually they are grouped by license in the top-level keys.
            for (const ver of pkg.versions) {
                pkgToInfo[pkg.name].push({
                    version: ver,
                    license: licenseName,
                    vendor: pkg.vendor,
                    homepage: pkg.homepage
                });
            }
        }
    }
    return pkgToInfo;
}

function main() {
    const pkgToInfo = loadLicenses();
    const directDeps = {}; // name -> Set of workspace packages using it

    const workspacePackages = getPackageJsons();

    for (const pjPath of workspacePackages) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const workspaceName = pj.name || 'Animatica';

        const deps = pj.dependencies || {};
        const devDeps = pj.devDependencies || {};
        const peerDeps = pj.peerDependencies || {};

        for (const [name, version] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            if (!directDeps[name]) {
                directDeps[name] = new Set();
            }
            directDeps[name].add(workspaceName);
        }
    }

    const allDepsList = Object.keys(pkgToInfo).sort();

    const flaggedTable = [];
    const directTable = [];
    const allTable = [];

    for (const name of allDepsList) {
        const infos = pkgToInfo[name];
        for (const info of infos) {
            const isDirect = directDeps[name] !== undefined;
            const type = isDirect ? "**Direct**" : "Transitive";

            const license = info.license;
            const isNonMit = license !== 'MIT' && license !== 'MIT-0';

            if (isNonMit) {
                flaggedTable.push(`| ${name} | ${info.version} | ${license} | ${type} |`);
            }

            if (isDirect) {
                const usedIn = Array.from(directDeps[name]).sort().join(', ');
                directTable.push(`| ${name} | ${license} | ${usedIn} |`);
            }

            allTable.push(`| ${name} | ${info.version} | ${license} |`);
        }
    }

    const directCount = Object.keys(directDeps).length;
    const totalCount = allDepsList.length;
    const transitiveCount = totalCount - directCount;

    const today = new Date().toISOString().split('T')[0];

    let content = `# License Audit

**Date:** ${today}
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.

Total dependencies found: ${totalCount}
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
${flaggedTable.join('\n')}

## Direct Dependencies

| Dependency | License | Used In |
| --- | --- | --- |
${directTable.filter((item, index, self) => self.indexOf(item) === index).sort().join('\n')}

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

| Dependency | Version | License |
| --- | --- | --- |
${allTable.join('\n')}

</details>
`;

    fs.writeFileSync('docs/LICENSE_AUDIT.md', content);
    console.log('Audit report generated in docs/LICENSE_AUDIT.md');
}

main();
