import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { BankRow } from './ledger';
import {
  enablePrivateEncryption, LedgerLockedError, loadPrivateLedger, lockPrivateLedger,
  savePrivateLedger, unlockPrivateLedger, exportEncryptedLedgerBackup, importEncryptedLedgerBackup, changePrivateLedgerPassword,
  rebuildLockedLedgerFromCSV, exportPreviousEncryptedLedgerBackup, hasPreviousEncryptedLedgerBackup,
} from './storage';

const fixture: BankRow = {
  transaction_id: 'private-test-01', date: '2026-11-08', posting_date: '', month: '2026-11',
  bank: 'Testing Bank', account_alias: 'Private', contour: 'ЛИЧНЫЙ',
  flow_type: 'EXPENSE', category: 'Тест', counterparty_description: 'Private merchant',
  amount_rub: '-123.45', cashback_rub: '0', needs_review: 'Да', review_reason: '',
  source_file: 'fixture.csv', payer: 'НЕ УКАЗАН', shared_decision: 'НЕ РЕШЕНО',
  review_confirmed: 'Нет', note: 'Never send to server',
};

function removeDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('nexus-private-ledger');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Browser DB remained open'));
  });
}

async function rawRecord(): Promise<unknown> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('nexus-private-ledger', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('finance', 'readonly').objectStore('finance').get('master-v1');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}

async function overwriteRawForTest(value: unknown): Promise<void> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('nexus-private-ledger', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('finance', 'readwrite');
      tx.objectStore('finance').put(value, 'master-v1');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

describe('Private finance encryption', () => {
  beforeEach(async () => {
    lockPrivateLedger();
    await removeDb();
  });

  it('reads old unencrypted ledgers without destructive migration', async () => {
    await expect(loadPrivateLedger()).resolves.toEqual([]);
    await savePrivateLedger([fixture]);
    await expect(loadPrivateLedger()).resolves.toEqual([fixture]);
  });

  it('requires a password of at least 12 characters without changing existing data', async () => {
    await savePrivateLedger([fixture]);
    await expect(enablePrivateEncryption([fixture], 'short')).rejects.toThrow('12');
    await expect(loadPrivateLedger()).resolves.toEqual([fixture]);
  });

  it('encrypts, locks, rejects wrong password and keeps source details out of raw storage', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'correct synthetic testing password');
    const raw = await rawRecord() as Record<string, unknown>;
    expect(raw.format).toBe('nexus-aes-gcm-v1');
    expect(JSON.stringify(raw)).not.toContain('Private merchant');
    expect(JSON.stringify(raw)).not.toContain(fixture.amount_rub);
    await expect(loadPrivateLedger()).rejects.toBeInstanceOf(LedgerLockedError);

    lockPrivateLedger();
    await expect(savePrivateLedger([fixture])).rejects.toBeInstanceOf(LedgerLockedError);
    await expect(unlockPrivateLedger('incorrect synthetic password')).rejects.toThrow('Неверный пароль');
    await expect(unlockPrivateLedger('correct synthetic testing password')).resolves.toEqual([fixture]);
  });

  it('re-encrypts edits with a fresh IV and survives a simulated browser reload', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'correct synthetic testing password');
    const before = await rawRecord() as { iv: string; data: string };
    const changed = { ...fixture, category: 'Подтверждено', needs_review: 'Нет' as const };
    await savePrivateLedger([changed]);
    const after = await rawRecord() as { iv: string; data: string };
    expect(after.iv).not.toBe(before.iv);
    expect(after.data).not.toBe(before.data);
    lockPrivateLedger();
    await expect(unlockPrivateLedger('correct synthetic testing password')).resolves.toEqual([changed]);
  });

  it('does not corrupt ciphertext if a previously open tab tries to write without unlocking', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'correct synthetic testing password');
    const before = await rawRecord();
    lockPrivateLedger();
    await expect(savePrivateLedger([])).rejects.toBeInstanceOf(LedgerLockedError);
    expect(await rawRecord()).toEqual(before);
  });
  it('refuses to encrypt stale tab data over a newer plaintext version', async () => {
    await savePrivateLedger([fixture]);
    const newer = [{ ...fixture, category: 'Newer browser edit' }];
    await savePrivateLedger(newer);
    await expect(enablePrivateEncryption([fixture], 'correct synthetic testing password'))
      .rejects.toThrow('Реестр изменился');
    expect(await loadPrivateLedger()).toEqual(newer);
  });

  it('aborts stale ciphertext writes if another tab changed its revision', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'correct synthetic testing password');
    const original = await rawRecord() as { format: string; iv: string; data: string };
    const otherTab = { ...original, iv: 'another-tab-committed-a-new-revision' };
    await overwriteRawForTest(otherTab);
    await expect(savePrivateLedger([{ ...fixture, category: 'stale edit' }]))
      .rejects.toThrow('другой вкладкой');
    expect(await rawRecord()).toEqual(otherTab);
  });

  it('never silently loses concurrent encrypted edits from the same browser session', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'correct synthetic testing password');
    const versions = [
      [{ ...fixture, category: 'First edit' }],
      [{ ...fixture, category: 'Second edit' }],
    ];
    const results = await Promise.allSettled(versions.map(rows => savePrivateLedger(rows)));
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    lockPrivateLedger();
    const recovered = await unlockPrivateLedger('correct synthetic testing password');
    expect(['First edit', 'Second edit']).toContain(recovered[0].category);
  });

  it('never replaces encrypted data with plaintext after a stale tab races to save', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'correct synthetic testing password');
    const before = await rawRecord();
    lockPrivateLedger();
    await expect(savePrivateLedger([])).rejects.toBeInstanceOf(LedgerLockedError);
    expect(await rawRecord()).toEqual(before);
  });

  it('changes password while already unlocked, preserving every private row', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'synthetic old password 1234');
    const before = await rawRecord() as { iv: string; salt: string; data: string };
    await changePrivateLedgerPassword([fixture], 'synthetic new password 5678');
    const after = await rawRecord() as { iv: string; salt: string; data: string };
    expect(after.iv).not.toBe(before.iv);
    expect(after.salt).not.toBe(before.salt);
    expect(after.data).not.toBe(before.data);
    lockPrivateLedger();
    await expect(unlockPrivateLedger('synthetic old password 1234')).rejects.toThrow('Неверный пароль');
    await expect(unlockPrivateLedger('synthetic new password 5678')).resolves.toEqual([fixture]);
  });

  it('blocks password rotation if the vault is locked or the new password is weak', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'synthetic old password 1234');
    const before = await rawRecord();
    await expect(changePrivateLedgerPassword([fixture], 'short')).rejects.toThrow('12');
    expect(await rawRecord()).toEqual(before);
    lockPrivateLedger();
    await expect(changePrivateLedgerPassword([fixture], 'synthetic new password 5678')).rejects.toBeInstanceOf(LedgerLockedError);
    expect(await rawRecord()).toEqual(before);
  });

  it('aborts password rotation on stale encrypted ciphertext without corrupting it', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'synthetic old password 1234');
    const current = await rawRecord() as Record<string, unknown>;
    const newer = { ...current, iv: 'different-editor-revision' };
    await overwriteRawForTest(newer);
    await expect(changePrivateLedgerPassword([fixture], 'synthetic new password 5678')).rejects.toThrow('другой вкладке');
    expect(await rawRecord()).toEqual(newer);
  });

  it('exports only ciphertext and restores it safely into a clean browser profile', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'correct synthetic testing password');
    const exported = await exportEncryptedLedgerBackup();
    expect(exported).toContain('nexus-encrypted-finance-backup-v1');
    expect(exported).not.toContain('Private merchant');
    expect(exported).not.toContain('Never send to server');
    lockPrivateLedger();
    await removeDb();
    await importEncryptedLedgerBackup(exported);
    await expect(loadPrivateLedger()).rejects.toBeInstanceOf(LedgerLockedError);
    expect(await unlockPrivateLedger('correct synthetic testing password')).toEqual([fixture]);
  });

  it('refuses to overwrite existing ledger rows during an encrypted backup restore', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'correct synthetic testing password');
    const exported = await exportEncryptedLedgerBackup();
    lockPrivateLedger();
    await removeDb();
    const newer = [{ ...fixture, category: 'Do not overwrite' }];
    await savePrivateLedger(newer);
    await expect(importEncryptedLedgerBackup(exported)).rejects.toThrow('уже есть реестр');
    expect(await loadPrivateLedger()).toEqual(newer);
  });

  it('rejects invalid backup formats without touching the local ledger', async () => {
    await savePrivateLedger([fixture]);
    await expect(importEncryptedLedgerBackup('{}')).rejects.toThrow('Неизвестный формат');
    await expect(importEncryptedLedgerBackup('garbage')).rejects.toThrow('JSON');
    await expect(importEncryptedLedgerBackup('x'.repeat(15 * 1024 * 1024 + 1))).rejects.toThrow('размер');
    expect(await loadPrivateLedger()).toEqual([fixture]);
  });

  it('recovers from lost password using a new passphrase while archiving original ciphertext', async () => {
    const oldPassword = 'synthetic-original-passphrase-2026';
    const newPassword = 'synthetic-new-owner-passphrase-2026';
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], oldPassword);
    const original = await rawRecord();
    lockPrivateLedger();
    const replacement = [{ ...fixture, transaction_id: 'restored-master-01', note: 'from verified master CSV' }];
    await rebuildLockedLedgerFromCSV(replacement, newPassword);
    expect(await hasPreviousEncryptedLedgerBackup()).toBe(true);
    const archive = JSON.parse(await exportPreviousEncryptedLedgerBackup());
    expect(archive.backup_format).toBe('nexus-encrypted-finance-backup-v1');
    expect(archive.data).toBe((original as { data: string }).data);
    expect(JSON.stringify(archive)).not.toContain('Private merchant');
    lockPrivateLedger();
    await expect(unlockPrivateLedger(oldPassword)).rejects.toThrow('Неверный пароль');
    await expect(unlockPrivateLedger(newPassword)).resolves.toEqual(replacement);
    // Original encrypted data remain independently restorable with original key.
    lockPrivateLedger();
    await removeDb();
    await importEncryptedLedgerBackup(JSON.stringify(archive));
    await expect(unlockPrivateLedger(oldPassword)).resolves.toEqual([fixture]);
  });

  it('refuses unsafe repeated password recovery without overwriting the first archive', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'synthetic-password-previous-vault');
    lockPrivateLedger();
    await rebuildLockedLedgerFromCSV([fixture], 'synthetic-password-vault-two');
    const previous = await exportPreviousEncryptedLedgerBackup();
    lockPrivateLedger();
    const active = await rawRecord();
    await expect(rebuildLockedLedgerFromCSV([fixture], 'synthetic-password-vault-three'))
      .rejects.toThrow('Архив предыдущего реестра');
    expect(await rawRecord()).toEqual(active);
    expect(JSON.parse(await exportPreviousEncryptedLedgerBackup()).data).toBe(JSON.parse(previous).data);
  });

  it('does not change a locked vault if replacement has no rows, duplicate IDs or weak password', async () => {
    await savePrivateLedger([fixture]);
    await enablePrivateEncryption([fixture], 'synthetic-valid-original-2026');
    lockPrivateLedger();
    const before = await rawRecord();
    await expect(rebuildLockedLedgerFromCSV([], 'synthetic-new-password-2026')).rejects.toThrow('непустой');
    await expect(rebuildLockedLedgerFromCSV([fixture, fixture], 'synthetic-new-password-2026')).rejects.toThrow('дублирующиеся');
    await expect(rebuildLockedLedgerFromCSV([fixture], 'short')).rejects.toThrow('12 символов');
    expect(await hasPreviousEncryptedLedgerBackup()).toBe(false);
    expect(await rawRecord()).toEqual(before);
  });


});
