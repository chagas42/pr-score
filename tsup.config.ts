import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  bundle: true,
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node',
  },
  noExternal: [/.*/],
})
