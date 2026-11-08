import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
function read(relativePath: string) {
  return readFileSync(new URL(relativePath, root), 'utf8');
}

describe('NEXUS public build security contract', () => {
  it('never embeds an unauthenticated public task/calendar snapshot', () => {
    expect(existsSync(new URL('public/live-data.json', root))).toBe(false);
    expect(read('src/store/useNexusStore.ts')).not.toContain("fetch('./live-data.json'");
  });

  it('has no open USING(true) database policies in deployment SQL', () => {
    for (const filename of ['supabase/schema.sql', 'supabase/security_migration.sql']) {
      const sql = read(filename).toLowerCase();
      expect(sql).not.toMatch(/using\s*\(\s*true\s*\)/);
      expect(sql).toContain('auth.uid()');
      expect(sql).toContain('revoke all');
      expect(sql).toContain('nexus_members');
    }
  });

  it('requires authorized members for shared cloud sync', () => {
    const source = read('src/services/supabaseClient.ts');
    expect(source).toContain('authorizedClient');
    expect(source).toContain('client.auth.getUser()');
    expect(source).toContain("from('nexus_members')");
    expect(source).not.toMatch(/Authorization:[^\n]+anonKey/);
  });

  it('does not include public write bridge or browser bot token requests', () => {
    const server = read('vite.config.ts');
    expect(server).toContain("host: '127.0.0.1'");
    expect(server).not.toContain('api/ticktick/create');
    expect(server).not.toContain('api/ticktick/complete');
    expect(server).not.toContain('api/save-supabase-env');
    expect(server).not.toContain('exec(');
    expect(read('src/services/telegramBotService.ts')).not.toContain('api.telegram.org/bot');
  });

  it('has restrictive CSP and no embedded credential notes', () => {
    expect(read('vite.config.ts')).toContain('Content-Security-Policy');
    expect(read('vite.config.ts')).toContain("object-src 'none'");
    const source = read('src/data/nexusInitialData.ts');
    expect(source).not.toMatch(/Пароль:/i);
    expect(source).not.toMatch(/Логин:/i);
    expect(source).toContain('initialTasks: NexusTask[] = []');
  });
});
