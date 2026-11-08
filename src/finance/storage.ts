import type { BankRow } from './ledger';

// Separate IndexedDB store: never reaches existing Supabase sync code.
const DB_NAME = 'nexus-private-ledger';
const STORE = 'finance';
const KEY = 'master-v1';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Не удалось открыть IndexedDB'));
    request.onblocked = () => reject(new Error('Хранилище заблокировано другой вкладкой'));
  });
}
export async function loadPrivateLedger(): Promise<BankRow[]> {
  const db = await open();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => reject(req.error ?? new Error('Ошибка чтения'));
    });
  } finally { db.close(); }
}
export async function savePrivateLedger(rows: BankRow[]): Promise<void> {
  const db = await open();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(rows, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Ошибка записи'));
      tx.onabort = () => reject(tx.error ?? new Error('Запись прервана'));
    });
  } finally { db.close(); }
}
