# NEXUS — Security hardening, 2026-11-08

## Changes in source

- Removed the public calendar/task snapshot and private seed content from the new public bundle. Sensitive originals are archived only on the Mac in ~/Documents/NEXUS/private-seed-backups/ with mode 700/600.
- Supabase operations require Supabase Auth plus server-enforced membership in public.nexus_members. The public publishable key is not accepted as authorization.
- SQL migration: supabase/security_migration.sql. It drops open RLS policies, revokes anon table permissions, grants member-scoped authenticated CRUD on the legacy NEXUS tables. Enrollment is administrator-only.
- No browser Telegram Bot API requests, no HTTP endpoints for writing tokens, shell execution or mutating TickTick.
- Vite server binds loopback and serves only a filtered read-only local snapshot.
- Old startup storage deletion is disabled, and legacy browser Telegram tokens are sanitized.
- Content Security Policy added. Vitest toolchain upgraded; tests and npm audit run locally and in CI.
- UI built with existing MIT-licensed shadcn/ui components, Radix UI, TanStack Table, Tailwind utility classes; no handwritten CSS files.

## IMPORTANT: database migration is not applied by deploying code

The production Supabase instance remains unverified until its owner applies the migration.

1. Back up the actual hosted Postgres database using Supabase Dashboard.
2. Review and run supabase/security_migration.sql in SQL Editor. It will immediately block anonymous access while preserving rows. Legacy unauthenticated sync will stop.
3. Register the legitimate users in Supabase Auth. Verify both UUIDs in Authentication > Users. In SQL Editor, enroll each verified UUID, using the real value rather than a guessed one:

    insert into public.nexus_members (user_id)
    values ('ACTUAL-UUID-HERE')
    on conflict (user_id) do nothing;

4. Allow the exact redirect URL https://ryzenovod.github.io/nexus/ in Supabase Auth URL Configuration.
5. Log into the web app Settings via email magic link. Only signed-in members may synchronize.
6. Verify SELECT/INSERT/UPDATE/DELETE as anon, authenticated member and authenticated non-member. Supabase documentation recommends testing in a disposable DB first.

## Verify actual server policies (SQL Editor)

    select schemaname, tablename, policyname, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public' and tablename like 'nexus_%'
    order by tablename, policyname;

    select table_name, grantee, privilege_type
    from information_schema.role_table_grants
    where table_schema = 'public' and table_name like 'nexus_%'
      and grantee in ('anon', 'authenticated')
    order by table_name, grantee, privilege_type;

There must be no anonymous grants to private NEXUS tables and no permissive ALL/USING(true) policies.

## Remaining exposure

- Previous Git history still contains old content. Deleting files in the current commit does not erase Git history, third-party clones or caches. Rotate any actual credentials previously published and consider a coordinated history purge.
- Public GitHub Pages always exposes its JavaScript bundle. Do not place private data in source files or assets.
- The app does not encrypt bank IndexedDB data at rest. Physical access to an unlocked browser profile is a remaining risk.
- Existing legacy finance data is NOT a replacement for the master banking ledger.
- Credentials for a server-side TickTick or Telegram integration must remain outside browser code and require authenticated server actions.
- The source migration is not equivalent to proving that production RLS is fixed. Do not claim completion until the project owner has applied and tested it.
