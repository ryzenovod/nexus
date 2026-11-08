import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Safe local development bridge: read-only snapshot on loopback.
 * No shell execution, token writes or TickTick mutation endpoints.
 */
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'nexus-production-csp',
      apply: 'build' as const,
      transformIndexHtml(html: string) {
        const csp = "default-src 'self'; base-uri 'self'; object-src 'none'; frame-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; form-action 'self'";
        return html.replace('<meta charset="UTF-8" />',
          '<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="' + csp + '" />');
      },
    },
    {
      name: 'nexus-local-readonly-feed',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = new URL(req.url || '/', 'http://127.0.0.1').pathname;
          if (!pathname.startsWith('/api/')) return next();

          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.setHeader('X-Content-Type-Options', 'nosniff');

          const host = req.headers.host || '';
          const origin = req.headers.origin;
          if (!['127.0.0.1:5173', 'localhost:5173'].includes(host)
              || (origin && !['http://127.0.0.1:5173', 'http://localhost:5173'].includes(origin))) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'Localhost only' }));
            return;
          }

          if (req.method !== 'GET' || !['/api/live-sync', '/api/sync'].includes(pathname)) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'No local write endpoints; use authorized service integrations' }));
            return;
          }

          const file = path.join(os.homedir(), '.config/ubersicht-dashboard/latest_sync.json');
          try {
            if (!fs.existsSync(file)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'No local snapshot yet' }));
              return;
            }
            if (fs.statSync(file).size > 2_000_000) {
              res.statusCode = 413;
              res.end(JSON.stringify({ error: 'Local snapshot exceeds size limit' }));
              return;
            }
            const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
            // Never expose the full local configuration file or arbitrary secret fields.
            const keep = (item: any): any => {
              if (Array.isArray(item)) return item.map(keep);
              if (item && typeof item === 'object') {
                return Object.fromEntries(Object.entries(item)
                  .filter(([key]) => !/token|secret|cookie|password|authorization|api.?key/i.test(key))
                  .map(([key, value]) => [key, keep(value)]));
              }
              return item;
            };
            const safe = keep({ gcal: data.gcal ?? { items: [] },
              ticktick: data.ticktick ?? { results: [], inbox: [] } });
            res.end(JSON.stringify(safe));
          } catch {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Unable to read local snapshot' }));
          }
        });
      },
    },
  ],
  base: './',
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173, host: '127.0.0.1', strictPort: true },
  preview: { host: '127.0.0.1' },
});
