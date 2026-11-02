import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'nexus-local-bridge',
      configureServer(server) {
        // Fast local bridge for live data
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url || '', 'http://localhost');
          
          if (url.pathname === '/api/live-sync' || url.pathname === '/api/sync') {
            const syncFile = path.join(os.homedir(), '.config/ubersicht-dashboard/latest_sync.json');
            const scriptPath = path.join(os.homedir(), '.config/ubersicht-dashboard/fetch_data.py');
            const isForce = url.searchParams.get('force') === 'true';

            // Check if latest_sync.json is fresh (< 60s)
            if (!isForce && fs.existsSync(syncFile)) {
              try {
                const stats = fs.statSync(syncFile);
                const ageMs = Date.now() - stats.mtimeMs;
                if (ageMs < 60_000) {
                  const cachedData = fs.readFileSync(syncFile, 'utf-8');
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.setHeader('X-Cache-Hit', 'true');
                  res.end(cachedData);
                  return;
                }
              } catch (e) {
                // fallback to exec
              }
            }

            // Execute script
            exec(`python3 "${scriptPath}"`, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
              if (err) {
                // If script errors but cache exists, return cache
                if (fs.existsSync(syncFile)) {
                  const cachedData = fs.readFileSync(syncFile, 'utf-8');
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(cachedData);
                  return;
                }
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: err.message, stderr }));
                return;
              }
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(stdout);
            });
            return;
          }

          // Local endpoint to save Supabase keys to ~/.config/ubersicht-dashboard/.env
          if (url.pathname === '/api/save-supabase-env' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { url: sbUrl, key: sbKey } = JSON.parse(body);
                if (sbUrl && sbKey) {
                  const envPath = path.join(os.homedir(), '.config/ubersicht-dashboard/.env');
                  fs.writeFileSync(envPath, `SUPABASE_URL="${sbUrl}"\nSUPABASE_KEY="${sbKey}"\n`, 'utf-8');
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({ success: true, message: 'Saved to .env' }));
                  return;
                }
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing url or key' }));
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }

          next();
        });
      },
    },
  ],
  base: './',
  server: {
    port: 5173,
    host: true,
  },
});
