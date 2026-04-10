# Contributing

Thanks for your interest in contributing to `pr-score`!

## Requirements

- Node.js >= 18
- pnpm >= 10

## Setup

```bash
git clone https://github.com/chagas42/pr-score.git
cd pr-score
pnpm install
```

## Development

Run directly from source (requires Bun):

```bash
pnpm dev
```

Or build and run the compiled output:

```bash
pnpm build
node dist/index.js
```

## Before submitting a PR

```bash
pnpm check:all
```

This runs type checking, linting, formatting, and a full build. All checks must pass.

To auto-fix formatting and lint issues:

```bash
pnpm lint:fix
pnpm format
```

## Releasing

Releases are triggered by pushing a version tag. Only maintainers can do this.

1. Bump the version in `package.json`
2. Update `CHANGELOG.md` under `[Unreleased]`
3. Commit: `git commit -m "chore: release v0.x.x"`
4. Tag: `git tag v0.x.x`
5. Push: `git push && git push --tags`

The `publish` GitHub Action will automatically publish to npm.
