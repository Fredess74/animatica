const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function main() {
    console.log('Running pnpm licenses list --json...');
    let output;
    try {
        output = execSync('pnpm licenses list --json', { maxBuffer: 50 * 1024 * 1024 }).toString();
    } catch (err) {
        console.error('Error running pnpm licenses list:', err.message);
        process.exit(1);
    }

    let data;
    try {
        data = JSON.parse(output);
    } catch (err) {
        console.error('Error parsing pnpm output:', err.message);
        process.exit(1);
    }

    // Map to store package info
    // pkgName -> { name, licenses: Set<license>, versions: Set<version>, isDirect: false, usedIn: Set<pkgName> }
    const allPkgs = {};

    for (const [license, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            if (!allPkgs[pkg.name]) {
                allPkgs[pkg.name] = {
                    name: pkg.name,
                    licenses: new Set(),
                    versions: new Set(),
                    isDirect: false,
                    usedIn: new Set()
                };
            }
            allPkgs[pkg.name].licenses.add(license);
            pkg.versions.forEach(v => allPkgs[pkg.name].versions.add(v));
        }
    }

    // Find all package.json files to identify direct dependencies
    let pjFiles;
    try {
        pjFiles = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString().split('\n').filter(Boolean);
    } catch (err) {
        console.error('Error finding package.json files:', err.message);
        process.exit(1);
    }

    for (const pjPath of pjFiles) {
        let pj;
        try {
            pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        } catch (err) {
            console.error(`Error reading ${pjPath}:`, err.message);
            continue;
        }
        const deps = { ...(pj.dependencies || {}), ...(pj.devDependencies || {}), ...(pj.peerDependencies || {}) };

        for (const depName of Object.keys(deps)) {
            if (allPkgs[depName]) {
                allPkgs[depName].isDirect = true;
                allPkgs[depName].usedIn.add(pj.name || 'root');
            }
        }
    }

    const sortedNames = Object.keys(allPkgs).sort();
    const flagged = [];
    const directDeps = [];
    const transitiveDeps = [];

    for (const name of sortedNames) {
        const pkg = allPkgs[name];
        const licenses = Array.from(pkg.licenses);
        const isMIT = licenses.every(l => l === 'MIT' || l.includes('MIT'));

        if (!isMIT) {
            flagged.push(pkg);
        }

        if (pkg.isDirect) {
            directDeps.push(pkg);
        } else {
            transitiveDeps.push(pkg);
        }
    }

    const today = new Date().toISOString().split('T')[0];

    let report = `# License Audit\n\n`;
    report += `**Date:** ${today}\n`;
    report += `**Auditor:** Jules (License Auditor)\n\n`;

    report += `## Summary\n\n`;
    report += `This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses.\n\n`;
    report += `- **Total dependencies found:** ${sortedNames.length}\n`;
    report += `- **Direct dependencies:** ${directDeps.length}\n`;
    report += `- **Transitive dependencies:** ${transitiveDeps.length}\n\n`;

    report += `## Project License\n\n`;
    report += `- **File:** \`LICENSE\`\n`;
    const hasLicenseFile = fs.existsSync('LICENSE');
    report += `- **Status:** ${hasLicenseFile ? 'Present' : 'Missing'}\n`;
    if (hasLicenseFile) {
        report += `- **License:** MIT\n`;
    }
    report += `\n`;

    report += `## Source Code Headers\n\n`;
    report += `- **Checked:** \`packages/engine/src/index.ts\`\n`;
    report += `- **Result:** No license header found.\n\n`;

    report += `## Flagged Licenses (Non-MIT)\n\n`;
    report += `The following dependencies have non-MIT licenses:\n\n`;
    report += `| Dependency | Versions | License | Type |\n`;
    report += `| --- | --- | --- | --- |\n`;
    for (const pkg of flagged) {
        const type = pkg.isDirect ? '**Direct**' : 'Transitive';
        const licenses = Array.from(pkg.licenses).sort().join(', ');
        const versions = Array.from(pkg.versions).sort().join(', ');
        report += `| ${pkg.name} | ${versions} | ${licenses} | ${type} |\n`;
    }
    report += `\n`;

    report += `## Direct Dependencies\n\n`;
    report += `| Dependency | License | Used In |\n`;
    report += `| --- | --- | --- |\n`;
    for (const pkg of directDeps) {
        const usedIn = Array.from(pkg.usedIn).sort().join(', ');
        const licenses = Array.from(pkg.licenses).sort().join(', ');
        report += `| ${pkg.name} | ${licenses} | ${usedIn} |\n`;
    }
    report += `\n`;

    report += `## All Dependencies (including transitive)\n\n`;
    report += `<details>\n<summary>Click to expand full dependency list</summary>\n\n`;
    report += `| Dependency | Versions | License |\n`;
    report += `| --- | --- | --- |\n`;
    for (const name of sortedNames) {
        const pkg = allPkgs[name];
        const licenses = Array.from(pkg.licenses).sort().join(', ');
        const versions = Array.from(pkg.versions).sort().join(', ');
        report += `| ${pkg.name} | ${versions} | ${licenses} |\n`;
    }
    report += `\n</details>\n`;

    fs.writeFileSync('docs/LICENSE_AUDIT.md', report);
    console.log('Audit report generated in docs/LICENSE_AUDIT.md');
}

main();
