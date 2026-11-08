# NEXUS Finance — locally verified bank ledger

Implemented in React at **Финансы и ЖКХ → Финансовый реестр**.

## Data flow

- Real bank statements live outside the Git repository: ~/Documents/NEXUS/transactions.csv.
- The website starts without bank data. The user imports transactions.csv, or an authorized local Mac automation seeds browser IndexedDB.
- Ledger state is stored in IndexedDB database nexus-private-ledger, separate from Zustand and Supabase. It is per browser and website origin; it is NOT cloud synchronization.
- The new app does not send bank rows to the network. Never commit CSVs or copy them into public/.
- Re-importing the same transaction ID is idempotent. Conflicting amounts/bank/date cause an error.
- The website exports full edited ledger and/or shared-purchase decisions.
- Optional IndexedDB encryption: enter a password of 12+ characters and select **Зашифровать** in Finance. The browser uses AES-256-GCM with an independent 96-bit nonce per write and PBKDF2-SHA256 (310,000 rounds, random salt). The password is never synced, stored or transmitted. The old unencrypted store is migrated only when the owner explicitly enables protection.
- After encryption, page reloads and locking require the same password. **There is no password recovery**; create and protect a CSV backup before enabling encryption. CSV exports remain unencrypted unless protected outside the app. Past plaintext remnants may remain in browser/system backups; encryption is not retroactive disk erasure.

- Local Python master remains the source of truth. To apply the exported file:

    cd ~/Documents/NEXUS
    python3 nexus_engine.py apply-ledger-edits ~/Downloads/nexus_transactions_edited.csv
    python3 nexus_engine.py summary

  Or, to apply only decisions:

    cd ~/Documents/NEXUS
    python3 nexus_engine.py apply-decisions ~/Downloads/nexus_shared_decisions.csv
    python3 nexus_engine.py summary

- Both Python merge commands create a timestamped backup before overwriting the master.

## Accounting

- EXPENSE: external purchase, counted only when needs_review = Нет.
- INCOME: confirmed external income, counted only when needs_review = Нет.
- INTERNAL_TRANSFER: own-bank transfers, savings, marketplace wallet top-ups, credit-card repayment; not income/consumption.
- JOINT_SETTLEMENT: couple contributions or compensation; not consumption.
- REVIEW_REQUIRED: unknown third-party transfers, cash withdrawals, ambiguous payments; excluded from clean expenses.
- REFUND: reduces expenses rather than counting as income.
- Shared candidates are purchases on or after 2026-10-21. Date does not prove that a purchase is joint.
- Marking a purchase ОБЩАЯ or ЛИЧНАЯ changes contour, but does not clear review without explicit confirmation.
- Paid amounts do not equal debt: participants must agree on allocation and settlements.
- WB Bank is a credit card with 100000 RUB limit, not cash. WB cashback units are equivalent to 1 RUB, tracked separately.

## Import coverage 2026-11-08

- 254 loaded rows: Alfa Bank 237, WB Bank 6, T-Bank 11.
- All 67 rows typed EXPENSE are pending review, so confirmed clean expense is 0.
- 179 rows in review queue; 23 potential joint purchases.
- Alfa period about 2026-09-18 to 2026-11-03, WB and T-Bank partial imports. Sber, VTB, Ozon not imported.
- Gross negative debits 418586.23 RUB across imported rows are NOT clean consumption.

## Boundaries

- The legacy Карты и ЖКХ section still uses the old Zustand/Supabase model. Its totals are not merged with the bank ledger.
- The production shared-state RLS migration was applied and anonymous REST access was blocked on 2026-11-08. Supabase Auth users have not been enrolled; the separate bank ledger must remain local until user-scoped bank-data policies and end-to-end authentication tests exist.
- No automatic bank API access, payments, card repayments or transfers; read-only parsing and review.
- Browser persistence is local; export CSV for a durable backup.
