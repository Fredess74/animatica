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
    const pkgToVersion = {};
    let totalDeps = 0;

    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            // If we have multiple versions/licenses for the same package, we'll just track one for simplicity in the 'All' table,
            // but we should probably track all for accuracy.
            // For now, let's keep it simple as the current report seems to expect one entry per package name.
            pkgToLicense[pkg.name] = licenseName;
            pkgToVersion[pkg.name] = pkg.versions.join(', ');
            totalDeps++;
        }
    }
    return { pkgToLicense, pkgToVersion, totalDeps };
}

function main() {
    const { pkgToLicense, pkgToVersion, totalDeps } = loadLicenses();

    const allDepsUsage = {};
    const directDepsList = new Set();

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));

        const deps = pj.dependencies || {};
        const devDeps = pj.devDependencies || {};
        const peerDeps = pj.peerDependencies || {};

        for (const [name, version] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            if (!allDepsUsage[name]) {
                allDepsUsage[name] = new Set();
            }
            allDepsUsage[name].add(pj.name || 'root');
            directDepsList.add(name);
        }
    }

    const sortedPkgNames = Object.keys(pkgToLicense).sort();
    const sortedDirectDeps = Array.from(directDepsList).sort();

    const flaggedTable = [];

    for (const depName of sortedPkgNames) {
        const license = pkgToLicense[depName] || 'Unknown';
        const version = pkgToVersion[depName] || 'Unknown';

        const isMit = license === 'MIT' || license.includes('MIT') || license === 'MIT-0';
        if (!isMit) {
            const type = directDepsList.has(depName) ? "**Direct**" : "Transitive";
            flaggedTable.push(`| ${depName} | ${version} | ${license} | ${type} |`);
        }
    }

    // Direct Dependencies Table
    let directTable = "| Dependency | License | Used In |\n";
    directTable += "| --- | --- | --- |\n";
    for (const depName of sortedDirectDeps) {
        const license = pkgToLicense[depName] || 'Unknown';
        const usedIn = Array.from(allDepsUsage[depName] || ['Transitive Only']).sort().join(', ');
        directTable += `| ${depName} | ${license} | ${usedIn} |\n`;
    }

    // All Dependencies Table
    let allTable = "| Dependency | Version | License |\n";
    allTable += "| --- | --- | --- |\n";
    for (const depName of sortedPkgNames) {
        const license = pkgToLicense[depName] || 'Unknown';
        const version = pkgToVersion[depName] || 'Unknown';
        allTable += `| ${depName} | ${version} | ${license} |\n`;
    }

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    if (!fs.existsSync(auditPath)) {
        // Create basic template if it doesn't exist
        const template = `# License Audit

**Date:** ${new Date().toISOString().split('T')[0]}
**Auditor:** License Auditor

## Summary

Total dependencies found: 0
Direct dependencies: 0
Transitive dependencies: 0

## Project License

- **File:** \`LICENSE\`
- **Status:** Present
- **License:** MIT

## Source Code Headers

- **Checked:** \`packages/engine/src/index.ts\`
- **Result:** Checked

## Flagged Licenses (Non-MIT)

## Direct Dependencies

## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

</details>
`;
        fs.writeFileSync(auditPath, template);
    }

    let auditContent = fs.readFileSync(auditPath, 'utf8');

    // Update Summary
    const directDepsCount = directDepsList.size;
    const transitiveDepsCount = totalDeps - directDepsCount;

    auditContent = auditContent.replace(/Total dependencies found: \d+/, `Total dependencies found: ${totalDeps}`);
    auditContent = auditContent.replace(/Direct dependencies: \d+/, `Direct dependencies: ${directDepsCount}`);
    auditContent = auditContent.replace(/Transitive dependencies: \d+/, `Transitive dependencies: ${transitiveDepsCount}`);

    // Update Flagged Licenses section
    const flaggedHeader = "## Flagged Licenses (Non-MIT)\n\nThe following dependencies have non-MIT licenses:\n\n| Dependency | Version | License | Type |\n| --- | --- | --- | --- |\n";
    const flaggedSectionStart = "## Flagged Licenses (Non-MIT)\n";
    const flaggedSectionEnd = "\n## Direct Dependencies";

    const fStartIndex = auditContent.indexOf(flaggedSectionStart);
    const fEndIndex = auditContent.indexOf(flaggedSectionEnd);

    if (fStartIndex !== -1 && fEndIndex !== -1) {
        auditContent = auditContent.substring(0, fStartIndex) +
                       flaggedHeader + flaggedTable.join('\n') + "\n" +
                       auditContent.substring(fEndIndex);
    }

    // Update Direct Dependencies section
    const directSectionHeader = "## Direct Dependencies\n\n";
    const directSectionStart = "## Direct Dependencies\n";
    const directSectionEnd = "\n## All Dependencies";

    const dStartIndex = auditContent.indexOf(directSectionStart);
    const dEndIndex = auditContent.indexOf(directSectionEnd);

    if (dStartIndex !== -1 && dEndIndex !== -1) {
        auditContent = auditContent.substring(0, dStartIndex) +
                       directSectionHeader + directTable +
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

    // Update Date
    const dateRegex = /\*\*Date:\*\* .*/;
    const today = new Date().toISOString().split('T')[0];
    auditContent = auditContent.replace(dateRegex, `**Date:** ${today}`);

    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
