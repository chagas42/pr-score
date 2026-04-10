import { Command, Option } from 'commander';
import pc from 'picocolors';

declare const __PKG_VERSION__: string;

import { buildLeaderboard, buildStreaks } from './aggregator';
import { getCached, saveCache } from './cache';
import { resolveConfig } from './config';
import { render as renderCompact } from './display/compact';
import { renderDanilera } from './display/danilera';
import { render as renderFull } from './display/full';
import { runInit } from './init';
import { checkForUpdate } from './update';

const program = new Command();

program
  .name('pr-score')
  .description('GitHub PR review leaderboard for your team')
  .version(__PKG_VERSION__);

program
  .command('init')
  .description('Interactive first-time setup')
  .action(async () => {
    await runInit();
  });

program
  .option('--org <org>', 'GitHub org')
  .option('--team <team>', 'Team slug')
  .option('--repo <repo>', 'Filter to a specific repo (org/repo)')
  .option('--range <range>', 'week | month | quarter', 'week')
  .option('--full', 'Show full detailed table', false)
  .option('--me <login>', 'Your GitHub login')
  .option('--refresh', 'Ignore cache and fetch fresh data', false)
  .option('--streak', 'Show review streak (consecutive days)', false)
  .addOption(new Option('-d, --danilera').default(false).hideHelp())
  .action(
    async (flags: {
      org?: string;
      team?: string;
      repo?: string;
      range?: string;
      full?: boolean;
      me?: string;
      refresh?: boolean;
      streak?: boolean;
      danilera?: boolean;
    }) => {
      const config = resolveConfig(flags);
      if (!config.ok) {
        console.error(pc.red(config.error));
        process.exit(1);
      }

      const showDanilera = flags.danilera ?? false;
      const showStreak = flags.streak ?? false;
      const cached = flags.refresh ? null : getCached(config.data);

      if (cached) {
        const streaks = showStreak
          ? await buildStreaks(
              config.data,
              cached.data.map((s) => s.login)
            )
          : undefined;
        if (config.data.full) {
          renderFull(cached.data, config.data, {
            cached: true,
            ageMs: cached.ageMs,
            ...(streaks !== undefined && { streaks }),
          });
        } else {
          await renderCompact(cached.data, config.data, {
            cached: true,
            ageMs: cached.ageMs,
            ...(streaks !== undefined && { streaks }),
          });
        }
        if (showDanilera) renderDanilera(cached.data, config.data.me);
        return;
      }

      const result = await buildLeaderboard(config.data);
      if (!result.ok) {
        console.error(pc.red(result.error));
        process.exit(1);
      }

      saveCache(config.data, result.data);

      const streaks = showStreak
        ? await buildStreaks(
            config.data,
            result.data.map((s) => s.login)
          )
        : undefined;

      if (config.data.full) {
        renderFull(result.data, config.data, {
          cached: false,
          ageMs: 0,
          ...(streaks !== undefined && { streaks }),
        });
      } else {
        await renderCompact(result.data, config.data, {
          cached: false,
          ageMs: 0,
          ...(streaks !== undefined && { streaks }),
        });
      }
      if (showDanilera) renderDanilera(result.data, config.data.me);
      await checkForUpdate();
    }
  );

program.parse();
