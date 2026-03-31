import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use the repository name as the base path if deploying to GitHub Pages sub-path, 
  // otherwise default to root '/'. This can be overridden by VITE_BASE_PATH.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      'react-map-gl': 'react-map-gl/dist/esm/index.js',
    },
  },
})
