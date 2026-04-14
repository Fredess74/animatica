import fs from 'fs';
import path from 'path';

const packagePaths = [
  'package.json',
  'packages/contracts/package.json',
  'packages/platform/package.json',
  'packages/editor/package.json',
  'packages/engine/package.json',
  'apps/web/package.json',
];

const directDeps = new Set();
const workspacePackages = new Set();

// First pass to get workspace package names
for (const p of packagePaths) {
  const content = JSON.parse(fs.readFileSync(p, 'utf8'));
  workspacePackages.add(content.name);
}

// Second pass to collect dependencies
for (const p of packagePaths) {
  const content = JSON.parse(fs.readFileSync(p, 'utf8'));
  const allDeps = {
    ...content.dependencies,
    ...content.devDependencies,
    ...content.peerDependencies,
  };
  for (const dep in allDeps) {
    if (!workspacePackages.has(dep)) {
      directDeps.add(dep);
    }
  }
}

fs.writeFileSync('direct_deps.json', JSON.stringify(Array.from(directDeps), null, 2));
