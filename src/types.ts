export const RANGES = ['week', 'month', 'quarter'] as const;
export type Range = (typeof RANGES)[number];

export interface Member {
  login: string;
  name: string | null;
}

export interface MemberScore {
  login: string;
  reviews: number;
  prsOpened: number;
  comments: number;
}

export interface LeaderboardOptions {
  token: string;
  org: string;
  team?: string;
  repo?: string;
  range: Range;
  full: boolean;
  me?: string;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
