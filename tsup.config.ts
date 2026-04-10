import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig({
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
    __PKG_NAME__: JSON.stringify(pkg.name),
  },
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
