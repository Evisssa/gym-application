import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/createUser': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/deleteUser': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/updateUser': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
