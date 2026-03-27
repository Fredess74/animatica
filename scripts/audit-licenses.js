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
    const pkgToVersion = {};
    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            pkgToLicense[pkg.name] = licenseName;
            pkgToVersion[pkg.name] = pkg.versions ? pkg.versions[0] : 'Unknown';
        }
    }
    return { pkgToLicense, pkgToVersion };
}

function main() {
    const { pkgToLicense, pkgToVersion } = loadLicenses();

    const allDirectDepsMap = {};
    const directDepsSet = new Set();

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));

        const deps = pj.dependencies || {};
        const devDeps = pj.devDependencies || {};
        const peerDeps = pj.peerDependencies || {};

        for (const [name, version] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            if (!allDirectDepsMap[name]) {
                allDirectDepsMap[name] = new Set();
            }
            allDirectDepsMap[name].add(pj.name || 'root');
            directDepsSet.add(name);
        }
    }

    const sortedDirectDeps = Object.keys(allDirectDepsMap).sort();

    // Direct Dependencies Table
    let directTable = "| Dependency | License | Used In |\n";
    directTable += "| --- | --- | --- |\n";

    for (const dep of sortedDirectDeps) {
        const license = pkgToLicense[dep] || 'Unknown';
        const usedIn = Array.from(allDirectDepsMap[dep]).sort().join(', ');
        directTable += `| ${dep} | ${license} | ${usedIn} |\n`;
    }

    // All Dependencies and Flagged
    const everySingleDep = Object.keys(pkgToLicense).filter(d => !d.startsWith('@Animatica/')).sort();

    const flaggedTableRows = [];
    let allTable = "| Dependency | Version | License |\n";
    allTable += "| --- | --- | --- |\n";

    for (const dep of everySingleDep) {
        const license = pkgToLicense[dep] || 'Unknown';
        const version = pkgToVersion[dep] || 'Unknown';

        if (license !== 'MIT' && !license.includes('MIT') && license !== 'MIT-0') {
            flaggedTableRows.push(`| ${dep} | ${version} | ${license} | ${directDepsSet.has(dep) ? '**Direct**' : 'Transitive'} |`);
        }

        allTable += `| ${dep} | ${version} | ${license} |\n`;
    }

    let flaggedTable = "| Dependency | Version | License | Type |\n";
    flaggedTable += "| --- | --- | --- | --- |\n";
    flaggedTable += flaggedTableRows.join('\n') + '\n';

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    let auditContent = fs.readFileSync(auditPath, 'utf8');

    // Update Flagged Licenses section
    const flaggedSectionStart = "## Flagged Licenses (Non-MIT)\n\nThe following dependencies have non-MIT licenses:\n\n";
    const flaggedSectionEnd = "\n\n## Direct Dependencies";
    const fStartIndex = auditContent.indexOf(flaggedSectionStart);
    const fEndIndex = auditContent.indexOf(flaggedSectionEnd);
    if (fStartIndex !== -1 && fEndIndex !== -1) {
        auditContent = auditContent.substring(0, fStartIndex + flaggedSectionStart.length) +
                       flaggedTable +
                       auditContent.substring(fEndIndex);
    }

    // Update Direct Dependencies section
    const directSectionStart = "## Direct Dependencies\n\n";
    const directSectionEnd = "\n\n## All Dependencies";
    const dStartIndex = auditContent.indexOf(directSectionStart);
    const dEndIndex = auditContent.indexOf(directSectionEnd);
    if (dStartIndex !== -1 && dEndIndex !== -1) {
        auditContent = auditContent.substring(0, dStartIndex + directSectionStart.length) +
                       directTable +
                       auditContent.substring(dEndIndex);
    }

    // Update All Dependencies section
    const allSectionStart = "<summary>Click to expand full dependency list</summary>\n\n";
    const allSectionEnd = "\n\n</details>";
    const aStartIndex = auditContent.indexOf(allSectionStart);
    const aEndIndex = auditContent.indexOf(allSectionEnd);
    if (aStartIndex !== -1 && aEndIndex !== -1) {
        auditContent = auditContent.substring(0, aStartIndex + allSectionStart.length) +
                       allTable +
                       auditContent.substring(aEndIndex);
    }

    // Update Summary
    const totalDeps = everySingleDep.length;
    const directDepsCount = directDepsSet.size;
    const transitiveDepsCount = totalDeps - directDepsCount;

    auditContent = auditContent.replace(/Total dependencies found: \d+/, `Total dependencies found: ${totalDeps}`);
    auditContent = auditContent.replace(/Direct dependencies: \d+/, `Direct dependencies: ${directDepsCount}`);
    auditContent = auditContent.replace(/Transitive dependencies: \d+/, `Transitive dependencies: ${transitiveDepsCount}`);

    // Update Date
    const dateRegex = /\*\*Date:\*\* .*/;
    const today = new Date().toISOString().split('T')[0];
    auditContent = auditContent.replace(dateRegex, `**Date:** ${today}`);

    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
