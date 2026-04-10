import { homedir } from 'node:os'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import type { Result, LeaderboardOptions, Range } from './types'
import { RANGES } from './types'

interface RawConfig {
  token?: string
  org?: string
  team?: string
  me?: string
}

function readConfigFile(): RawConfig {
  const path = join(homedir(), '.pr-score.json')
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as RawConfig
  } catch {
    return {}
  }
}

export function parseRange(input: string): Range {
  if ((RANGES as readonly string[]).includes(input)) return input as Range
  throw new Error(`Invalid range "${input}". Use: ${RANGES.join(', ')}`)
}

export function resolveConfig(flags: {
  org?: string
  team?: string
  repo?: string
  range?: string
  full?: boolean
  me?: string
}): Result<LeaderboardOptions> {
  const file = readConfigFile()

  const token = process.env.GITHUB_TOKEN ?? file.token
  const org = flags.org ?? process.env.GITHUB_ORG ?? file.org
  const team = flags.team ?? process.env.GITHUB_TEAM ?? file.team
  const me = flags.me ?? process.env.GITHUB_ME ?? file.me

  if (!token) return { ok: false, error: 'Missing GitHub token. Run: pr-score init' }
  if (!org) return { ok: false, error: 'Missing org. Run: pr-score init' }

  let range: Range
  try {
    range = parseRange(flags.range ?? 'week')
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }

  return {
    ok: true,
    data: {
      token,
      org,
      team,
      repo: flags.repo,
      range,
      full: flags.full ?? false,
      me,
    },
  }
}
