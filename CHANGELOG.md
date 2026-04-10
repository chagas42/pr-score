# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.7] - 2025-04-10

### Added
- Auto update checker: notifies when a newer version is available on npm (checked once per day)

## [0.1.6] - 2025-04-09

### Fixed
- Scoreboard column layout alignment

## [0.1.5] - 2025-04-09

### Fixed
- Runtime ESM module error when installing via pnpm or npm

## [0.1.4] - 2025-04-09

### Fixed
- Runtime error when installing via pnpm or npm

## [0.1.3] - 2025-04-09

### Added
- npm compatibility improvements

## [0.1.2] - 2025-04-09

### Changed
- Updated default org configuration

## [0.1.1] - 2025-04-09

### Fixed
- Added shebang line to dist bundle for correct CLI execution
- Renamed package to `@chagas42/prs`

## [0.1.0] - 2025-04-09

### Added
- Initial release of `pr-score` CLI
- GitHub PR review leaderboard for org and teams
- Compact and full table views (`--full`)
- Time range filtering: `week`, `month`, `quarter`
- Scope filtering by team (`--team`) and repo (`--repo`)
- Review streak tracking (`--streak`)
- Interactive setup wizard (`prs init`) with GitHub CLI auto-detection
- Config file at `~/.pr-score.json` with env var and CLI flag overrides
- Result caching to avoid redundant API calls
- `--me` flag to highlight your position on the leaderboard

[Unreleased]: https://github.com/chagas42/pr-score/compare/v0.1.7...HEAD
[0.1.7]: https://github.com/chagas42/pr-score/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/chagas42/pr-score/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/chagas42/pr-score/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/chagas42/pr-score/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/chagas42/pr-score/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/chagas42/pr-score/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/chagas42/pr-score/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/chagas42/pr-score/releases/tag/v0.1.0
