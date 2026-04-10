import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import pc from 'picocolors'

declare const __PKG_VERSION__: string
declare const __PKG_NAME__: string

const CACHE_PATH = join(homedir(), '.pr-score-update.json')
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000 // once per day

interface UpdateCache {
  lastCheck: number
  latestVersion: string
}

function readUpdateCache(): UpdateCache | null {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8')) as UpdateCache
  } catch {
    return null
  }
}

function writeUpdateCache(data: UpdateCache): void {
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(data), 'utf-8')
  } catch {
    // ignore write errors
  }
}

function isNewer(latest: string, current: string): boolean {
  const parse = (v: string) => v.split('.').map(Number) as [number, number, number]
  const [lMaj, lMin, lPat] = parse(latest)
  const [cMaj, cMin, cPat] = parse(current)
  if (lMaj !== cMaj) return lMaj > cMaj
  if (lMin !== cMin) return lMin > cMin
  return lPat > cPat
}

export async function checkForUpdate(): Promise<void> {
  const current = __PKG_VERSION__
  const name = __PKG_NAME__

  try {
    const cache = readUpdateCache()
    const now = Date.now()

    if (cache && now - cache.lastCheck < CHECK_INTERVAL_MS) {
      if (isNewer(cache.latestVersion, current)) {
        printUpdateNotice(cache.latestVersion, current, name)
      }
      return
    }

    const res = await fetch(`https://registry.npmjs.org/${name}/latest`, { signal: AbortSignal.timeout(3000) })
    const data = await res.json() as { version: string }
    const latest = data.version

    writeUpdateCache({ lastCheck: now, latestVersion: latest })

    if (isNewer(latest, current)) {
      printUpdateNotice(latest, current, name)
    }
  } catch {
    // silent fail — no internet, timeout, etc.
  }
}

function printUpdateNotice(latest: string, current: string, name: string): void {
  console.log(pc.yellow(`  update available  ${pc.dim(current)} → ${pc.bold(latest)}`))
  console.log(pc.dim(`  npm install -g ${name}`))
  console.log('')
}
