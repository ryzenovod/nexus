import type { BankRow } from './ledger';

// All banking rows are private to this browser origin. Nothing enters Zustand/Supabase.
const DB_NAME = 'nexus-private-ledger';
const STORE = 'finance';
const KEY = 'master-v1';
const FORMAT = 'nexus-aes-gcm-v1';
const ROUNDS = 310_000;
const AAD = new TextEncoder().encode(FORMAT);

interface SealedLedger {
  format: typeof FORMAT;
  rounds: number;
  salt: string;
  iv: string;
  data: string;
}

interface UnlockSession {
  key: CryptoKey;
  salt: Uint8Array;
  rounds: number;
}

let session: UnlockSession | null = null;

export class LedgerLockedError extends Error {
  constructor() {
    super('Финансовые данные зашифрованы. Введи пароль для разблокировки.');
    this.name = 'LedgerLockedError';
  }
}

function isSealed(value: unknown): value is SealedLedger {
  return !!value && typeof value === 'object' && (value as SealedLedger).format === FORMAT;
}

function toBase64(bytes: Uint8Array): string {
  let output = '';
  for (let start = 0; start < bytes.length; start += 8192) {
    output += String.fromCharCode(...bytes.subarray(start, start + 8192));
  }
  return btoa(output);
}

function fromBase64(text: string): Uint8Array {
  return Uint8Array.from(atob(text), char => char.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array, rounds: number): Promise<CryptoKey> {
  if (!globalThis.crypto?.subtle) throw new Error('Этот браузер не поддерживает Web Crypto');
  const input = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: Uint8Array.from(salt), iterations: rounds, hash: 'SHA-256' },
    input, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
}

async function seal(rows: BankRow[], state: UnlockSession): Promise<SealedLedger> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(rows));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: AAD }, state.key, plaintext,
  );
  return {
    format: FORMAT, rounds: state.rounds,
    salt: toBase64(state.salt), iv: toBase64(iv),
    data: toBase64(new Uint8Array(ciphertext)),
  };
}

async function unseal(value: SealedLedger, password: string): Promise<{
  rows: BankRow[]; state: UnlockSession;
}> {
  if (value.rounds !== ROUNDS) throw new Error('Неподдерживаемая версия зашифрованных данных');
  const salt = fromBase64(value.salt);
  const iv = fromBase64(value.iv);
  if (salt.length !== 16 || iv.length !== 12) throw new Error('Неверный формат шифрованного реестра');
  const key = await deriveKey(password, salt, value.rounds);
  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Uint8Array.from(iv), additionalData: AAD },
      key, Uint8Array.from(fromBase64(value.data)),
    );
  } catch {
    throw new Error('Неверный пароль или повреждённые данные');
  }
  const rows = JSON.parse(new TextDecoder().decode(decrypted));
  if (!Array.isArray(rows)) throw new Error('Расшифрованные данные имеют неверный формат');
  return { rows: rows as BankRow[], state: { key, salt, rounds: value.rounds } };
}

function openDatabase(): Promise<IDBDatabase> {
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

async function getRaw(): Promise<unknown> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Ошибка чтения'));
    });
  } finally { db.close(); }
}

async function putRaw(value: unknown): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Ошибка записи'));
      tx.onabort = () => reject(tx.error ?? new Error('Запись прервана'));
    });
  } finally { db.close(); }
}

export async function loadPrivateLedger(): Promise<BankRow[]> {
  const data = await getRaw();
  if (isSealed(data)) throw new LedgerLockedError();
  if (data == null) return [];
  if (!Array.isArray(data)) throw new Error('Неизвестный формат банковского реестра');
  return data as BankRow[];
}

export async function unlockPrivateLedger(password: string): Promise<BankRow[]> {
  const data = await getRaw();
  if (!isSealed(data)) throw new Error('Реестр не зашифрован');
  const result = await unseal(data, password);
  session = result.state;
  return result.rows;
}

export async function enablePrivateEncryption(rows: BankRow[], password: string): Promise<void> {
  if (password.length < 12) throw new Error('Пароль должен содержать не менее 12 символов');
  const current = await getRaw();
  if (isSealed(current)) throw new LedgerLockedError();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const state: UnlockSession = { key: await deriveKey(password, salt, ROUNDS), salt, rounds: ROUNDS };
  const encrypted = await seal(rows, state);
  await putRaw(encrypted);
  session = state; // only enter encrypted mode after the database transaction commits
}

export async function savePrivateLedger(rows: BankRow[]): Promise<void> {
  if (session) {
    await putRaw(await seal(rows, session));
    return;
  }
  // A second/old browser tab must not overwrite ciphertext with plaintext.
  if (isSealed(await getRaw())) throw new LedgerLockedError();
  await putRaw(rows);
}

export function lockPrivateLedger(): void {
  session = null;
}
export function privateLedgerEncryptionActive(): boolean {
  return session !== null;
}
