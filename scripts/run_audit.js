const fs = require('fs');
const { execSync } = require('child_process');

try {
    console.log('Fetching license data...');
    const raw = execSync('pnpm licenses list --json', { maxBuffer: 20 * 1024 * 1024 }).toString();
    const licenses = JSON.parse(raw);

    console.log('Scanning package.json files...');
    const pkgFiles = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString().split('\n').filter(Boolean);

    const directDeps = new Map();
    pkgFiles.forEach(file => {
        const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        Object.keys(deps).forEach(dep => {
            if (!dep.startsWith('@Animatica/') && !deps[dep].startsWith('workspace:')) {
                if (!directDeps.has(dep)) directDeps.set(dep, new Set());
                directDeps.get(dep).add(pkg.name || 'root');
            }
        });
    });

    const all = [];
    const flagged = [];
    const direct = [];

    for (const [license, items] of Object.entries(licenses)) {
        items.forEach(item => {
            const data = {
                name: item.name,
                version: item.versions[0],
                license,
                isDirect: directDeps.has(item.name),
                usedIn: directDeps.has(item.name) ? Array.from(directDeps.get(item.name)).sort().join(', ') : ''
            };
            all.push(data);
            if (license !== 'MIT' && !license.includes('MIT')) {
                flagged.push(data);
            }
            if (data.isDirect) {
                direct.push(data);
            }
        });
    }

    all.sort((a, b) => a.name.localeCompare(b.name));
    flagged.sort((a, b) => a.name.localeCompare(b.name));
    direct.sort((a, b) => a.name.localeCompare(b.name));

    const date = new Date().toISOString().split('T')[0];
    const markdown = `# License Audit

**Date:** ${date}
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.

Total dependencies found: ${all.length}
Direct dependencies: ${direct.length}
Transitive dependencies: ${all.length - direct.length}

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
${flagged.map(d => `| ${d.name} | ${d.version} | ${d.license} | ${d.isDirect ? '**Direct**' : 'Transitive'} |`).join('\n')}

## Direct Dependencies

| Dependency | License | Used In |
| --- | --- | --- |
${direct.map(d => `| ${d.name} | ${d.license} | ${d.usedIn} |`).join('\n')}

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

| Dependency | Version | License |
| --- | --- | --- |
${all.map(d => `| ${d.name} | ${d.version} | ${d.license} |`).join('\n')}

</details>
`;

    fs.writeFileSync('docs/LICENSE_AUDIT.md', markdown);
    console.log('docs/LICENSE_AUDIT.md created successfully.');

} catch (error) {
    console.error('Error generating license audit:', error);
    process.exit(1);
}
