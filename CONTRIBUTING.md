# Contributing to Animatica

Thank you for your interest in contributing! This guide covers the development workflow.

## Setup

```bash
git clone https://github.com/YOUR_ORG/Animatica.git
cd Animatica
pnpm install
```

## Development

```bash
# Run everything
pnpm run dev

# Run specific package
pnpm --filter @Animatica/engine dev
pnpm --filter @Animatica/editor dev
```

## Testing

```bash
# All packages
pnpm run test

# Specific package
pnpm --filter @Animatica/engine test

# Type checking
pnpm run typecheck
```

## PR Guidelines

1. **One package per PR** — never mix engine + editor changes
2. **Max 5 files** — keep PRs small and focused
3. **Tests required** — include at least one test file
4. **TypeScript strict** — no `any`, no unused vars
5. **Named exports** — never use `export default`
6. **Max 200 LOC** — split large files into smaller modules

## Branch Naming

```
feat/batch-N-description   # New feature
fix/batch-N-description    # Bug fix
docs/description           # Documentation
refactor/description       # Code refactoring
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(engine): add keyframe interpolation engine
fix(editor): resolve timeline playhead drift
docs: update AI pipeline specification
test(engine): add easing function unit tests
```

## Architecture Rules

- `engine` → imports NOTHING from other packages
- `editor` → imports ONLY from `engine`
- `platform` → imports NOTHING from engine/editor
- `apps/web` → imports from all packages

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.
