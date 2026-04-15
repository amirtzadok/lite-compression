import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['gifsicle-wasm-browser']
  },
  build: {
    target: 'esnext'
  }
})
