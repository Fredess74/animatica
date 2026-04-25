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
    return JSON.parse(output);
}

function processLicenseData(licenseData, directDeps) {
    const pkgToLicenseInfo = {};
    const allUniquePackages = new Set();

    for (const [licenseName, packages] of Object.entries(licenseData)) {
        for (const pkg of packages) {
            allUniquePackages.add(pkg.name);
            pkgToLicenseInfo[pkg.name] = {
                license: licenseName,
                version: pkg.versions ? pkg.versions[0] : (pkg.version || 'unknown')
            };
        }
    }

    const sortedDirectDeps = Object.keys(directDeps).sort();
    const sortedAllDeps = Array.from(allUniquePackages).sort();

    const flagged = [];
    for (const dep of sortedAllDeps) {
        const info = pkgToLicenseInfo[dep];
        const license = info ? info.license : 'Unknown';
        if (license !== 'MIT' && !license.includes('MIT')) {
            flagged.push({
                name: dep,
                version: info ? info.version : 'unknown',
                license: license,
                type: directDeps[dep] ? '**Direct**' : 'Transitive'
            });
        }
    }

    return {
        pkgToLicenseInfo,
        allUniquePackages,
        sortedDirectDeps,
        sortedAllDeps,
        flagged
    };
}

function main() {
    const licenseData = loadLicenses();
    const directDeps = {};
    const packageJsons = getPackageJsons();

    for (const pjPath of packageJsons) {
        try {
            const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
            const deps = { ...pj.dependencies, ...pj.devDependencies, ...pj.peerDependencies };

            for (const [name, version] of Object.entries(deps)) {
                if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                    continue;
                }
                if (!directDeps[name]) {
                    directDeps[name] = new Set();
                }
                directDeps[name].add(pj.name || 'root');
            }
        } catch (e) {
            console.error(`Error reading ${pjPath}:`, e.message);
        }
    }

    const {
        pkgToLicenseInfo,
        allUniquePackages,
        sortedDirectDeps,
        sortedAllDeps,
        flagged
    } = processLicenseData(licenseData, directDeps);

    const today = new Date().toISOString().split('T')[0];
    const projectLicenseExists = fs.existsSync('LICENSE');

    let content = `# License Audit\n\n`;
    content += `**Date:** ${today}\n`;
    content += `**Auditor:** Jules (License Auditor)\n\n`;

    content += `## Summary\n\n`;
    content += `Total dependencies found: ${allUniquePackages.size}\n`;
    content += `Direct dependencies: ${sortedDirectDeps.length}\n`;
    content += `Transitive dependencies: ${allUniquePackages.size - sortedDirectDeps.length}\n\n`;

    content += `## Project License\n\n`;
    content += `- **File:** \`LICENSE\`\n`;
    content += `- **Status:** ${projectLicenseExists ? 'Present' : 'Missing'}\n`;
    content += `- **License:** MIT\n\n`;

    content += `## Source Code Headers\n\n`;
    const engineIndexFile = 'packages/engine/src/index.ts';
    content += `- **Checked:** \`${engineIndexFile}\`\n`;
    if (fs.existsSync(engineIndexFile)) {
        const engineIndex = fs.readFileSync(engineIndexFile, 'utf8');
        const hasHeader = engineIndex.includes('LICENSE') || engineIndex.includes('Copyright');
        content += `- **Result:** ${hasHeader ? 'License header found.' : 'No license header found.'}\n\n`;
    } else {
        content += `- **Result:** File not found.\n\n`;
    }

    content += `## Flagged Licenses (Non-MIT)\n\n`;
    content += `The following dependencies have non-MIT licenses:\n\n`;
    content += `| Dependency | Version | License | Type |\n`;
    content += `| --- | --- | --- | --- |\n`;
    for (const f of flagged) {
        content += `| ${f.name} | ${f.version} | ${f.license} | ${f.type} |\n`;
    }
    content += `\n`;

    content += `## Direct Dependencies\n\n`;
    content += `| Dependency | License | Used In |\n`;
    content += `| --- | --- | --- |\n`;
    for (const dep of sortedDirectDeps) {
        const info = pkgToLicenseInfo[dep];
        const license = info ? info.license : 'Unknown';
        const usedIn = Array.from(directDeps[dep]).sort().join(', ');
        content += `| ${dep} | ${license} | ${usedIn} |\n`;
    }
    content += `\n`;

    content += `## All Dependencies (including transitive)\n\n`;
    content += `<details>\n<summary>Click to expand full dependency list</summary>\n\n`;
    content += `| Dependency | Version | License |\n`;
    content += `| --- | --- | --- |\n`;
    for (const dep of sortedAllDeps) {
        const info = pkgToLicenseInfo[dep];
        const license = info ? info.license : 'Unknown';
        const version = info ? info.version : 'unknown';
        content += `| ${dep} | ${version} | ${license} |\n`;
    }
    content += `\n</details>\n`;

    fs.writeFileSync('docs/LICENSE_AUDIT.md', content);
    console.log('Audit report generated in docs/LICENSE_AUDIT.md');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { processLicenseData };
}

if (require.main === module) {
    main();
}
