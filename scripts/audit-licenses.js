const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Finds all package.json files in the repository, excluding node_modules.
 */
function getPackageJsons() {
    try {
        const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
        return output.split('\n').filter(p => p.trim() !== '');
    } catch (err) {
        console.error('Error finding package.json files:', err.message);
        return [];
    }
}

/**
 * Loads license information using pnpm.
 */
function loadLicenses() {
    console.log('Running pnpm licenses list --json...');
    try {
        // Increased maxBuffer to 50MB to handle large monorepo output
        const output = execSync('pnpm licenses list --json', { maxBuffer: 50 * 1024 * 1024 }).toString();
        return JSON.parse(output);
    } catch (err) {
        console.error('Error running pnpm licenses:', err.message);
        return {};
    }
}

function main() {
    const licensesData = loadLicenses();
    const pkgToInfo = {}; // name -> version -> { license, type }

    // Flatten license data and handle multiple versions/formats
    for (const [licenseName, packages] of Object.entries(licensesData)) {
        if (!Array.isArray(packages)) continue;
        for (const pkg of packages) {
            if (!pkgToInfo[pkg.name]) {
                pkgToInfo[pkg.name] = {};
            }

            // Handle both versions array and single version string
            const versions = pkg.versions || (pkg.version ? [pkg.version] : []);
            for (const ver of versions) {
                pkgToInfo[pkg.name][ver] = {
                    license: licenseName,
                    type: 'Transitive' // Default
                };
            }
        }
    }

    const directDeps = {}; // name -> Set(usedIn)

    for (const pjPath of getPackageJsons()) {
        try {
            const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
            const allDirect = { ...(pj.dependencies || {}), ...(pj.devDependencies || {}), ...(pj.peerDependencies || {}) };

            for (const [name, version] of Object.entries(allDirect)) {
                // Ignore workspace packages
                if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                    continue;
                }
                if (!directDeps[name]) {
                    directDeps[name] = new Set();
                }
                directDeps[name].add(pj.name || 'root');

                // Mark as Direct in pkgToInfo
                if (pkgToInfo[name]) {
                    for (const ver in pkgToInfo[name]) {
                        pkgToInfo[name][ver].type = 'Direct';
                    }
                }
            }
        } catch (err) {
            console.error(`Error processing ${pjPath}:`, err.message);
        }
    }

    // Prepare Flagged Licenses (Non-MIT)
    const nonMitLicenses = Object.keys(pkgToInfo).sort().flatMap(name => {
        return Object.keys(pkgToInfo[name]).sort().filter(ver => {
            const l = pkgToInfo[name][ver].license;
            return l !== 'MIT' && !l.includes('MIT');
        }).map(ver => {
            const info = pkgToInfo[name][ver];
            return `| ${name} | ${ver} | ${info.license} | ${info.type === 'Direct' ? '**Direct**' : 'Transitive'} |`;
        });
    });

    // Prepare Direct Dependencies Table
    const directRows = Object.keys(directDeps).sort().map(name => {
        const licenses = pkgToInfo[name] ? Array.from(new Set(Object.values(pkgToInfo[name]).map(i => i.license))).sort().join(', ') : 'Unknown';
        const usedIn = Array.from(directDeps[name]).sort().join(', ');
        return `| ${name} | ${licenses} | ${usedIn} |`;
    });

    // Prepare All Dependencies Table
    const allRows = Object.keys(pkgToInfo).sort().flatMap(name => {
        return Object.keys(pkgToInfo[name]).sort().map(ver => {
            return `| ${name} | ${ver} | ${pkgToInfo[name][ver].license} |`;
        });
    });

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    let auditContent = "";

    if (fs.existsSync(auditPath)) {
        auditContent = fs.readFileSync(auditPath, 'utf8');
    } else {
        // Fallback template if file doesn't exist
        auditContent = `# License Audit\n\n**Date:** \n**Auditor:** Jules (License Auditor)\n\n## Summary\n\nTotal dependencies found: 0\nDirect dependencies: 0\nTransitive dependencies: 0\n\n## Project License\n\n- **File:** \`LICENSE\`\n- **Status:** Present\n- **License:** MIT\n\n## Source Code Headers\n\n- **Checked:** \`packages/engine/src/index.ts\`\n- **Result:** No license header found.\n\n## Flagged Licenses (Non-MIT)\n\n## Direct Dependencies\n\n## All Dependencies (including transitive)\n`;
    }

    // Update Date
    const today = new Date().toISOString().split('T')[0];
    auditContent = auditContent.replace(/\*\*Date:\*\* .*/, `**Date:** ${today}`);

    // Update Summary
    const totalDeps = allRows.length;
    const directCount = Object.keys(directDeps).length;
    auditContent = auditContent.replace(/Total dependencies found: \d+/, `Total dependencies found: ${totalDeps}`);
    auditContent = auditContent.replace(/Direct dependencies: \d+/, `Direct dependencies: ${directCount}`);
    auditContent = auditContent.replace(/Transitive dependencies: \d+/, `Transitive dependencies: ${totalDeps - directCount}`);

    // Update Flagged Licenses
    const flaggedHeader = "## Flagged Licenses (Non-MIT)\n\nThe following dependencies have non-MIT licenses:\n\n| Dependency | Version | License | Type |\n| --- | --- | --- | --- |\n";
    const flaggedSectionStart = "## Flagged Licenses (Non-MIT)";
    const flaggedSectionEnd = "## Direct Dependencies";

    const fStart = auditContent.indexOf(flaggedSectionStart);
    const fEnd = auditContent.indexOf(flaggedSectionEnd);
    if (fStart !== -1 && fEnd !== -1) {
        auditContent = auditContent.substring(0, fStart) +
                       flaggedHeader + nonMitLicenses.join('\n') + '\n\n' +
                       auditContent.substring(fEnd);
    } else if (fStart !== -1) {
        auditContent = auditContent.substring(0, fStart) +
                       flaggedHeader + nonMitLicenses.join('\n') + '\n\n';
    }

    // Update Direct Dependencies
    const directHeader = "## Direct Dependencies\n\n| Dependency | License | Used In |\n| --- | --- | --- |\n";
    const directSectionStart = "## Direct Dependencies";
    const directSectionEnd = "## All Dependencies";

    const dStart = auditContent.indexOf(directSectionStart);
    const dEnd = auditContent.indexOf(directSectionEnd);
    if (dStart !== -1 && dEnd !== -1) {
        auditContent = auditContent.substring(0, dStart) +
                       directHeader + directRows.join('\n') + '\n\n' +
                       auditContent.substring(dEnd);
    } else if (dStart !== -1) {
        auditContent = auditContent.substring(0, dStart) +
                       directHeader + directRows.join('\n') + '\n\n';
    }

    // Update All Dependencies
    const allHeader = "## All Dependencies (including transitive)\n\n<details>\n<summary>Click to expand full dependency list</summary>\n\n| Dependency | Version | License |\n| --- | --- | --- |\n";
    const allSectionStart = "## All Dependencies (including transitive)";

    const aStart = auditContent.indexOf(allSectionStart);
    if (aStart !== -1) {
        auditContent = auditContent.substring(0, aStart) +
                       allHeader + allRows.join('\n') + '\n\n</details>\n';
    }

    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
