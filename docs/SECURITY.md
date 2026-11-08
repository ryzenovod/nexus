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

## Production RLS applied and verified — 2026-11-08

The production Supabase project was inspected and updated via its authorized SQL Editor. Before migration, the only NEXUS table was `nexus_sync`, containing zero rows and one permissive RLS policy; neither `anon` nor `authenticated` had direct table grants, and Supabase Auth contained zero users.

A private pre-migration archive was created in `nexus_security_archive`, containing the schema-preserving copy of `nexus_sync` and the original policy metadata. RLS is enabled on the archive and client roles have no schema access. The migration was adapted for missing legacy tables and applied successfully.

Post-migration checks: RLS enabled on `nexus_sync` and `nexus_members`; four membership-restricted policies on the former and one self-read policy on the latter; zero public or `USING(true)` policies; no `anon` SELECT/INSERT grants. The public-key REST request for `nexus_sync` returned HTTP 401. Supabase Auth Site URL and its allowed redirect are both `https://ryzenovod.github.io/nexus/`. Public signups and anonymous sign-ins are disabled, email confirmation is enabled.

**Remaining onboarding:** Supabase Auth still has no real users. Only the owner may invite confirmed participants, verify their Auth UUIDs and add those UUIDs to `nexus_members`. Do not infer identities from old task notes or create arbitrary accounts. Test actual member/non-member sessions before enabling cross-device private sync. Banking data are intentionally not part of this shared-state system.

In any other environment, the source SQL migration must be applied separately after taking its own backup. Deployment of frontend code does not modify remote database policies.

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
- Bank IndexedDB data can now be encrypted with an explicit passphrase. By default, existing installations remain plaintext until the owner enables protection. Web Crypto AES-GCM with PBKDF2 is used; encrypted browser data cannot be recovered without the passphrase.
- Encryption protects stored bank rows, not data exposed to a compromised unlocked browser/session, malicious browser extensions, screenshots, or previously copied plaintext. The browser and OS remain part of the trusted computing base.
- Arbitrary task/wishlist/bill links are restricted to HTTP(S) without embedded URL credentials. A utility bill is only marked paid after explicit confirmation, never merely because its payment website was opened.
- Existing legacy finance data is NOT a replacement for the master banking ledger.
- Credentials for a server-side TickTick or Telegram integration must remain outside browser code and require authenticated server actions.
- Production RLS was applied and an unauthenticated REST request was blocked on 2026-11-08. End-to-end testing for legitimate members and non-members remains pending until actual user accounts are invited.


## 2026-11-08 production verification & GitHub protection

- Production Supabase RLS changed and verified using authenticated SQL Editor. Before: only nexus_sync table, zero rows, one public/true policy but no anon/authenticated grants. Now: nexus_sync has RLS and four membership policies; nexus_members has RLS and self-read policy; no public unrestricted policies. Anonymous REST request returned 401.
- Private backup retained in database schema nexus_security_archive; anon/authenticated have no access. The source migration was adapted to skip absent legacy tables and published in Git.
- Supabase Auth site URL and allowed redirect URL now set to https://ryzenovod.github.io/nexus/. Anonymous sign-in and public signup disabled; email confirmation enabled. No actual users or membership entries yet. Cloud sync remains unavailable pending owner-verified invitations.
- GitHub repo settings: Dependency graph, Dependabot alerts, Dependabot security updates and private vulnerability reporting enabled and verified. Push protection already on.
- After Git history rewrite, old commit objects are still retrievable by direct SHA; GitHub Support ticket #4972776 exists (Open) requesting cache/object purge, no duplicate ticket needed. Support may decide if purging is warranted.
- Browser app backup exported to ~/Documents/NEXUS/backups/browser-snapshot-20261108-233043/nexus-backup-2026-11-08.json (permissions 600), containing 58 tasks, 15 wishlist items, 1 legacy transaction. Bank master remains separate with 254 rows.
