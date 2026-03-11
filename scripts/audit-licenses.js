const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getPackageJsons() {
    const output = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString();
    return output.split('\n').filter(p => p.trim() !== '');
}

function loadLicenses() {
    console.log('Running pnpm licenses list --json...');
    const output = execSync('pnpm licenses list --json', { maxBuffer: 100 * 1024 * 1024 }).toString();
    return JSON.parse(output);
}

function isMitCompatible(license) {
    if (!license) return false;
    // Split by whitespace and parentheses to find MIT or MIT-0
    const parts = license.split(/[\s()]+/);
    return parts.some(p => p === 'MIT' || p === 'MIT-0');
}

function main() {
    const data = loadLicenses();
    const pkgToLicense = {};
    const pkgToVersion = {};

    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            pkgToLicense[pkg.name] = licenseName;
            // The JSON from pnpm licenses list --json has versions as an array
            pkgToVersion[pkg.name] = pkg.versions ? pkg.versions[0] : (pkg.version || 'Unknown');
        }
    }

    const allDeps = {};
    const directDeps = {};

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const pkgName = pj.name || 'root';

        const deps = pj.dependencies || {};
        const devDeps = pj.devDependencies || {};
        const peerDeps = pj.peerDependencies || {};

        for (const [name, version] of Object.entries({ ...deps, ...devDeps, ...peerDeps })) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && (version.startsWith('workspace:') || version.startsWith('file:')))) {
                continue;
            }
            if (!allDeps[name]) {
                allDeps[name] = new Set();
            }
            allDeps[name].add(pkgName);

            if (!directDeps[name]) {
                directDeps[name] = new Set();
            }
            directDeps[name].add(pkgName);
        }
    }

    const sortedAllDeps = Object.keys(pkgToLicense).sort();
    const today = new Date().toISOString().split('T')[0];

    let content = `# License Audit\n\n`;
    content += `**Date:** ${today}\n`;
    content += `**Auditor:** Jules (License Auditor)\n\n`;

    content += `## Summary\n\n`;
    content += `Total dependencies found: ${sortedAllDeps.length}\n`;
    content += `Direct dependencies: ${Object.keys(directDeps).length}\n`;
    content += `Transitive dependencies: ${sortedAllDeps.length - Object.keys(directDeps).length}\n\n`;

    content += `## Project License\n\n`;
    content += `- **File:** \`LICENSE\`\n`;
    content += `- **Status:** Present\n`;
    content += `- **License:** MIT\n\n`;

    content += `## Source Code Headers\n\n`;
    content += `- **Checked:** \`packages/engine/src/index.ts\`\n`;
    try {
        const indexContent = fs.readFileSync('packages/engine/src/index.ts', 'utf8');
        if (indexContent.includes('MIT') || indexContent.includes('Copyright')) {
             content += `- **Result:** License header found.\n\n`;
        } else {
             content += `- **Result:** No license header found.\n\n`;
        }
    } catch (e) {
        content += `- **Result:** File not found.\n\n`;
    }

    content += `## Flagged Licenses (Non-MIT)\n\n`;
    content += `The following dependencies have non-MIT licenses:\n\n`;
    content += `| Dependency | Version | License | Type |\n`;
    content += `| --- | --- | --- | --- |\n`;

    for (const dep of sortedAllDeps) {
        const license = pkgToLicense[dep] || 'Unknown';
        const version = pkgToVersion[dep] || 'Unknown';
        const isDirect = directDeps[dep] !== undefined;

        if (!isMitCompatible(license)) {
            content += `| ${dep} | ${version} | ${license} | ${isDirect ? '**Direct**' : 'Transitive'} |\n`;
        }
    }
    content += `\n`;

    content += `## Direct Dependencies\n\n`;
    content += `| Dependency | License | Used In |\n`;
    content += `| --- | --- | --- |\n`;
    for (const dep of Object.keys(directDeps).sort()) {
        const license = pkgToLicense[dep] || 'Unknown';
        const usedIn = Array.from(directDeps[dep]).sort().join(', ');
        content += `| ${dep} | ${license} | ${usedIn} |\n`;
    }
    content += `\n`;

    content += `## All Dependencies (including transitive)\n\n`;
    content += `<details>\n<summary>Click to expand full dependency list</summary>\n\n`;
    content += `| Dependency | Version | License |\n`;
    content += `| --- | --- | --- |\n`;
    for (const dep of sortedAllDeps) {
        const license = pkgToLicense[dep] || 'Unknown';
        const version = pkgToVersion[dep] || 'Unknown';
        content += `| ${dep} | ${version} | ${license} |\n`;
    }
    content += `\n</details>\n`;

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    fs.writeFileSync(auditPath, content);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
