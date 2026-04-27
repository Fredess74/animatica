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

    const allKnownPackages = {}; // name -> { [license]: [versions] }

    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            if (!allKnownPackages[pkg.name]) {
                allKnownPackages[pkg.name] = {};
            }
            if (!allKnownPackages[pkg.name][licenseName]) {
                allKnownPackages[pkg.name][licenseName] = [];
            }
            const versions = pkg.versions || (pkg.version ? [pkg.version] : []);
            versions.forEach(v => {
                if (!allKnownPackages[pkg.name][licenseName].includes(v)) {
                    allKnownPackages[pkg.name][licenseName].push(v);
                }
            });
        }
    }
    return allKnownPackages;
}

function main() {
    const allKnownPackages = loadLicenses();
    const directDeps = {}; // name -> Set of workspace packages using it
    const workspacePackages = new Set();
    const packageJsonPaths = getPackageJsons();

    // First pass to find all workspace package names
    for (const pjPath of packageJsonPaths) {
        try {
            const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
            if (pj.name) workspacePackages.add(pj.name);
        } catch (e) {
            console.error(`Error reading ${pjPath}: ${e.message}`);
        }
    }

    for (const pjPath of packageJsonPaths) {
        try {
            const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
            const deps = pj.dependencies || {};
            const devDeps = pj.devDependencies || {};
            const peerDeps = pj.peerDependencies || {};

            for (const [name, version] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
                if (workspacePackages.has(name) || (typeof version === 'string' && version.startsWith('workspace:'))) {
                    continue;
                }
                if (!directDeps[name]) {
                    directDeps[name] = new Set();
                }
                directDeps[name].add(pj.name || 'root');
            }
        } catch (e) {
            console.error(`Error processing ${pjPath}: ${e.message}`);
        }
    }

    const sortedAllDeps = Object.keys(allKnownPackages).sort();
    const sortedDirectDeps = Object.keys(directDeps).sort();

    const flagged = [];
    for (const dep of sortedAllDeps) {
        const licenseInfos = allKnownPackages[dep];
        for (const [license, versions] of Object.entries(licenseInfos)) {
            if (license !== 'MIT' && !license.includes('MIT')) {
                flagged.push({
                    name: dep,
                    version: versions.join(', '),
                    license: license,
                    type: directDeps[dep] ? '**Direct**' : 'Transitive'
                });
            }
        }
    }

    let auditContent = `# License Audit\n\n`;
    const today = new Date().toISOString().split('T')[0];
    auditContent += `**Date:** ${today}\n`;
    auditContent += `**Auditor:** Jules (License Auditor)\n\n`;

    auditContent += `## Summary\n\n`;
    auditContent += `This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.\n\n`;
    auditContent += `Total dependencies found: ${sortedAllDeps.length}\n`;
    auditContent += `Direct dependencies: ${sortedDirectDeps.length}\n`;
    auditContent += `Transitive dependencies: ${sortedAllDeps.length - sortedDirectDeps.length}\n\n`;

    auditContent += `## Project License\n\n`;
    auditContent += `- **File:** \`LICENSE\`\n`;
    const hasLicense = fs.existsSync(path.join(process.cwd(), 'LICENSE'));
    auditContent += `- **Status:** ${hasLicense ? 'Present' : 'Missing'}\n`;
    auditContent += `- **License:** MIT\n\n`;

    auditContent += `## Source Code Headers\n\n`;
    auditContent += `- **Checked:** \`packages/engine/src/index.ts\`\n`;
    let hasHeader = false;
    const indexPath = path.join(process.cwd(), 'packages/engine/src/index.ts');
    if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        hasHeader = indexContent.includes('LICENSE') || indexContent.includes('Copyright');
    }
    auditContent += `- **Result:** ${hasHeader ? 'License header found.' : 'No license header found.'}\n\n`;

    auditContent += `## Flagged Licenses (Non-MIT)\n\nThe following dependencies have non-MIT licenses:\n\n`;
    auditContent += `| Dependency | Version | License | Type |\n`;
    auditContent += `| --- | --- | --- | --- |\n`;
    for (const f of flagged) {
        auditContent += `| ${f.name} | ${f.version} | ${f.license} | ${f.type} |\n`;
    }
    auditContent += `\n`;

    auditContent += `## Direct Dependencies\n\n`;
    auditContent += `| Dependency | License | Used In |\n`;
    auditContent += `| --- | --- | --- |\n`;
    for (const dep of sortedDirectDeps) {
        const licenseInfos = allKnownPackages[dep];
        const licenses = licenseInfos ? Object.keys(licenseInfos).join(', ') : 'Unknown';
        const usedIn = Array.from(directDeps[dep]).sort().join(', ');
        auditContent += `| ${dep} | ${licenses} | ${usedIn} |\n`;
    }
    auditContent += `\n`;

    auditContent += `## All Dependencies (including transitive)\n\n`;
    auditContent += `<details>\n<summary>Click to expand full dependency list</summary>\n\n`;
    auditContent += `| Dependency | Version | License |\n`;
    auditContent += `| --- | --- | --- |\n`;
    for (const dep of sortedAllDeps) {
        const licenseInfos = allKnownPackages[dep];
        for (const [license, versions] of Object.entries(licenseInfos)) {
            auditContent += `| ${dep} | ${versions.join(', ')} | ${license} |\n`;
        }
    }
    auditContent += `\n</details>\n`;

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
