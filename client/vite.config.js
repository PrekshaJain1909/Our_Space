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
        // Removed '**/OneDrive/**' because the project is inside OneDrive on Windows.
        // Ignoring the OneDrive folder caused Vite's watcher to ignore all project files,
        // preventing HMR from seeing changes. If you still experience missed events,
        // consider enabling polling below (slower, but reliable on some setups).
      ]
      // Example fallback (uncomment if needed):
      // usePolling: true,
      // interval: 100
    }
  }
})
