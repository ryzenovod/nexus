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

          // Local endpoint to complete a task in TickTick
          if (url.pathname === '/api/ticktick/complete' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { taskId, projectId } = JSON.parse(body || '{}');
                const cfgPath = path.join(os.homedir(), '.config/ubersicht-dashboard/config.json');
                let token = '';
                if (fs.existsSync(cfgPath)) {
                  try {
                    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
                    token = cfg.ticktick_token || '';
                  } catch {}
                }

                let pid = projectId;
                const syncPath = path.join(os.homedir(), '.config/ubersicht-dashboard/latest_sync.json');
                const livePath = path.join(process.cwd(), 'public/live-data.json');

                if (!pid && fs.existsSync(syncPath)) {
                  try {
                    const syncData = JSON.parse(fs.readFileSync(syncPath, 'utf-8'));
                    const allTasks = [...(syncData.ticktick?.results || []), ...(syncData.ticktick?.inbox || [])];
                    const found = allTasks.find((t: any) => t.id === taskId);
                    if (found && found.projectId) pid = found.projectId;
                  } catch {}
                }

                if (!pid) pid = '6abeae1535d42cc80be02175';

                let ttSuccess = false;
                if (token && taskId) {
                  try {
                    const resp = await fetch(`https://api.ticktick.com/open/v1/project/${pid}/task/${taskId}/complete`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'User-Agent': 'Mozilla/5.0',
                        'Content-Type': 'application/json',
                      },
                    });
                    ttSuccess = resp.ok;
                  } catch (e) {
                    console.warn('TickTick remote complete failed:', e);
                  }
                }

                // Update cached local files so completed task doesn't reappear
                [syncPath, livePath].forEach((filePath) => {
                  if (fs.existsSync(filePath)) {
                    try {
                      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                      if (data.ticktick?.results) {
                        data.ticktick.results = data.ticktick.results.filter((t: any) => t.id !== taskId);
                      }
                      if (data.ticktick?.inbox) {
                        data.ticktick.inbox = data.ticktick.inbox.filter((t: any) => t.id !== taskId);
                      }
                      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
                    } catch {}
                  }
                });

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ success: true, taskId, ttSuccess }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }

          // Local endpoint to create a task in TickTick
          if (url.pathname === '/api/ticktick/create' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const taskData = JSON.parse(body || '{}');
                const cfgPath = path.join(os.homedir(), '.config/ubersicht-dashboard/config.json');
                let token = '';
                if (fs.existsSync(cfgPath)) {
                  try {
                    const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
                    token = cfg.ticktick_token || '';
                  } catch {}
                }

                if (!token) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'ticktick_token missing in config.json' }));
                  return;
                }

                const pid = taskData.projectId || '6abeae1535d42cc80be02175';
                const resp = await fetch('https://api.ticktick.com/open/v1/task', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'Mozilla/5.0',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    title: taskData.title,
                    projectId: pid,
                    content: taskData.content || taskData.notes || '',
                    dueDate: taskData.dueDate || undefined,
                  }),
                });

                const created = await resp.json();
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ success: true, task: created }));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: err.message }));
              }
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
