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

function main() {
    const pkgToLicense = loadLicenses();

    const allDeps = {};

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));

        const deps = pj.dependencies || {};
        const devDeps = pj.devDependencies || {};
        const peerDeps = pj.peerDependencies || {};

        for (const [name, version] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            if (!allDeps[name]) {
                allDeps[name] = new Set();
            }
            allDeps[name].add(pj.name || 'root');
        }
    }

    const sortedDeps = Object.keys(allDeps).sort();

    let table = "| Dependency | License | Flag | Used In |\n";
    table += "| --- | --- | --- | --- |\n";

    const flagged = [];

    for (const dep of sortedDeps) {
        const license = pkgToLicense[dep] || 'Unknown';
        let flag = "";
        if (license !== 'MIT' && !license.includes('MIT')) {
            flag = "⚠️ Non-MIT";
            flagged.push(`- **\`${dep}\`**: ${license}`);
        }

        const usedIn = Array.from(allDeps[dep]).sort().join(', ');
        table += `| ${dep} | ${license} | ${flag} | ${usedIn} |\n`;
    }

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    let auditContent = fs.readFileSync(auditPath, 'utf8');

    // Update Dependency Licenses section
    // Look for the table or the header
    const depSectionStart = "## Dependency Licenses\n\nThe following dependencies were audited:\n\n";
    const depSectionEnd = "\n\n## Flagged Licenses";

    const startIndex = auditContent.indexOf(depSectionStart);
    const endIndex = auditContent.indexOf(depSectionEnd);

    if (startIndex !== -1 && endIndex !== -1) {
        auditContent = auditContent.substring(0, startIndex + depSectionStart.length) +
                       table +
                       auditContent.substring(endIndex);
    }

    // Update Flagged Licenses section
    const flaggedSectionStart = "## Flagged Licenses (Non-MIT/Apache-2.0)\n\n";
    const flaggedSectionEnd = "\n\n## Missing Licenses";

    const fStartIndex = auditContent.indexOf(flaggedSectionStart);
    const fEndIndex = auditContent.indexOf(flaggedSectionEnd);

    if (fStartIndex !== -1 && fEndIndex !== -1) {
        auditContent = auditContent.substring(0, fStartIndex + flaggedSectionStart.length) +
                       flagged.join('\n') +
                       auditContent.substring(fEndIndex);
    }

    // Update Date
    const dateRegex = /\*\*Date:\*\* .*/;
    const today = new Date().toISOString().split('T')[0];
    auditContent = auditContent.replace(dateRegex, `**Date:** ${today}`);

    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
