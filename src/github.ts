import { Octokit } from '@octokit/rest'
import { graphql } from '@octokit/graphql'
import type { Member, MemberScore } from './types'

async function getMemberStreak(client: Octokit, login: string): Promise<number> {
  try {
    const { data } = await client.rest.activity.listEventsForUser({
      username: login,
      per_page: 100,
    })

    const reviewDays = new Set<string>()
    for (const event of data) {
      if (event.type === 'PullRequestReviewEvent') {
        reviewDays.add((event.created_at ?? '').slice(0, 10))
      }
    }

    let streak = 0
    const now = new Date()
    for (let i = 0; i < 90; i++) {
      const date = new Date(now.getTime() - i * 86_400_000).toISOString().slice(0, 10)
      if (reviewDays.has(date)) {
        streak++
      } else {
        if (i === 0) continue // today might still be ongoing
        break
      }
    }
    return streak
  } catch {
    return 0
  }
}

export async function fetchAllStreaks(
  client: Octokit,
  logins: string[]
): Promise<Record<string, number>> {
  const pairs = await Promise.all(
    logins.map(async (login) => [login, await getMemberStreak(client, login)] as const)
  )
  return Object.fromEntries(pairs)
}

export function createClient(token: string): Octokit {
  return new Octokit({ auth: token })
}

export async function getTeamMembers(client: Octokit, org: string, team: string): Promise<Member[]> {
  try {
    const { data } = await client.rest.teams.listMembersInOrg({
      org,
      team_slug: team,
      per_page: 100,
    })
    return data.map((m) => ({ login: m.login, name: m.name ?? null }))
  } catch (e) {
    throw new Error(`Failed to fetch team members for ${org}/${team}: ${(e as Error).message}`)
  }
}

export async function getOrgMembers(client: Octokit, org: string): Promise<Member[]> {
  try {
    const { data } = await client.rest.orgs.listMembers({
      org,
      per_page: 100,
    })
    return data.map((m) => ({ login: m.login, name: m.name ?? null }))
  } catch (e) {
    throw new Error(`Failed to fetch org members for ${org}: ${(e as Error).message}`)
  }
}

// Fetches all member scores in a single GraphQL request using aliased search queries.
// 9 members × 3 metrics = 27 aliases in one round-trip instead of 27 sequential REST calls.
export async function fetchAllScores(
  token: string,
  members: Member[],
  from: string,
  to: string,
  repo?: string
): Promise<MemberScore[]> {
  const repoQ = repo ? ` repo:${repo}` : ''

  const aliases = members
    .flatMap((m, i) => [
      `m${i}_r: search(query: "reviewed-by:${m.login} created:${from}..${to} is:pr${repoQ}", type: ISSUE, first: 0) { issueCount }`,
      `m${i}_p: search(query: "author:${m.login} created:${from}..${to} is:pr${repoQ}", type: ISSUE, first: 0) { issueCount }`,
      `m${i}_c: search(query: "commenter:${m.login} created:${from}..${to} is:pr${repoQ}", type: ISSUE, first: 0) { issueCount }`,
    ])
    .join('\n')

  const query = `{ ${aliases} }`

  try {
    const gql = graphql.defaults({ headers: { authorization: `token ${token}` } })
    const result = await gql<Record<string, { issueCount: number }>>(query)

    return members.map((m, i) => ({
      login: m.login,
      reviews: result[`m${i}_r`]?.issueCount ?? 0,
      prsOpened: result[`m${i}_p`]?.issueCount ?? 0,
      comments: result[`m${i}_c`]?.issueCount ?? 0,
    }))
  } catch (e) {
    throw new Error(`GraphQL fetch failed: ${(e as Error).message}`)
  }
}
