import pc from 'picocolors'
import type { MemberScore, LeaderboardOptions } from '../types'
import { buildBar, formatRank } from './utils'
import { formatAge } from '../cache'

const RANGE_LABELS: Record<string, string> = {
  week: 'this week',
  month: 'last 30 days',
  quarter: 'last 90 days',
}

interface RenderMeta {
  cached: boolean
  ageMs: number
  streaks?: Record<string, number>
}

export function render(scores: MemberScore[], options: LeaderboardOptions, meta: RenderMeta): void {
  const label = RANGE_LABELS[options.range] ?? options.range
  console.log(`\nreviews · ${label}\n`)

  const max = scores[0]?.reviews ?? 0
  const BAR_WIDTH = 10
  const myIndex = options.me ? scores.findIndex((s) => s.login === options.me) : -1
  const maxLoginLen = Math.max(...scores.map((s) => s.login.length), 8)

  for (let i = 0; i < scores.length; i++) {
    const score = scores[i]
    if (!score) continue

    const rank = formatRank(i)
    const bar = buildBar(score.reviews, max, BAR_WIDTH).padEnd(BAR_WIDTH, ' ')
    const count = String(score.reviews).padStart(3, ' ')
    const isMe = options.me && score.login === options.me
    const marker = isMe ? pc.dim(' ← you') : ''
    const streak = meta.streaks?.[score.login] ?? 0
    const streakLabel = streak > 0 ? `  🔥${streak}d` : ''

    const line = ` ${rank}  ${score.login.padEnd(maxLoginLen)}  ${bar}  ${count}${streakLabel}${marker}`

    if (isMe) {
      console.log(pc.bold(line))
    } else {
      console.log(line)
    }
  }

  console.log('')

  if (scores.length > 0) {
    const total = scores.length
    let footer = ''

    if (myIndex >= 0) {
      const myScore = scores[myIndex]
      const leaderScore = scores[0]
      if (myScore && leaderScore) {
        const lead = myIndex === 0 ? (scores[1] ? myScore.reviews - scores[1].reviews : 0) : 0
        if (myIndex === 0 && lead >= 0) {
          footer = `#1/${total}  ·  lead by +${lead}  ·  pr-score --full for details`
        } else {
          footer = `#${myIndex + 1}/${total}  ·  behind by ${leaderScore.reviews - myScore.reviews}  ·  pr-score --full for details`
        }
      }
    } else {
      footer = `${total} members  ·  pr-score --full for details`
    }

    const fetchedLabel = meta.cached ? `cached · ${formatAge(meta.ageMs)}` : 'fetched just now'
    console.log(pc.dim(`${footer}  ·  ${fetchedLabel}`))
  }

  console.log('')
}
