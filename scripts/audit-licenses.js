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
            pkgToLicense[pkg.name] = licenseName;
        }
    }
    return pkgToLicense;
}

function loadFullLicenses() {
    console.log('Running pnpm licenses list --json...');
    const output = execSync('pnpm licenses list --json', { maxBuffer: 20 * 1024 * 1024 }).toString();
    const data = JSON.parse(output);

    const packages = [];
    for (const [licenseName, pkgList] of Object.entries(data)) {
        for (const pkgEntry of pkgList) {
            const name = pkgEntry.name;
            const version = pkgEntry.versions ? pkgEntry.versions[0] : (pkgEntry.version || 'Unknown');

            packages.push({
                name: name,
                version: version,
                license: licenseName
            });
        }
    }
    return packages;
}

function main() {
    const allPkgs = loadFullLicenses();
    const directDepsMap = {};

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const deps = { ...(pj.dependencies || {}), ...(pj.devDependencies || {}), ...(pj.peerDependencies || {}) };

        for (const name of Object.keys(deps)) {
            if (name.startsWith('@Animatica/') || (typeof deps[name] === 'string' && deps[name].startsWith('workspace:'))) {
                continue;
            }
            if (!directDepsMap[name]) {
                directDepsMap[name] = new Set();
            }
            directDepsMap[name].add(pj.name || 'root');
        }
    }

    const sortedAllPkgs = allPkgs.sort((a, b) => a.name.localeCompare(b.name));

    // Summary data
    const totalDeps = sortedAllPkgs.length;
    const directDepsCount = Object.keys(directDepsMap).length;
    const transitiveDepsCount = totalDeps - directDepsCount;

    // Flagged Section
    let flaggedTable = "| Dependency | Version | License | Type |\n";
    flaggedTable += "| --- | --- | --- | --- |\n";
    const flaggedRows = [];

    for (const pkg of sortedAllPkgs) {
        const isMIT = pkg.license === 'MIT' || pkg.license === 'MIT-0';
        if (!isMIT) {
            const type = directDepsMap[pkg.name] ? "**Direct**" : "Transitive";
            flaggedRows.push(`| ${pkg.name} | ${pkg.version} | ${pkg.license} | ${type} |`);
        }
    }
    flaggedTable += flaggedRows.join('\n');

    // Direct Dependencies Section
    let directTable = "| Dependency | License | Used In |\n";
    directTable += "| --- | --- | --- |\n";
    const directRows = [];
    const directSortedNames = Object.keys(directDepsMap).sort();
    for (const name of directSortedNames) {
        const pkg = sortedAllPkgs.find(p => p.name === name) || { license: 'Unknown' };
        const usedIn = Array.from(directDepsMap[name]).sort().join(', ');
        directRows.push(`| ${name} | ${pkg.license} | ${usedIn} |`);
    }
    directTable += directRows.join('\n');

    // All Dependencies Section
    let allTable = "| Dependency | Version | License |\n";
    allTable += "| --- | --- | --- |\n";
    const allRows = sortedAllPkgs.map(pkg => `| ${pkg.name} | ${pkg.version} | ${pkg.license} |`);
    allTable += allRows.join('\n');

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    let auditContent = fs.readFileSync(auditPath, 'utf8');

    // Update Date
    const today = new Date().toISOString().split('T')[0];
    auditContent = auditContent.replace(/\*\*Date:\*\* .*/, `**Date:** ${today}`);

    // Update Summary
    auditContent = auditContent.replace(/Total dependencies found: \d+/, `Total dependencies found: ${totalDeps}`);
    auditContent = auditContent.replace(/Direct dependencies: \d+/, `Direct dependencies: ${directDepsCount}`);
    auditContent = auditContent.replace(/Transitive dependencies: \d+/, `Transitive dependencies: ${transitiveDepsCount}`);

    // Update Flagged Licenses
    const flaggedHeader = "## Flagged Licenses (Non-MIT)\n\nThe following dependencies have non-MIT licenses:\n\n";
    const flaggedEnd = "\n\n## Direct Dependencies";
    const fStart = auditContent.indexOf(flaggedHeader);
    const fEnd = auditContent.indexOf(flaggedEnd);
    if (fStart !== -1 && fEnd !== -1) {
        auditContent = auditContent.substring(0, fStart + flaggedHeader.length) + flaggedTable + auditContent.substring(fEnd);
    }

    // Update Direct Dependencies
    const directHeader = "## Direct Dependencies\n\n";
    const directEnd = "\n\n## All Dependencies";
    const dStart = auditContent.indexOf(directHeader);
    const dEnd = auditContent.indexOf(directEnd);
    if (dStart !== -1 && dEnd !== -1) {
        auditContent = auditContent.substring(0, dStart + directHeader.length) + directTable + auditContent.substring(dEnd);
    }

    // Update All Dependencies
    const allHeader = "<summary>Click to expand full dependency list</summary>\n\n";
    const allEnd = "\n\n</details>";
    const aStart = auditContent.indexOf(allHeader);
    const aEnd = auditContent.indexOf(allEnd);
    if (aStart !== -1 && aEnd !== -1) {
        auditContent = auditContent.substring(0, aStart + allHeader.length) + allTable + auditContent.substring(aEnd);
    }

    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
