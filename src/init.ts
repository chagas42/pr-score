import { input, select, confirm } from '@inquirer/prompts'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { spawnSync } from 'node:child_process'
import type { Octokit } from '@octokit/rest'
import { createClient } from './github'

const TOKEN_URL =
  'https://github.com/settings/tokens/new?scopes=repo,read:org&description=pr-score'

function openBrowser(url: string): void {
  const cmd =
    process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start'
    : 'xdg-open'
  spawnSync(cmd, [url])
}

function getGhToken(): string | null {
  try {
    const result = spawnSync('gh', ['auth', 'token'], { encoding: 'utf-8' })
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim()
    return null
  } catch {
    return null
  }
}

async function resolveToken(): Promise<string> {
  const ghToken = getGhToken()

  if (ghToken) {
    process.stdout.write('Verifying gh CLI token...')
    try {
      const client = createClient(ghToken)
      await client.rest.users.getAuthenticated()
      process.stdout.write(' ✓\n')
      console.log('  GitHub CLI detected — token reused automatically\n')
      return ghToken
    } catch {
      process.stdout.write(' expired, will create a new one\n\n')
    }
  }

  const shouldOpen = await confirm({
    message: 'Open browser to create a GitHub token (repo + read:org scopes)?',
    default: true,
  })

  if (shouldOpen) {
    openBrowser(TOKEN_URL)
    console.log(`\n  Opened: ${TOKEN_URL}\n`)
  } else {
    console.log(`\n  Create a token at: ${TOKEN_URL}\n`)
  }

  while (true) {
    const token = await input({ message: 'Paste your GitHub token:' })
    if (!token.trim()) {
      console.error('Token cannot be empty.')
      continue
    }

    process.stdout.write('Verifying...')
    try {
      const client = createClient(token.trim())
      await client.rest.users.getAuthenticated()
      process.stdout.write(' ✓\n\n')
      return token.trim()
    } catch (e) {
      process.stdout.write('\n')
      console.error(`Invalid token: ${(e as Error).message}\n`)
    }
  }
}

async function resolveOrg(client: Octokit): Promise<string> {
  try {
    process.stdout.write('Fetching your orgs...')
    const { data } = await client.rest.orgs.listForAuthenticatedUser({ per_page: 100 })
    process.stdout.write('\r                        \r')

    if (data.length === 0) {
      return input({ message: 'GitHub org (none found automatically):' })
    }

    if (data.length === 1 && data[0]) {
      console.log(`✓ Org: ${data[0].login}`)
      return data[0].login
    }

    return select({
      message: 'Select your GitHub org:',
      choices: data.map((o) => ({ name: o.login, value: o.login })),
    })
  } catch {
    return input({ message: 'GitHub org:' })
  }
}

async function resolveTeam(client: Octokit, org: string): Promise<string | undefined> {
  try {
    process.stdout.write('Fetching teams...')
    const { data } = await client.rest.teams.list({ org, per_page: 100 })
    process.stdout.write('\r                \r')

    if (data.length === 0) return undefined

    const choice = await select({
      message: 'Select your team:',
      choices: [
        { name: '— all org members —', value: '' },
        ...data.map((t) => ({ name: `${t.name}  (${t.slug})`, value: t.slug })),
      ],
    })

    return choice || undefined
  } catch {
    const team = await input({
      message: 'Team slug (leave empty for all org members):',
      default: '',
    })
    return team.trim() || undefined
  }
}

async function resolveMe(client: Octokit): Promise<string | undefined> {
  try {
    const { data } = await client.rest.users.getAuthenticated()
    console.log(`✓ Your login: ${data.login}`)
    return data.login
  } catch {
    const me = await input({ message: 'Your GitHub login (to highlight your row):' })
    return me.trim() || undefined
  }
}

export async function runInit(): Promise<void> {
  console.log('')
  const token = await resolveToken()
  const client = createClient(token)

  const org = await resolveOrg(client)
  const team = await resolveTeam(client, org)
  const me = await resolveMe(client)

  const config = {
    token,
    org,
    ...(team ? { team } : {}),
    ...(me ? { me } : {}),
  }

  const path = join(homedir(), '.pr-score.json')
  writeFileSync(path, JSON.stringify(config, null, 2), 'utf-8')
  console.log(`\n✓ saved to ${path}`)
}
