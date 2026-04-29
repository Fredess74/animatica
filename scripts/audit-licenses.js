const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Gets all package.json files in the workspace, excluding node_modules.
 */
function getPackageJsons() {
    // Note: 'find' is Unix-specific.
    const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
    return output.split('\n').filter(p => p.trim() !== '');
}

/**
 * Loads all installed packages and their licenses using pnpm.
 */
function loadInstalledPackages() {
    console.log('Running pnpm licenses list --json...');
    const output = execSync('pnpm licenses list --json', { maxBuffer: 20 * 1024 * 1024 }).toString();
    const data = JSON.parse(output);

    const pkgs = [];
    for (const [license, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            for (const version of pkg.versions) {
                pkgs.push({ name: pkg.name, version, license });
            }
        }
    }
    return pkgs;
}

/**
 * Loads all direct dependencies from all package.json files.
 */
function loadDirectDeps() {
    const directDeps = new Map(); // name -> Set of { versionRange, sourcePkg }

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const pjName = pj.name || 'root';

        const deps = pj.dependencies || {};
        const devDeps = pj.devDependencies || {};
        const peerDeps = pj.peerDependencies || {};

        for (const [name, version] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            if (!directDeps.has(name)) {
                directDeps.set(name, new Set());
            }
            directDeps.get(name).add({ version, sourcePkg: pjName });
        }
    }
    return directDeps;
}

function main() {
    const allInstalledPkgs = loadInstalledPackages();
    const directDepsMap = loadDirectDeps();

    allInstalledPkgs.sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

    let report = "# License Audit\n\n";
    const today = new Date().toISOString().split('T')[0];
    report += `**Date:** ${today}\n`;
    report += `**Auditor:** Jules (License Auditor)\n\n`;

    report += "## Summary\n\n";
    report += "This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses.\n\n";
    report += `Total dependencies found: ${allInstalledPkgs.length}\n`;
    const uniqueDirectCount = directDepsMap.size;
    report += `Direct dependencies: ${uniqueDirectCount}\n`;
    report += `Transitive dependencies: ${allInstalledPkgs.length - uniqueDirectCount}\n\n`;

    report += "## Project License\n\n";
    const licenseExists = fs.existsSync('LICENSE');
    report += `- **File:** \`LICENSE\`\n`;
    report += `- **Status:** ${licenseExists ? 'Present' : 'MISSING'}\n`;
    report += `- **License:** MIT\n\n`;

    report += "## Flagged Licenses (Non-MIT)\n\n";
    report += "The following dependencies have non-MIT licenses:\n\n";
    report += "| Dependency | Version | License | Type |\n";
    report += "| --- | --- | --- | --- |\n";

    const flagged = allInstalledPkgs.filter(p => p.license !== 'MIT' && !p.license.includes('MIT'));
    for (const pkg of flagged) {
        const isDirect = directDepsMap.has(pkg.name);
        report += `| ${pkg.name} | ${pkg.version} | ${pkg.license} | ${isDirect ? '**Direct**' : 'Transitive'} |\n`;
    }
    report += "\n";

    report += "## Direct Dependencies\n\n";
    report += "| Dependency | License | Used In |\n";
    report += "| --- | --- | --- |\n";

    const sortedDirectNames = Array.from(directDepsMap.keys()).sort();
    for (const name of sortedDirectNames) {
        // Find the license from allInstalledPkgs
        const installed = allInstalledPkgs.find(p => p.name === name);
        const license = installed ? installed.license : 'Unknown';
        const usedIn = Array.from(directDepsMap.get(name)).map(d => d.sourcePkg).sort().join(', ');
        report += `| ${name} | ${license} | ${usedIn} |\n`;
    }
    report += "\n";

    report += "## All Dependencies (including transitive)\n\n";
    report += "<details>\n<summary>Click to expand full dependency list</summary>\n\n";
    report += "| Dependency | Version | License |\n";
    report += "| --- | --- | --- |\n";
    for (const pkg of allInstalledPkgs) {
        report += `| ${pkg.name} | ${pkg.version} | ${pkg.license} |\n`;
    }
    report += "\n</details>\n";

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    fs.writeFileSync(auditPath, report);
    console.log(`Audit report generated in ${auditPath}`);
}

main();
