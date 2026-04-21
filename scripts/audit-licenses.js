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

    const pkgToLicense = {};
    const allPkgs = [];
    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            pkgToLicense[pkg.name] = {
                license: licenseName,
                version: pkg.versions ? pkg.versions[0] : 'Unknown'
            };
            allPkgs.push({
                name: pkg.name,
                license: licenseName,
                version: pkg.versions ? pkg.versions[0] : 'Unknown'
            });
        }
    }
    return { pkgToLicense, allPkgs };
}

function main() {
    const { pkgToLicense, allPkgs } = loadLicenses();

    const directDeps = {};
    const allDepNames = new Set();

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));

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
            directDeps[name].add(pj.name || 'root');
            allDepNames.add(name);
        }
    }

    const sortedDirectDeps = Object.keys(directDeps).sort();
    const totalDeps = allPkgs.length;
    const directDepCount = sortedDirectDeps.length;
    const transitiveDepCount = totalDeps - directDepCount;

    // Summary Section
    const summaryContent = `Total dependencies found: ${totalDeps}\nDirect dependencies: ${directDepCount}\nTransitive dependencies: ${transitiveDepCount}`;

    // Flagged Licenses Section
    let flaggedTable = "| Dependency | Version | License | Type |\n";
    flaggedTable += "| --- | --- | --- | --- |\n";

    const sortedAllPkgs = allPkgs.sort((a, b) => a.name.localeCompare(b.name));

    for (const pkg of sortedAllPkgs) {
        const license = pkg.license;
        if (license !== 'MIT' && !license.includes('MIT')) {
            const isDirect = directDeps[pkg.name] ? "**Direct**" : "Transitive";
            flaggedTable += `| ${pkg.name} | ${pkg.version} | ${license} | ${isDirect} |\n`;
        }
    }

    // Direct Dependencies Section
    let directTable = "| Dependency | License | Used In |\n";
    directTable += "| --- | --- | --- | --- |\n";
    for (const name of sortedDirectDeps) {
        const info = pkgToLicense[name] || { license: 'Unknown', version: 'Unknown' };
        const usedIn = Array.from(directDeps[name]).sort().join(', ');
        directTable += `| ${name} | ${info.license} | ${usedIn} |\n`;
    }

    // All Dependencies Section
    let allTable = "<details>\n<summary>Click to expand full dependency list</summary>\n\n";
    allTable += "| Dependency | Version | License |\n";
    allTable += "| --- | --- | --- |\n";
    for (const pkg of sortedAllPkgs) {
        allTable += `| ${pkg.name} | ${pkg.version} | ${pkg.license} |\n`;
    }
    allTable += "\n</details>";

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    let auditContent = fs.readFileSync(auditPath, 'utf8');

    // Update Summary
    const summaryHeader = "## Summary\n\n";
    const summaryEnd = "\n\n## Project License";
    const sStart = auditContent.indexOf(summaryHeader);
    const sEnd = auditContent.indexOf(summaryEnd);
    if (sStart !== -1 && sEnd !== -1) {
        auditContent = auditContent.substring(0, sStart + summaryHeader.length) + summaryContent + auditContent.substring(sEnd);
    }

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
    const directEnd = "\n\n## All Dependencies (including transitive)";
    const dStart = auditContent.indexOf(directHeader);
    const dEnd = auditContent.indexOf(directEnd);
    if (dStart !== -1 && dEnd !== -1) {
        auditContent = auditContent.substring(0, dStart + directHeader.length) + directTable + auditContent.substring(dEnd);
    }

    // Update All Dependencies
    const allHeader = "## All Dependencies (including transitive)\n\n";
    const aStart = auditContent.indexOf(allHeader);
    if (aStart !== -1) {
        auditContent = auditContent.substring(0, aStart + allHeader.length) + allTable + "\n";
    }

    // Update Date
    const dateRegex = /\*\*Date:\*\* .*/;
    const today = new Date().toISOString().split('T')[0];
    auditContent = auditContent.replace(dateRegex, `**Date:** ${today}`);

    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
