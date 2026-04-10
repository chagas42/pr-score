import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { LeaderboardOptions, MemberScore } from './types';

const CACHE_PATH = join(homedir(), '.pr-score-cache.json');
const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  key: string;
  timestamp: number;
  data: MemberScore[];
}

interface CacheFile {
  entries: CacheEntry[];
}

function cacheKey(options: LeaderboardOptions): string {
  return [options.org, options.team ?? '*', options.range, options.repo ?? '*'].join('/');
}

function readCache(): CacheFile {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8')) as CacheFile;
  } catch {
    return { entries: [] };
  }
}

function writeCache(file: CacheFile): void {
  writeFileSync(CACHE_PATH, JSON.stringify(file, null, 2), 'utf-8');
}

export function getCached(
  options: LeaderboardOptions
): { data: MemberScore[]; ageMs: number } | null {
  const key = cacheKey(options);
  const file = readCache();
  const entry = file.entries.find((e) => e.key === key);
  if (!entry) return null;
  const ageMs = Date.now() - entry.timestamp;
  if (ageMs > TTL_MS) return null;
  return { data: entry.data, ageMs };
}

export function saveCache(options: LeaderboardOptions, data: MemberScore[]): void {
  const key = cacheKey(options);
  const file = readCache();
  const existing = file.entries.findIndex((e) => e.key === key);
  const entry: CacheEntry = { key, timestamp: Date.now(), data };
  if (existing >= 0) {
    file.entries[existing] = entry;
  } else {
    file.entries.push(entry);
  }
  writeCache(file);
}

export function formatAge(ageMs: number): string {
  const minutes = Math.round(ageMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 minute ago';
  return `${minutes} minutes ago`;
}
