const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPackageJsons() {
    const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
    return output.split('\n').filter(p => p.trim() !== '');
}

function loadLicenses() {
    console.log('Running pnpm licenses list --json...');
    const output = execSync('pnpm licenses list --json', { maxBuffer: 100 * 1024 * 1024 }).toString();
    const data = JSON.parse(output);

    const nameToInfo = {};
    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            if (!nameToInfo[pkg.name]) {
                nameToInfo[pkg.name] = [];
            }
            nameToInfo[pkg.name].push({
                versions: pkg.versions,
                license: licenseName
            });
        }
    }
    return nameToInfo;
}

function main() {
    const nameToInfo = loadLicenses();

    const directDeps = {}; // name -> Set(packages using it)

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));

        const deps = pj.dependencies || {};
        const devDeps = pj.devDependencies || {};
        const peerDeps = pj.peerDependencies || {};

        for (const name of Object.keys({ ...deps, ...devDeps, ...peerDeps })) {
            if (name.startsWith('@Animatica/') || name === pj.name) {
                continue;
            }
            if (!directDeps[name]) {
                directDeps[name] = new Set();
            }
            directDeps[name].add(pj.name || 'root');
        }
    }

    const allPackages = [];
    for (const [name, infos] of Object.entries(nameToInfo)) {
        for (const info of infos) {
            allPackages.push({
                name,
                version: info.versions.join(', '),
                license: info.license,
                isDirect: !!directDeps[name],
                usedIn: directDeps[name] ? Array.from(directDeps[name]).sort().join(', ') : 'Transitive'
            });
        }
    }

    allPackages.sort((a, b) => a.name.localeCompare(b.name));

    const flagged = allPackages.filter(p => !p.license.includes('MIT'));
    const directTablePackages = allPackages.filter(p => p.isDirect);

    const today = new Date().toISOString().split('T')[0];

    let content = `# License Audit\n\n`;
    content += `**Date:** ${today}\n`;
    content += `**Auditor:** Jules (License Auditor)\n\n`;
    content += `## Summary\n\n`;
    content += `This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.\n\n`;
    content += `Total dependencies found: ${allPackages.length}\n`;
    content += `Direct dependencies: ${directTablePackages.length}\n`;
    content += `Transitive dependencies: ${allPackages.length - directTablePackages.length}\n\n`;

    content += `## Project License\n\n`;
    const hasLicenseFile = fs.existsSync('LICENSE');
    content += `- **File:** \`LICENSE\`\n`;
    content += `- **Status:** ${hasLicenseFile ? 'Present' : 'Missing'}\n`;
    if (hasLicenseFile) {
        content += `- **License:** MIT\n`;
    }
    content += `\n`;

    content += `## Source Code Headers\n\n`;
    const engineIndex = 'packages/engine/src/index.ts';
    content += `- **Checked:** \`${engineIndex}\`\n`;
    if (fs.existsSync(engineIndex)) {
        const fileContent = fs.readFileSync(engineIndex, 'utf8').substring(0, 500);
        const hasHeader = fileContent.includes('License') || fileContent.includes('Copyright');
        content += `- **Result:** ${hasHeader ? 'License header found.' : 'No license header found.'}\n`;
    } else {
        content += `- **Result:** File not found.\n`;
    }
    content += `\n`;

    content += `## Flagged Licenses (Non-MIT)\n\n`;
    content += `The following dependencies have non-MIT licenses:\n\n`;
    content += `| Dependency | Version | License | Type |\n`;
    content += `| --- | --- | --- | --- |\n`;
    for (const p of flagged) {
        content += `| ${p.name} | ${p.version} | ${p.license} | ${p.isDirect ? '**Direct**' : 'Transitive'} |\n`;
    }
    content += `\n`;

    content += `## Direct Dependencies\n\n`;
    content += `| Dependency | License | Used In |\n`;
    content += `| --- | --- | --- |\n`;
    for (const p of directTablePackages) {
        content += `| ${p.name} | ${p.license} | ${p.usedIn} |\n`;
    }
    content += `\n`;

    content += `## All Dependencies (including transitive)\n\n`;
    content += `<details>\n<summary>Click to expand full dependency list</summary>\n\n`;
    content += `| Dependency | Version | License |\n`;
    content += `| --- | --- | --- |\n`;
    for (const p of allPackages) {
        content += `| ${p.name} | ${p.version} | ${p.license} |\n`;
    }
    content += `\n</details>\n`;

    fs.writeFileSync('docs/LICENSE_AUDIT.md', content);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
