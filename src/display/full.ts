import Table from 'cli-table3'
import pc from 'picocolors'
import type { MemberScore, LeaderboardOptions } from '../types'
import { buildBar, formatRank } from './utils'
import { formatAge } from '../cache'

interface RenderMeta {
  cached: boolean
  ageMs: number
  streaks?: Record<string, number>
}

function getDateRangeLabel(range: string): string {
  const now = new Date()
  const days = range === 'week' ? 7 : range === 'month' ? 30 : 90
  const from = new Date(now.getTime() - days * 86_400_000)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  return `${fmt(from)} – ${fmt(now)}`
}

export function render(scores: MemberScore[], options: LeaderboardOptions, meta: RenderMeta): void {
  const dateRange = getDateRangeLabel(options.range)
  const scope = options.team ? `${options.org} / ${options.team}` : options.org
  const header = `PR Review Leaderboard  ·  ${dateRange}  ·  ${scope}`
  console.log(`\n${pc.bold(header)}\n`)

  const showStreaks = !!meta.streaks

  const tableHead = ['#', 'developer', 'activity', 'reviews', 'prs opened', 'comments']
  if (showStreaks) tableHead.push('streak')

  const table = new Table({
    head: tableHead.map((h) => pc.dim(h)),
    colAligns: ['right', 'left', 'left', 'right', 'right', 'right', ...(showStreaks ? ['right' as const] : [])],
    style: { border: [], head: [] },
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: '  ',
    },
  })

  const max = scores[0]?.reviews ?? 0
  const BAR_WIDTH = 10

  for (let i = 0; i < scores.length; i++) {
    const score = scores[i]
    if (!score) continue

    const isMe = options.me && score.login === options.me
    const marker = isMe ? pc.dim(' ← you') : ''
    const bar = buildBar(score.reviews, max, BAR_WIDTH)

    const streak = meta.streaks?.[score.login] ?? 0
    const streakLabel = streak > 0 ? `🔥${streak}d` : ''

    const row = [
      formatRank(i),
      score.login + marker,
      bar,
      String(score.reviews),
      String(score.prsOpened),
      String(score.comments),
      ...(showStreaks ? [streakLabel] : []),
    ]

    if (isMe) {
      table.push(row.map((cell) => pc.bold(cell)))
    } else {
      table.push(row)
    }
  }

  console.log(table.toString())
  console.log('')
  const fetchedLabel = meta.cached ? `cached · ${formatAge(meta.ageMs)}` : 'fetched just now'
  console.log(pc.dim(`${scores.length} members  ·  ${fetchedLabel}`))
  console.log('')
}
