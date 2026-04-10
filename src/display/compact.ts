import pc from 'picocolors';
import { formatAge } from '../cache';
import type { LeaderboardOptions, MemberScore } from '../types';
import { buildBar, formatRank } from './utils';

const RANGE_LABELS: Record<string, string> = {
  week: 'this week',
  month: 'last 30 days',
  quarter: 'last 90 days',
};

const ANIM_FRAMES = 18;
const ANIM_FRAME_MS = 18;
const BAR_WIDTH = 10;

interface RenderMeta {
  cached: boolean;
  ageMs: number;
  streaks?: Record<string, number>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function buildRow(
  score: MemberScore,
  index: number,
  options: LeaderboardOptions,
  meta: RenderMeta,
  max: number,
  maxLoginLen: number,
  reviewsOverride?: number,
  showExtras?: boolean
): string {
  const rank = formatRank(index);
  const reviews = reviewsOverride ?? score.reviews;
  const bar = buildBar(reviews, max, BAR_WIDTH).padEnd(BAR_WIDTH, ' ');
  const count = String(score.reviews).padStart(3, ' ');
  const isMe = options.me && score.login === options.me;
  const marker = isMe && showExtras ? pc.dim(' ← you') : '';
  const streak = meta.streaks?.[score.login] ?? 0;
  const streakLabel = showExtras && streak > 0 ? `  🔥${streak}d` : '';
  const line = ` ${rank}  ${score.login.padEnd(maxLoginLen)}  ${bar}  ${count}${streakLabel}${marker}`;
  return isMe ? pc.bold(line) : line;
}

function buildFooter(
  scores: MemberScore[],
  _options: LeaderboardOptions,
  meta: RenderMeta,
  myIndex: number
): string {
  const total = scores.length;
  let footer = '';

  if (myIndex >= 0) {
    const myScore = scores[myIndex];
    const leaderScore = scores[0];
    if (myScore && leaderScore) {
      const lead = myIndex === 0 ? (scores[1] ? myScore.reviews - scores[1].reviews : 0) : 0;
      if (myIndex === 0 && lead >= 0) {
        footer = `#1/${total}  ·  lead by +${lead}  ·  pr-score --full for details`;
      } else {
        footer = `#${myIndex + 1}/${total}  ·  behind by ${leaderScore.reviews - myScore.reviews}  ·  pr-score --full for details`;
      }
    }
  } else {
    footer = `${total} members  ·  pr-score --full for details`;
  }

  const fetchedLabel = meta.cached ? `cached · ${formatAge(meta.ageMs)}` : 'fetched just now';
  return pc.dim(`${footer}  ·  ${fetchedLabel}`);
}

export async function render(
  scores: MemberScore[],
  options: LeaderboardOptions,
  meta: RenderMeta
): Promise<void> {
  const label = RANGE_LABELS[options.range] ?? options.range;
  const max = scores[0]?.reviews ?? 0;
  const myIndex = options.me ? scores.findIndex((s) => s.login === options.me) : -1;
  const maxLoginLen = Math.max(...scores.map((s) => s.login.length), 8);

  const shouldAnimate = process.stdout.isTTY && !meta.cached && max > 0 && scores.length > 0;

  console.log(`\nreviews · ${label}\n`);

  if (shouldAnimate) {
    // Print initial rows with empty bars
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      if (!score) continue;
      console.log(buildRow(score, i, options, meta, max, maxLoginLen, 0, false));
    }

    // Animate frames: bars grow from 0 to final value
    for (let frame = 1; frame <= ANIM_FRAMES; frame++) {
      const progress = frame / ANIM_FRAMES;
      const isFinal = frame === ANIM_FRAMES;

      // Move cursor up to overwrite rows
      process.stdout.write(`\x1b[${scores.length}A`);

      for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        if (!score) continue;
        const animated = Math.round(score.reviews * progress);
        const row = buildRow(score, i, options, meta, max, maxLoginLen, animated, isFinal);
        process.stdout.write(`\r\x1b[2K${row}\n`);
      }

      if (!isFinal) await sleep(ANIM_FRAME_MS);
    }
  } else {
    // Static render (cached, piped, or all-zero scores)
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      if (!score) continue;
      console.log(buildRow(score, i, options, meta, max, maxLoginLen, undefined, true));
    }
  }

  console.log('');

  if (scores.length > 0) {
    console.log(buildFooter(scores, options, meta, myIndex));
  }

  console.log('');
}
