import { startBannerAnimation } from './display/banner';
import {
  createClient,
  fetchAllScores,
  fetchAllStreaks,
  getOrgMembers,
  getTeamMembers,
} from './github';
import { startSpinner } from './spinner';
import type { LeaderboardOptions, MemberScore, Range, Result } from './types';

const RANGE_DAYS: Record<Range, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

export function getDateRange(range: Range): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().slice(0, 10);
  const from = new Date(now.getTime() - RANGE_DAYS[range] * 86_400_000).toISOString().slice(0, 10);
  return { from, to };
}

const STREAK_BAR_WIDTH = 20;

export async function buildStreaks(
  options: LeaderboardOptions,
  logins: string[]
): Promise<Record<string, number>> {
  const client = createClient(options.token);

  if (!process.stdout.isTTY || logins.length === 0) {
    return fetchAllStreaks(client, logins, options.org);
  }

  const renderProgress = (done: number, total: number) => {
    const filled = Math.round((done / total) * STREAK_BAR_WIDTH);
    const bar = '█'.repeat(filled) + '░'.repeat(STREAK_BAR_WIDTH - filled);
    process.stdout.write(`\r  fetching streaks [${bar}] ${done}/${total}  `);
  };

  renderProgress(0, logins.length);
  const result = await fetchAllStreaks(client, logins, options.org, renderProgress);
  process.stdout.write('\r\x1b[K');
  return result;
}

export async function buildLeaderboard(
  options: LeaderboardOptions
): Promise<Result<MemberScore[]>> {
  try {
    const client = createClient(options.token);
    const { from, to } = getDateRange(options.range);

    const isTTY = process.stdout.isTTY;
    const banner = isTTY ? startBannerAnimation() : null;
    const spinner = isTTY ? null : startSpinner('fetching members…');

    const members = options.team
      ? await getTeamMembers(client, options.org, options.team)
      : await getOrgMembers(client, options.org);

    if (members.length === 0) {
      spinner?.stop();
      await banner?.clear();
      return { ok: false, error: 'No members found. Check org/team name.' };
    }

    spinner?.update(`fetching scores for ${members.length} members…`);
    const scores = await fetchAllScores(options.token, members, from, to, options.repo);
    spinner?.stop();
    await banner?.clear();

    const sorted = scores.sort((a, b) => b.reviews - a.reviews);
    return { ok: true, data: sorted };
  } catch (e) {
    return { ok: false, error: `GitHub API error: ${(e as Error).message}` };
  }
}
