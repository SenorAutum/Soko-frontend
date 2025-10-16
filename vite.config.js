import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin enables HTTPS for your local server
    basicSsl()
  ],
  server: {
    // Run the server on HTTPS
    https: true,
    // Optional: Ensure CORS is still enabled
    cors: true
  }
})