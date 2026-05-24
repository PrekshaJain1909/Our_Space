import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Reduce spurious file-change events (OneDrive / editor temp files)
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.vscode/**',
        '**/*~',
        '**/~*',
        '**/*-Journal/**',
        '**/OneDrive/**'
      ]
    }
  }
})
