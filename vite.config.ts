import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { exec } from 'child_process';
import os from 'os';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'live-sync-middleware',
      configureServer(server) {
        server.middlewares.use('/api/sync', (req, res) => {
          const scriptPath = path.join(os.homedir(), '.config/ubersicht-dashboard/fetch_data.py');
          exec(`python3 "${scriptPath}"`, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: err.message, stderr }));
              return;
            }
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(stdout);
          });
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
