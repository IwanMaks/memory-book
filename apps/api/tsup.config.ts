import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/entry.node.ts', 'src/entry.vercel.ts'],
  format: 'esm',
  target: 'node22',
  platform: 'node',
  clean: true,
  sourcemap: true,
  // workspace-пакет отдаёт TS-исходники, поэтому вшиваем его в бандл
  noExternal: ['@memory-book/shared'],
})
