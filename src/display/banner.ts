import pc from 'picocolors';

// art col width (fixed) so text alignment stays stable
const ART_WIDTH = 30;
const ROW_DELAY_MS = 65;
const CLEAR_DELAY_MS = 18;

const ROWS: [string, string][] = [
  ['  ▄▄▄       ▄▄███▄▄       ', ''],
  ['▄█▀▀▀▄▄     ██   ██       ', ''],
  ['██   ██     ██   ██       ', ''],
  ['██   ██   ▄▄▀▀ ▄▄▀▀       ', ''],
  ['▀█▄  ▀▀▄  ██   ██         ', pc.bold('pr-score')],
  [' ██    █  ██   ████  ███  ', 'pull request review'],
  [' ██     ██    █    ██   ██', 'leaderboard for your team'],
  ['   ██         █    ██   ██', ''],
  ['   ██        ▄█    ██   ██', pc.dim('github.com/chagas42/gh-prs')],
  ['   ▄▄▀▀▀▀▀▀▀▀▀▀▄▄▄▄▀▀▄▄▄██', ''],
  [' ▄▄▀▀          ██▀▀  ▀▀▀██', ''],
  ['▄█▀     ▄▄▄▄▄▄▄▀▀       ██', ''],
  ['██     ▄▀▀▀▀▀▀▀         ██', ''],
  ['██     ▀                ██', ''],
  [' ██                     ██', ''],
  [' ██                     ██', ''],
  ['   ████               ████', ''],
  ['   ██  ▀▀▀     ▀▀▀▀▀▀▀  ██', ''],
  ['   ██                   ██', ''],
  ['   ██                   ██', ''],
];

export function printBanner(): void {
  console.log('');
  for (const [art, text] of ROWS) {
    const pad = ' '.repeat(Math.max(0, ART_WIDTH - art.length) + 3);
    console.log(`  ${pc.white(art)}${pad}${text}`);
  }
  console.log('');
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function startBannerAnimation(): { clear(): Promise<void> } {
  if (!process.stdout.isTTY) return { async clear() {} };

  let printed = 0;

  process.stdout.write('\n');

  const timer = setInterval(() => {
    if (printed >= ROWS.length) {
      clearInterval(timer);
      return;
    }
    const row = ROWS[printed];
    if (!row) {
      printed++;
      return;
    }
    const [art, text] = row;
    const pad = ' '.repeat(Math.max(0, ART_WIDTH - art.length) + 3);
    process.stdout.write(`  ${pc.white(art)}${pad}${text}\n`);
    printed++;
  }, ROW_DELAY_MS);

  return {
    async clear() {
      clearInterval(timer);
      // Erase rows bottom-to-top so it "rolls up" instead of vanishing instantly.
      // +1 accounts for the leading \n written before the first row.
      const total = printed + 1;
      for (let i = 0; i < total; i++) {
        if (i > 0) await sleep(CLEAR_DELAY_MS);
        process.stdout.write('\x1b[1A\r\x1b[2K');
      }
    },
  };
}
