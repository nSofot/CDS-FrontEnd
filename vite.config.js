import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split large modules into separate chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // all node_modules into vendor.js
          }
          // Optional: split specific large components/pages
          if (id.includes('src/pages/BigPage.jsx')) {
            return 'big-page';
          }
        }
      }
    },
    // optional: increase chunk size warning if you have big chunks
    chunkSizeWarningLimit: 600, // in kB
  }
})
