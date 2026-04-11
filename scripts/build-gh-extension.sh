#!/usr/bin/env bash
# Builds self-contained gh extension binaries via `bun build --compile`.
# Output files follow the naming convention required by `gh extension install`.
# Usage: build-gh-extension.sh [darwin|linux-windows|all]
set -e

VERSION=$(node -p "require('./package.json').version")
DEFINE='__PKG_VERSION__="'"$VERSION"'"'
PLATFORM=${1:-all}

echo "Building gh-prs binaries for v$VERSION (platform: $PLATFORM)..."

build() {
  local target=$1 outfile=$2
  echo "  $outfile"
  bun build --compile src/index.ts --define "$DEFINE" --target="$target" --outfile "$outfile"
}

case "$PLATFORM" in
  darwin)ʝ
    build bun-darwin-x64   gh-prs-darwin-amd64
    build bun-darwin-arm64 gh-prs-darwin-arm64
    ;;
  linux-windows)
    build bun-linux-x64   gh-prs-linux-amd64
    build bun-linux-arm64 gh-prs-linux-arm64
    build bun-windows-x64 gh-prs-windows-amd64.exe
    ;;
  *)
    build bun-linux-x64   gh-prs-linux-amd64
    build bun-linux-arm64 gh-prs-linux-arm64
    build bun-darwin-x64  gh-prs-darwin-amd64
    build bun-darwin-arm64 gh-prs-darwin-arm64
    build bun-windows-x64 gh-prs-windows-amd64.exe
    ;;
esac

echo "Done."
