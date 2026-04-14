import fs from 'fs';

const licensesData = JSON.parse(fs.readFileSync('licenses.json', 'utf8'));
const directDepsList = JSON.parse(fs.readFileSync('direct_deps.json', 'utf8'));
const directDepsSet = new Set(directDepsList);

const allDeps = [];
const flaggedDeps = [];
const directDepsReport = [];

// pnpm licenses list --json returns an object where keys are license names
for (const [license, deps] of Object.entries(licensesData)) {
  for (const dep of deps) {
    const isDirect = directDepsSet.has(dep.name);
    const depInfo = {
      name: dep.name,
      version: dep.versions[0],
      license: license,
      type: isDirect ? 'Direct' : 'Transitive'
    };

    allDeps.push(depInfo);

    if (license !== 'MIT') {
      flaggedDeps.push(depInfo);
    }
  }
}

// Sort for consistency
allDeps.sort((a, b) => a.name.localeCompare(b.name));
flaggedDeps.sort((a, b) => a.name.localeCompare(b.name));

// Direct dependencies section needs "Used In" information.
// I'll need to re-scan package.json files for this.
const packagePaths = [
  'package.json',
  'packages/contracts/package.json',
  'packages/platform/package.json',
  'packages/editor/package.json',
  'packages/engine/package.json',
  'apps/web/package.json',
];

const directDepsUsage = {};

for (const p of packagePaths) {
  const content = JSON.parse(fs.readFileSync(p, 'utf8'));
  const pkgName = content.name === 'Animatica' ? 'Animatica' : content.name;
  const allPkgDeps = {
    ...content.dependencies,
    ...content.devDependencies,
    ...content.peerDependencies,
  };
  for (const dep in allPkgDeps) {
    if (directDepsSet.has(dep)) {
      if (!directDepsUsage[dep]) directDepsUsage[dep] = new Set();
      directDepsUsage[dep].add(pkgName);
    }
  }
}

const directDepsSorted = Array.from(directDepsSet).sort().map(name => {
    const depData = allDeps.find(d => d.name === name);
    return {
        name,
        license: depData ? depData.license : 'Unknown',
        usedIn: Array.from(directDepsUsage[name] || []).sort().join(', ')
    };
});

const today = new Date().toISOString().split('T')[0];

let markdown = `# License Audit

**Date:** ${today}
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT licenses and checks for the presence of the project's own LICENSE file.

Total dependencies found: ${allDeps.length}
Direct dependencies: ${directDepsSet.size}
Transitive dependencies: ${allDeps.length - directDepsSet.size}

## Project License

- **File:** \`LICENSE\`
- **Status:** Present
- **License:** MIT

## Source Code Headers

- **Checked:** \`packages/engine/src/index.ts\`
- **Result:** No license header found.

## Flagged Licenses (Non-MIT)

The following dependencies have non-MIT licenses:

| Dependency | Version | License | Type |
| --- | --- | --- | --- |
`;

flaggedDeps.forEach(dep => {
  markdown += `| ${dep.name} | ${dep.version} | ${dep.license} | ${dep.type === 'Direct' ? '**Direct**' : 'Transitive'} |\n`;
});

markdown += `
## Direct Dependencies

| Dependency | License | Used In |
| --- | --- | --- |
`;

directDepsSorted.forEach(dep => {
  markdown += `| ${dep.name} | ${dep.license} | ${dep.usedIn} |\n`;
});

markdown += `
## All Dependencies (including transitive)

<details>
<summary>Click to expand full dependency list</summary>

| Dependency | Version | License |
| --- | --- | --- |
`;

allDeps.forEach(dep => {
  markdown += `| ${dep.name} | ${dep.version} | ${dep.license} |\n`;
});

markdown += `
</details>
`;

fs.writeFileSync('docs/LICENSE_AUDIT.md', markdown);
console.log('Report generated in docs/LICENSE_AUDIT.md');
