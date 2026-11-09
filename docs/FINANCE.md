# NEXUS Finance — locally verified bank ledger

Implemented in React at **Финансы и ЖКХ → Финансовый реестр**.

## Data flow

- Real bank statements live outside the Git repository: ~/Documents/NEXUS/transactions.csv.
- The website starts without bank data. The user imports transactions.csv, or an authorized local Mac automation seeds browser IndexedDB.
- Ledger state is stored in IndexedDB database nexus-private-ledger, separate from Zustand and Supabase. It is per browser and website origin; it is NOT cloud synchronization.
- The new app does not send bank rows to the network. Never commit CSVs or copy them into public/.
- Re-importing the same transaction ID is idempotent. Conflicting bank evidence (date, amount, account, merchant or cashback) causes an error. Existing classifications are not silently overwritten.
- The website exports full edited ledger and/or shared-purchase decisions.
- Optional IndexedDB encryption: enter a password of 12+ characters and select **Зашифровать** in Finance. The browser uses AES-256-GCM with an independent 96-bit nonce per write and PBKDF2-SHA256 (310,000 rounds, random salt). The password is never synced, stored or transmitted. The old unencrypted store is migrated only when the owner explicitly enables protection.
- Portable encrypted backups: in Finance select **Шифр. копия** to export a `.nexus` file containing only AES-GCM ciphertext, salt, nonce and version. This works even while the ledger is locked, and does not send the bank data to a server. To restore, use **Восстановить .nexus** on a fresh empty browser ledger, then unlock with the original password. Restoration never overwrites existing rows. A .nexus backup alone does NOT recover a forgotten password.
- If the original encryption password is unavailable, **Finance → Нет доступа к паролю? Восстановить из CSV** provides a deliberate replacement workflow: select a complete private master CSV, choose and repeat a NEW password, acknowledge the risk and type the confirmation phrase. The old AES-GCM ciphertext is atomically archived under a separate IndexedDB key rather than deleted. This is **not decrypting** the old data; unexported browser-only edits may be absent from the replacement. The preserved old ciphertext can be downloaded from Finance even while the new vault is locked, and still requires the OLD password.
- Password autofill is not guaranteed: a generic Mac Keychain entry created outside Safari Passwords is not an internet-password login for the GitHub Pages origin. Search Keychain Access login keychain for the NEXUS ledger entry; Safari's suggested supabase.com password is unrelated to the ledger.
- After encryption, page reloads and locking require the same password. **The app itself cannot recover a forgotten password.** Store the recovery key securely outside the app (for example in the OS password manager) and create an offline CSV backup. CSV exports remain unencrypted unless protected outside the app. Past plaintext remnants may remain in browser/system backups; encryption is not retroactive disk erasure.

- Local Python master remains the source of truth. To apply the exported file:

    cd ~/Documents/NEXUS
    python3 nexus_engine.py apply-ledger-edits ~/Downloads/nexus_transactions_edited.csv
    python3 nexus_engine.py summary

  Or, to apply only decisions:

    cd ~/Documents/NEXUS
    python3 nexus_engine.py apply-decisions ~/Downloads/nexus_shared_decisions.csv
    python3 nexus_engine.py summary

- Both Python merge commands create a timestamped backup before overwriting the master. A stale browser export that would undo a previously confirmed merchant classification is rejected.
- To bring verified local-master changes into an already populated browser, first unlock the ledger, click **Сверить мастер**, and choose `~/Documents/NEXUS/transactions.csv`. This action validates all immutable bank fields and merges only safe grocery categorizations without changing user notes, bank amounts, contours or joint decisions. It is not automatic filesystem sync.

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
- Credit-card available limits are not cash or bank deposits. Reward units and cashback must be tracked separately from purchases and card balances.

## Reconciliation state

- The local master contains partially imported statements from several banks; source coverage varies. **Exact bank counts, transaction amounts, coverage dates and spending totals are intentionally omitted from this public repository.**
- The narrow rule `alfa-card-known-grocery-merchant-v1` categorizes observed external grocery-card merchants. It confirms only purchases already assigned to the personal contour before the configured cohabitation date. Later unassigned purchases retain their review flag.
- The private Mac master has more recent reviewed categories than the encrypted Safari ledger. After unlocking Safari, use **Сверить мастер** to merge these decisions. No private bank rows are included in Git.
- See the private local `~/Documents/NEXUS/STATE.md` for exact balances and reconciliation metrics.

## Banking coverage and safe review operations

- The **Банки** tab lists the six expected bank sources even if a statement is missing. It reports only transaction count and observed first/last dates; missing sources show zero and em dashes instead of invented dates.
- An imported row does **not** certify full historical coverage. Sources absent from the browser ledger do not contribute to financial totals.
- Reverting an approved shared purchase to *НЕ РЕШЕНО* or changing an approved decision reopens review. Unallocated expenses cannot become confirmed simply by toggling a status flag.
- A failed autosave blocks locking, enabling encryption and exporting an encrypted backup until the failure is resolved. While the ledger is still open, use the unencrypted CSV export to preserve any unsaved corrections in a secure location.

## Boundaries

- The legacy Карты и ЖКХ section uses local Zustand state and is not merged with the bank ledger. To prevent both couple members from seeing personal finances, **legacy transactions and cashback-card metadata are excluded from cloud upload and download**. The shared `nexus_finances` table has no client permissions until user-specific ownership rules exist.
- The production shared-state RLS migration was applied and anonymous REST access was blocked on 2026-11-08. Supabase Auth users have not been enrolled; the separate bank ledger must remain local until user-scoped bank-data policies and end-to-end authentication tests exist.
- No automatic bank API access, payments, card repayments or transfers; read-only parsing and review.
- Browser persistence is local; export CSV for a durable backup.

## Internal transfer candidate matching

The «Связки переводов» tab uses a read-only one-to-one matcher: opposite signed amounts equal to a kopek, different observed banks, dates within three days. Ambiguous matches and unmatched records are shown separately. No pair changes flow types, owner allocations, spending, income, or settlements. Missing bank statements can produce zero matches without proving no transfers happened.

## Change vault password

When an encrypted finance ledger is already unlocked, the owner can choose «Изменить пароль» to re-encrypt it with a new owner-chosen password (at least 12 characters), without needing the old plaintext phrase. Each rotation creates a new salt and checks that the record has not changed in another tab. After rotation, export a fresh encrypted backup; older backups still require their original password. When locked without the old password, the separate CSV recovery workflow can create a new vault after explicit owner confirmation. A password offered by Safari for supabase.com is NOT the NEXUS finance ledger password.

## Potential duplicate imports

Finance > Контроль качества displays groups of distinct transaction IDs sharing the exact observed bank, account, operation date, signed amount in kopeks and normalized merchant description. These are only possible import duplicates: two equal charges from the same merchant on one day may both be legitimate. The app never deletes, merges or silently excludes any of these records. Confirmation requires original bank evidence.
