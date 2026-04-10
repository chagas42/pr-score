# pr-score

[![npm version](https://img.shields.io/npm/v/pr-score.svg)](https://www.npmjs.com/package/pr-score)
[![license](https://img.shields.io/npm/l/pr-score.svg)](https://github.com/SalvyLTD/pr-score/blob/main/LICENSE)

CLI leaderboard for GitHub PR review activity. See who's reviewing the most PRs in your org or team.

## Install

```bash
npm install -g pr-score
```

```bash
bun install -g pr-score
```

## Setup

Run once to configure your token and org:

```bash
pr-score init
```

You'll be prompted for:
- A GitHub token with `repo` and `read:org` scopes
- Your GitHub org
- (Optional) a team slug to scope to a specific team
- Your GitHub login, to highlight your row in the output

Config is saved to `~/.pr-score.json`.

## Usage

```bash
# compact view (default, this week)
pr-score

# full table
pr-score --full

# different time range
pr-score --range month
pr-score --range quarter

# scope to a specific team or repo
pr-score --team frontend
pr-score --repo acme/api

# show review streaks (consecutive days)
pr-score --streak

# override config inline
pr-score --org acme-corp --team backend --me ana.lima

# force refresh (ignore cache)
pr-score --refresh
```

### All flags

| Flag | Description | Default |
|------|-------------|---------|
| `--org <org>` | GitHub org | from config |
| `--team <team>` | Team slug | from config |
| `--repo <org/repo>` | Filter to a specific repo | — |
| `--range <range>` | `week`, `month`, or `quarter` | `week` |
| `--full` | Show full detailed table | off |
| `--me <login>` | Your GitHub login | from config |
| `--refresh` | Ignore cache and fetch fresh data | off |
| `--streak` | Show review streak (consecutive days) | off |

## Output

### Compact view

```
reviews · this week

 1  ana.lima   ████████  18  🔥3d  ← you
 2  carlos.m   ██████    14
 3  priya.r    █████     11
 4  tiago      ███        7
 5  mei.chen   █          4

#1/5  ·  lead by +4  ·  pr-score --full for details  ·  fetched just now
```

### Full view (`--full`)

```
PR Review Leaderboard  ·  Apr 02 – Apr 09  ·  acme-corp / frontend

 #   developer    activity      reviews   prs opened   comments   streak
 1   ana.lima     ██████████         18            5         22   🔥3d
 2   carlos.m     ████████           14            3         18
 3   priya.r      ███████            11            7         15
 4   tiago        █████               7            2          9
 5   mei.chen     ██                  4            1          6

5 members  ·  fetched just now
```

## Config priority

CLI flags > environment variables > `~/.pr-score.json`

Environment variables: `GITHUB_TOKEN`, `GITHUB_ORG`, `GITHUB_TEAM`, `GITHUB_ME`

