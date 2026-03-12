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

    const pkgs = [];
    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            pkgs.push({
                name: pkg.name,
                license: licenseName,
                versions: pkg.versions
            });
        }
    }
    return pkgs;
}

function main() {
    const pkgs = loadLicenses();
    const directDeps = {};

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const pkgName = pj.name || 'root';

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
            directDeps[name].add(pkgName);
        }
    }

    const isMit = (license) => {
        return /MIT(-0)?/i.test(license);
    };

    const flagged = [];
    for (const pkg of pkgs) {
        if (!isMit(pkg.license)) {
            flagged.push({
                name: pkg.name,
                version: pkg.versions.sort().join(', '),
                license: pkg.license,
                type: directDeps[pkg.name] ? '**Direct**' : 'Transitive'
            });
        }
    }
    flagged.sort((a, b) => a.name.localeCompare(b.name));

    // Project License Check
    const hasLicenseFile = fs.existsSync('LICENSE');

    // Header Check
    const engineIndex = 'packages/engine/src/index.ts';
    let hasHeader = false;
    if (fs.existsSync(engineIndex)) {
        const content = fs.readFileSync(engineIndex, 'utf8');
        hasHeader = content.includes('Copyright') || content.includes('License');
    }

    const today = new Date().toISOString().split('T')[0];

    const sortedAllPkgs = [...pkgs].sort((a, b) => a.name.localeCompare(b.name));
    const sortedDirectDeps = Object.keys(directDeps).sort();

    let md = `# License Audit\n\n`;
    md += `**Date:** ${today}\n`;
    md += `**Auditor:** Jules (License Auditor)\n\n`;

    md += `## Summary\n\n`;
    md += `This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.\n\n`;
    md += `Total dependencies found: ${pkgs.length}\n`;
    md += `Direct dependencies: ${sortedDirectDeps.length}\n`;
    md += `Transitive dependencies: ${pkgs.length - sortedDirectDeps.length}\n\n`;

    md += `## Project License\n\n`;
    md += `- **File:** \`LICENSE\`\n`;
    md += `- **Status:** ${hasLicenseFile ? 'Present' : 'Missing'}\n`;
    md += `- **License:** MIT\n\n`;

    md += `## Source Code Headers\n\n`;
    md += `- **Checked:** \`${engineIndex}\`\n`;
    md += `- **Result:** ${hasHeader ? 'Found' : 'No license header found.'}\n\n`;

    md += `## Flagged Licenses (Non-MIT)\n\n`;
    md += `The following dependencies have non-MIT licenses:\n\n`;
    md += `| Dependency | Version | License | Type |\n`;
    md += `| --- | --- | --- | --- |\n`;
    for (const f of flagged) {
        md += `| ${f.name} | ${f.version} | ${f.license} | ${f.type} |\n`;
    }
    md += `\n`;

    md += `## Direct Dependencies\n\n`;
    md += `| Dependency | License | Used In |\n`;
    md += `| --- | --- | --- |\n`;
    for (const depName of sortedDirectDeps) {
        const depPkgs = pkgs.filter(p => p.name === depName);
        const licenses = depPkgs.map(p => p.license).join(', ') || 'Unknown';
        const usedIn = Array.from(directDeps[depName]).sort().join(', ');
        md += `| ${depName} | ${licenses} | ${usedIn} |\n`;
    }
    md += `\n`;

    md += `## All Dependencies (including transitive)\n\n`;
    md += `<details>\n<summary>Click to expand full dependency list</summary>\n\n`;
    md += `| Dependency | Version | License |\n`;
    md += `| --- | --- | --- |\n`;
    for (const pkg of sortedAllPkgs) {
        md += `| ${pkg.name} | ${pkg.versions.sort().join(', ')} | ${pkg.license} |\n`;
    }
    md += `\n</details>\n`;

    fs.writeFileSync('docs/LICENSE_AUDIT.md', md);
    console.log('Audit report regenerated in docs/LICENSE_AUDIT.md');
}

main();
