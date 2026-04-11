#!/usr/bin/env bash
# Builds self-contained gh extension binaries via `bun build --compile`.
# Output files follow the naming convention required by `gh extension install`.
set -e

VERSION=$(node -p "require('./package.json').version")
DEFINE='__PKG_VERSION__="'"$VERSION"'"'

echo "Building gh-prs binaries for v$VERSION..."

bun build --compile src/index.ts --define "$DEFINE" --target=bun-linux-x64    --outfile gh-prs-linux-amd64
bun build --compile src/index.ts --define "$DEFINE" --target=bun-linux-arm64   --outfile gh-prs-linux-arm64
bun build --compile src/index.ts --define "$DEFINE" --target=bun-darwin-x64    --outfile gh-prs-darwin-amd64
bun build --compile src/index.ts --define "$DEFINE" --target=bun-darwin-arm64  --outfile gh-prs-darwin-arm64
bun build --compile src/index.ts --define "$DEFINE" --target=bun-windows-x64   --outfile gh-prs-windows-amd64.exe

echo "Done."
