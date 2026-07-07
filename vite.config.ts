import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Project Pages are served from https://<user>.github.io/printsimpleproxies/,
  // so built asset URLs need that prefix. The dev server stays at the root.
  base: command === 'build' ? '/printsimpleproxies/' : '/',
  plugins: [vue()],
}))
