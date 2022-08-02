import { rmSync } from 'fs'
import { join } from 'path'
import { defineConfig, Plugin, UserConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import electron from 'vite-plugin-electron'

rmSync('dist', { recursive: true, force: true })
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(),
  electron({
    main: {
      entry: 'electron/main/index.ts',
      vite: withDebug({
        build: {
          outDir: 'dist/electron/main',
        },
      }),
    },
    preload: {
      input: {
        // You can configure multiple preload here
        index: join(__dirname, 'electron/preload/index.ts'),
      },
      vite: {
        build: {
          // For Debug
          sourcemap: 'inline',
          outDir: 'dist/electron/preload',
        },
      },
    },
    // Enables use of Node.js API in the Renderer-process
    renderer: {},
  }),
  ],
  server: {
    host: '127.0.0.1',
    port: 3344,
  },
})

function withDebug(config: UserConfig): UserConfig {
  if (process.env.VSCODE_DEBUG) {
    if (!config.build) config.build = {}
    config.build.sourcemap = true
    config.plugins = (config.plugins || []).concat({
      name: 'electron-vite-debug',
      configResolved(config) {
        const index = config.plugins.findIndex(p => p.name === 'electron-main-watcher');
        // At present, Vite can only modify plugins in configResolved hook.
        (config.plugins as Plugin[]).splice(index, 1)
      },
    })
  }
  return config
}