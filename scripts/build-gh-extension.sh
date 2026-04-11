#!/usr/bin/env bash
# Builds self-contained gh extension binaries via `bun build --compile`.
# Output files follow the naming convention required by `gh extension install`.
# Usage: build-gh-extension.sh [local|darwin|linux-windows|all]
set -e

VERSION=$(node -p "require('./package.json').version")
PKG_NAME=$(node -p "require('./package.json').name")
PLATFORM=${1:-all}

echo "Building gh-prs binaries for v$VERSION (platform: $PLATFORM)..."

build() {
  local target=$1 outfile=$2
  echo "  $outfile"
  bun build --compile src/index.ts \
    --define "__PKG_VERSION__=\"$VERSION\"" \
    --define "__PKG_NAME__=\"$PKG_NAME\"" \
    --target="$target" --outfile "$outfile"
}

case "$PLATFORM" in
  local)
    RAW_ARCH=$(uname -m)
    BUN_ARCH=$( [[ "$RAW_ARCH" == "arm64" ]] && echo "arm64" || echo "x64" )
    BIN_ARCH=$( [[ "$RAW_ARCH" == "arm64" ]] && echo "arm64" || echo "amd64" )
    build "bun-darwin-$BUN_ARCH" "gh-prs-darwin-$BIN_ARCH"
    INSTALL_DIR="$HOME/.local/share/gh/extensions/gh-prs"
    mkdir -p "$INSTALL_DIR"
    cp "gh-prs-darwin-$BIN_ARCH" "$INSTALL_DIR/gh-prs"
    chmod +x "$INSTALL_DIR/gh-prs"
    echo "Installed: $INSTALL_DIR/gh-prs"
    ;;
  darwin)
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
