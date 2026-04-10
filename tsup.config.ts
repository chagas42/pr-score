import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  bundle: true,
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node',
  },
  noExternal: [],
})
