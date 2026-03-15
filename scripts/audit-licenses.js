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

    const allPackages = [];
    for (const [licenseName, packages] of Object.entries(data)) {
        for (const pkg of packages) {
            allPackages.push({
                name: pkg.name,
                version: pkg.versions[0], // Taking the first version if multiple
                license: licenseName
            });
        }
    }
    return allPackages;
}

function main() {
    const allPackages = loadLicenses();
    const pkgToInfo = {};
    allPackages.forEach(p => {
        pkgToInfo[p.name] = p;
    });

    const directDepsMap = {}; // depName -> Set of packageNames using it

    for (const pjPath of getPackageJsons()) {
        const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
        const pjName = pj.name || 'root';

        const deps = { ...pj.dependencies, ...pj.devDependencies, ...pj.peerDependencies };

        for (const [name, version] of Object.entries(deps)) {
            if (name.startsWith('@Animatica/') || (typeof version === 'string' && version.startsWith('workspace:'))) {
                continue;
            }
            if (!directDepsMap[name]) {
                directDepsMap[name] = new Set();
            }
            directDepsMap[name].add(pjName);
        }
    }

    const directDepNames = Object.keys(directDepsMap).sort();
    const transitiveDepCount = allPackages.length - directDepNames.length;

    // 1. Summary
    const summary = `Total dependencies found: ${allPackages.length}
Direct dependencies: ${directDepNames.length}
Transitive dependencies: ${transitiveDepCount}`;

    // 4. Flagged Licenses (Non-MIT)
    let flaggedTable = "| Dependency | Version | License | Type |\n| --- | --- | --- | --- |\n";
    const flaggedPackages = allPackages.filter(p => {
        const l = p.license.toUpperCase();
        return l !== 'MIT' && !l.includes('MIT');
    }).sort((a, b) => a.name.localeCompare(b.name));

    for (const p of flaggedPackages) {
        const type = directDepsMap[p.name] ? "**Direct**" : "Transitive";
        flaggedTable += `| ${p.name} | ${p.version} | ${p.license} | ${type} |\n`;
    }

    // 5. Direct Dependencies
    let directTable = "| Dependency | License | Used In |\n| --- | --- | --- | --- |\n";
    for (const name of directDepNames) {
        const info = pkgToInfo[name] || { license: 'Unknown' };
        const usedIn = Array.from(directDepsMap[name]).sort().join(', ');
        directTable += `| ${name} | ${info.license} | ${usedIn} |\n`;
    }

    // 6. All Dependencies (including transitive)
    let allTable = "| Dependency | Version | License |\n| --- | --- | --- |\n";
    const sortedPackages = [...allPackages].sort((a, b) => a.name.localeCompare(b.name));
    for (const p of sortedPackages) {
        allTable += `| ${p.name} | ${p.version} | ${p.license} |\n`;
    }

    const auditPath = path.join(process.cwd(), 'docs/LICENSE_AUDIT.md');
    let auditContent = fs.readFileSync(auditPath, 'utf8');

    // Update Date
    const today = new Date().toISOString().split('T')[0];
    auditContent = auditContent.replace(/\*\*Date:\*\* .*/, `**Date:** ${today}`);

    // Helper to replace section content
    function replaceSection(content, header, newBody) {
        const lines = content.split('\n');
        let startIndex = -1;
        let endIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === header) {
                startIndex = i + 1;
                // Skip empty lines after header
                while (startIndex < lines.length && lines[startIndex].trim() === '') {
                    startIndex++;
                }
                break;
            }
        }

        if (startIndex !== -1) {
            for (let i = startIndex; i < lines.length; i++) {
                if (lines[i].startsWith('## ')) {
                    endIndex = i;
                    break;
                }
            }
            if (endIndex === -1) endIndex = lines.length;

            const before = lines.slice(0, startIndex);
            const after = lines.slice(endIndex);
            return [...before, newBody, ...after].join('\n');
        }
        return content;
    }

    auditContent = replaceSection(auditContent, '## Summary', summary + '\n');
    auditContent = replaceSection(auditContent, '## Flagged Licenses (Non-MIT)', flaggedTable);
    auditContent = replaceSection(auditContent, '## Direct Dependencies', directTable);

    // All Dependencies is special because of <details>
    const allSectionHeader = '## All Dependencies (including transitive)';
    const allStartMarker = '<details>\n<summary>Click to expand full dependency list</summary>\n\n';
    const allEndMarker = '\n</details>';

    const allSectionIndex = auditContent.indexOf(allSectionHeader);
    if (allSectionIndex !== -1) {
        const markerPos = auditContent.indexOf(allStartMarker, allSectionIndex);
        if (markerPos !== -1) {
            const before = auditContent.substring(0, markerPos + allStartMarker.length);
            const after = auditContent.substring(auditContent.indexOf(allEndMarker, allSectionIndex));
            auditContent = before + allTable + after;
        }
    }

    fs.writeFileSync(auditPath, auditContent);
    console.log('Audit report updated in docs/LICENSE_AUDIT.md');
}

main();
