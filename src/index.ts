import { Command } from 'commander'
import pc from 'picocolors'
import { resolveConfig } from './config'
import { buildLeaderboard, buildStreaks } from './aggregator'
import { render as renderCompact } from './display/compact'
import { render as renderFull } from './display/full'
import { runInit } from './init'
import { getCached, saveCache, formatAge } from './cache'
import { renderDanilera } from './display/danilera'

const program = new Command()

program
  .name('pr-score')
  .description('GitHub PR review leaderboard for your team')
  .version('0.1.0')

program
  .command('init')
  .description('Interactive first-time setup')
  .action(async () => {
    await runInit()
  })

program
  .option('--org <org>', 'GitHub org')
  .option('--team <team>', 'Team slug')
  .option('--repo <repo>', 'Filter to a specific repo (org/repo)')
  .option('--range <range>', 'week | month | quarter', 'week')
  .option('--full', 'Show full detailed table', false)
  .option('--me <login>', 'Your GitHub login')
  .option('--refresh', 'Ignore cache and fetch fresh data', false)
  .option('--streak', 'Show review streak (consecutive days)', false)
  .option('-d, --danilera', 'How far are you from danilofuchs?', false)
  .action(async (flags: {
    org?: string
    team?: string
    repo?: string
    range?: string
    full?: boolean
    me?: string
    refresh?: boolean
    streak?: boolean
    danilera?: boolean
  }) => {
    const config = resolveConfig(flags)
    if (!config.ok) {
      console.error(pc.red(config.error))
      process.exit(1)
    }

    const showDanilera = flags.danilera ?? false
    const showStreak = flags.streak ?? false
    const cached = flags.refresh ? null : getCached(config.data)

    if (cached) {
      const streaks = showStreak
        ? await buildStreaks(config.data, cached.data.map((s) => s.login))
        : undefined
      if (config.data.full) {
        renderFull(cached.data, config.data, { cached: true, ageMs: cached.ageMs, streaks })
      } else {
        renderCompact(cached.data, config.data, { cached: true, ageMs: cached.ageMs, streaks })
      }
      if (showDanilera) renderDanilera(cached.data, config.data.me)
      return
    }

    const result = await buildLeaderboard(config.data)
    if (!result.ok) {
      console.error(pc.red(result.error))
      process.exit(1)
    }

    saveCache(config.data, result.data)

    const streaks = showStreak
      ? await buildStreaks(config.data, result.data.map((s) => s.login))
      : undefined

    if (config.data.full) {
      renderFull(result.data, config.data, { cached: false, ageMs: 0, streaks })
    } else {
      renderCompact(result.data, config.data, { cached: false, ageMs: 0, streaks })
    }
    if (showDanilera) renderDanilera(result.data, config.data.me)
  })

program.parse()
