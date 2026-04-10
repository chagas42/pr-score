import type { Range, MemberScore, LeaderboardOptions, Result } from './types'
import { createClient, getTeamMembers, getOrgMembers, fetchAllScores, fetchAllStreaks } from './github'
import { startSpinner } from './spinner'

const RANGE_DAYS: Record<Range, number> = {
  week: 7,
  month: 30,
  quarter: 90,
}

export function getDateRange(range: Range): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString().slice(0, 10)
  const from = new Date(now.getTime() - RANGE_DAYS[range] * 86_400_000)
    .toISOString()
    .slice(0, 10)
  return { from, to }
}

export async function buildStreaks(
  options: LeaderboardOptions,
  logins: string[]
): Promise<Record<string, number>> {
  const client = createClient(options.token)
  return fetchAllStreaks(client, logins)
}

export async function buildLeaderboard(
  options: LeaderboardOptions
): Promise<Result<MemberScore[]>> {
  try {
    const client = createClient(options.token)
    const { from, to } = getDateRange(options.range)

    const spinner = startSpinner('fetching members…')
    const members = options.team
      ? await getTeamMembers(client, options.org, options.team)
      : await getOrgMembers(client, options.org)

    if (members.length === 0) {
      spinner.stop()
      return { ok: false, error: 'No members found. Check org/team name.' }
    }

    spinner.update(`fetching scores for ${members.length} members…`)
    const scores = await fetchAllScores(options.token, members, from, to, options.repo)
    spinner.stop()

    const sorted = scores.sort((a, b) => b.reviews - a.reviews)
    return { ok: true, data: sorted }
  } catch (e) {
    return { ok: false, error: `GitHub API error: ${(e as Error).message}` }
  }
}
