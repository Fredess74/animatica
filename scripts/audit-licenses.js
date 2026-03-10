const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Finds all package.json files in the workspace, excluding node_modules.
 */
function getPackageJsons() {
    const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
    return output.split('\n').filter(p => p.trim() !== '');
}

/**
 * Main function to audit licenses and generate the report.
 */
function main() {
    console.log('Gathering direct dependencies from package.json files...');
    const directDeps = {};
    const packageFiles = getPackageJsons();

    for (const pf of packageFiles) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pf, 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
            for (const [name, version] of Object.entries(deps)) {
                // Skip internal workspace packages
                if (name.startsWith('@Animatica/')) continue;
                if (typeof version === 'string' && version.startsWith('workspace:')) continue;

                if (!directDeps[name]) {
                    directDeps[name] = {
                        usedIn: new Set(),
                        version: version
                    };
                }
                directDeps[name].usedIn.add(pkg.name || 'root');
            }
        } catch (e) {
            console.warn(`Could not parse ${pf}: ${e.message}`);
        }
    }

    console.log('Running pnpm licenses list --json...');
    let licensesData;
    try {
        const licensesOutput = execSync('pnpm licenses list --json', { maxBuffer: 20 * 1024 * 1024 }).toString();
        licensesData = JSON.parse(licensesOutput);
    } catch (e) {
        console.error('Failed to run pnpm licenses list:', e.message);
        process.exit(1);
    }

    const allDeps = [];
    const flaggedDeps = [];
    const directDepsList = [];

    for (const [license, packages] of Object.entries(licensesData)) {
        for (const pkg of packages) {
            // Acceptable licenses are MIT and MIT-0 per project rules.
            // Support dual/multi-license strings (e.g., "MIT OR Apache-2.0" or "(MIT AND BSD-3-Clause)")
            const words = license.split(/[\s()]+/).map(w => w.trim());
            const isMIT = words.some(w => w === 'MIT' || w === 'MIT-0');

            const isDirect = !!directDeps[pkg.name];

            const depInfo = {
                name: pkg.name,
                version: pkg.versions ? pkg.versions[0] : 'unknown',
                license: license,
                isDirect: isDirect,
                usedIn: isDirect ? Array.from(directDeps[pkg.name].usedIn).sort() : []
            };

            allDeps.push(depInfo);

            if (!isMIT) {
                flaggedDeps.push(depInfo);
            }

            if (isDirect) {
                directDepsList.push(depInfo);
            }
        }
    }

    // Sort alphabetically
    allDeps.sort((a, b) => a.name.localeCompare(b.name));
    flaggedDeps.sort((a, b) => a.name.localeCompare(b.name));
    directDepsList.sort((a, b) => a.name.localeCompare(b.name));

    const totalDeps = allDeps.length;
    const directCount = directDepsList.length;
    const transitiveCount = totalDeps - directCount;

    let content = `# License Audit\n\n`;
    content += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
    content += `**Auditor:** Jules (License Auditor)\n\n`;

    content += `## Summary\n\n`;
    content += `This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.\n\n`;
    content += `Total dependencies found: ${totalDeps}\n`;
    content += `Direct dependencies: ${directCount}\n`;
    content += `Transitive dependencies: ${transitiveCount}\n\n`;

    content += `## Project License\n\n`;
    content += `- **File:** \`LICENSE\`\n`;
    const hasLicenseFile = fs.existsSync('LICENSE');
    content += `- **Status:** ${hasLicenseFile ? 'Present' : 'Missing'}\n`;
    content += `- **License:** MIT\n\n`;

    content += `## Source Code Headers\n\n`;
    content += `- **Checked:** \`packages/engine/src/index.ts\`\n`;
    let hasHeader = false;
    if (fs.existsSync('packages/engine/src/index.ts')) {
        const indexContent = fs.readFileSync('packages/engine/src/index.ts', 'utf8');
        hasHeader = indexContent.includes('Copyright') || indexContent.includes('License');
    }
    content += `- **Result:** ${hasHeader ? 'License header found.' : 'No license header found.'}\n\n`;

    content += `## Flagged Licenses (Non-MIT)\n\n`;
    content += `The following dependencies have non-MIT licenses:\n\n`;
    content += `| Dependency | Version | License | Type |\n`;
    content += `| --- | --- | --- | --- |\n`;
    for (const dep of flaggedDeps) {
        content += `| ${dep.name} | ${dep.version} | ${dep.license} | ${dep.isDirect ? '**Direct**' : 'Transitive'} |\n`;
    }
    content += `\n`;

    content += `## Direct Dependencies\n\n`;
    content += `| Dependency | License | Used In |\n`;
    content += `| --- | --- | --- |\n`;
    for (const dep of directDepsList) {
        content += `| ${dep.name} | ${dep.license} | ${dep.usedIn.join(', ')} |\n`;
    }
    content += `\n`;

    content += `## All Dependencies (including transitive)\n\n`;
    content += `<details>\n<summary>Click to expand full dependency list</summary>\n\n`;
    content += `| Dependency | Version | License |\n`;
    content += `| --- | --- | --- |\n`;
    for (const dep of allDeps) {
        content += `| ${dep.name} | ${dep.version} | ${dep.license} |\n`;
    }
    content += `\n</details>\n`;

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    fs.writeFileSync(auditPath, content);
    console.log('Audit report generated in docs/LICENSE_AUDIT.md');
}

main();
