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
    return JSON.parse(output);
}

function main() {
    const licenseData = loadLicenses();
    const pkgList = [];

    for (const [license, packages] of Object.entries(licenseData)) {
        for (const pkg of packages) {
            for (const version of pkg.versions) {
                pkgList.push({
                    name: pkg.name,
                    version,
                    license
                });
            }
        }
    }

    const directDeps = {};
    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const deps = { ...(pj.dependencies || {}), ...(pj.devDependencies || {}), ...(pj.peerDependencies || {}) };

        for (const [name, version] of Object.entries(deps)) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            if (!directDeps[name]) {
                directDeps[name] = new Set();
            }
            directDeps[name].add(pj.name || 'root');
        }
    }

    // Sort by name, then version
    pkgList.sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

    const sortedDirectDeps = Object.keys(directDeps).sort();

    const totalDeps = pkgList.length;
    const directCount = sortedDirectDeps.length;
    const transitiveCount = totalDeps - directCount;

    // 1. Flagged Licenses Table
    let flaggedTable = "| Dependency | Version | License | Type |\n| --- | --- | --- | --- |\n";
    for (const pkg of pkgList) {
        if (pkg.license !== 'MIT' && !pkg.license.includes('MIT')) {
            const isDirect = directDeps[pkg.name] ? "**Direct**" : "Transitive";
            flaggedTable += `| ${pkg.name} | ${pkg.version} | ${pkg.license} | ${isDirect} |\n`;
        }
    }

    // 2. Direct Dependencies Table
    let directTable = "| Dependency | License | Used In |\n| --- | --- | --- |\n";
    for (const name of sortedDirectDeps) {
        // Find licenses for this direct dependency (might be multiple versions, but usually one direct version)
        const licenses = Array.from(new Set(pkgList.filter(p => p.name === name).map(p => p.license))).sort().join(', ') || 'Unknown';
        const usedIn = Array.from(directDeps[name]).sort().join(', ');
        directTable += `| ${name} | ${licenses} | ${usedIn} |\n`;
    }

    // 3. All Dependencies Table
    let allTable = "| Dependency | Version | License |\n| --- | --- | --- |\n";
    for (const pkg of pkgList) {
        allTable += `| ${pkg.name} | ${pkg.version} | ${pkg.license} |\n`;
    }

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    let auditContent = fs.readFileSync(auditPath, 'utf8');

    // Update Summary
    auditContent = auditContent.replace(/Total dependencies found: \d+/, `Total dependencies found: ${totalDeps}`);
    auditContent = auditContent.replace(/Direct dependencies: \d+/, `Direct dependencies: ${directCount}`);
    auditContent = auditContent.replace(/Transitive dependencies: \d+/, `Transitive dependencies: ${transitiveCount}`);

    // Update Date
    const today = new Date().toISOString().split('T')[0];
    auditContent = auditContent.replace(/\*\*Date:\*\* \d{4}-\d{2}-\d{2}/, `**Date:** ${today}`);

    // Update Sections
    const sections = [
        {
            header: "## Flagged Licenses (Non-MIT)",
            content: "The following dependencies have non-MIT licenses:\n\n" + flaggedTable,
            next: "## Direct Dependencies"
        },
        {
            header: "## Direct Dependencies",
            content: directTable,
            next: "## All Dependencies"
        },
        {
            header: "## All Dependencies (including transitive)",
            content: "<details>\n<summary>Click to expand full dependency list</summary>\n\n" + allTable + "\n</details>",
            next: null
        }
    ];

    for (const section of sections) {
        const startIdx = auditContent.indexOf(section.header);
        if (startIdx === -1) continue;

        const searchStart = startIdx + section.header.length;
        let endIdx = auditContent.length;
        if (section.next) {
            const nextIdx = auditContent.indexOf(section.next, searchStart);
            if (nextIdx !== -1) {
                endIdx = nextIdx;
            }
        }

        auditContent = auditContent.substring(0, startIdx + section.header.length) +
                       "\n\n" + section.content + "\n\n" +
                       auditContent.substring(endIdx);
    }

    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
