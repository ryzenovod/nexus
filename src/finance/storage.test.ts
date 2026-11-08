import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { BankRow } from './ledger';
import {
  enablePrivateEncryption, LedgerLockedError, loadPrivateLedger, lockPrivateLedger,
  savePrivateLedger, unlockPrivateLedger,
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

});
