import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/Saemaul/' : '/',
  plugins: [
    react(),
    {
      name: 'md-utf8',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.endsWith('.md')) {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          }
          next();
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
