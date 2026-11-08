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
  revision: string; // Last committed ciphertext IV, for cross-tab conflict detection.
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
  return { rows: rows as BankRow[], state: { key, salt, rounds: value.rounds, revision: value.iv } };
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

/**
 * Verify and write inside one IndexedDB transaction. A separate get then put
 * can overwrite ciphertext when another tab encrypts or edits the ledger.
 */
async function checkedWrite(value: unknown, verify: (existing: unknown) => void): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      let explicitError: Error | null = null;
      const read = store.get(KEY);
      read.onsuccess = () => {
        try {
          verify(read.result);
          store.put(value, KEY);
        } catch (e) {
          explicitError = e instanceof Error ? e : new Error(String(e));
          tx.abort();
        }
      };
      read.onerror = () => {
        explicitError = read.error ?? new Error('Ошибка проверки сохранённого реестра');
        tx.abort();
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(explicitError ?? tx.error ?? new Error('Ошибка записи'));
      tx.onabort = () => reject(explicitError ?? tx.error ?? new Error('Запись прервана'));
    });
  } finally {
    db.close();
  }
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
  const initial = await getRaw();
  if (isSealed(initial)) throw new LedgerLockedError();
  if (initial != null && !Array.isArray(initial)) throw new Error('Неизвестный формат банковского реестра');
  if (JSON.stringify(initial ?? []) !== JSON.stringify(rows)) {
    throw new Error('Реестр изменился в другой вкладке. Обнови страницу перед шифрованием.');
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const state: UnlockSession = {
    key: await deriveKey(password, salt, ROUNDS),
    salt,
    rounds: ROUNDS,
    revision: '',
  };
  const encrypted = await seal(rows, state);
  await checkedWrite(encrypted, existing => {
    if (isSealed(existing)) throw new LedgerLockedError();
    if (JSON.stringify(existing ?? []) !== JSON.stringify(rows)) {
      throw new Error('Реестр изменился при шифровании. Обнови страницу.');
    }
  });
  state.revision = encrypted.iv;
  session = state; // Enter encrypted mode only after IndexedDB transaction commits.
}

export async function savePrivateLedger(rows: BankRow[]): Promise<void> {
  if (session) {
    const active = session;
    const expectedRevision = active.revision;
    const encrypted = await seal(rows, active);
    await checkedWrite(encrypted, existing => {
      if (!isSealed(existing)) throw new LedgerLockedError();
      if (existing.salt !== toBase64(active.salt)
          || existing.rounds !== active.rounds
          || existing.iv !== expectedRevision) {
        throw new Error('Реестр обновлён другой вкладкой. Экспортируй свои правки, затем обнови страницу.');
      }
    });
    active.revision = encrypted.iv;
    return;
  }
  await checkedWrite(rows, existing => {
    if (isSealed(existing)) throw new LedgerLockedError();
    if (existing != null && !Array.isArray(existing)) {
      throw new Error('Неизвестный формат банковского реестра');
    }
  });
}


const BACKUP_FORMAT = 'nexus-encrypted-finance-backup-v1';
const MAX_BACKUP_SIZE = 15 * 1024 * 1024;

function validatedEncryptedRecord(value: unknown): SealedLedger {
  if (!isSealed(value)) throw new Error('Файл не является зашифрованным реестром NEXUS');
  const sealed = value as SealedLedger;
  if (sealed.rounds !== ROUNDS
      || typeof sealed.salt !== 'string'
      || typeof sealed.iv !== 'string'
      || typeof sealed.data !== 'string'
      || sealed.data.length > MAX_BACKUP_SIZE) {
    throw new Error('Недопустимая версия или размер зашифрованной копии');
  }
  try {
    if (fromBase64(sealed.salt).length !== 16
        || fromBase64(sealed.iv).length !== 12
        || fromBase64(sealed.data).length < 16) {
      throw new Error('Invalid ciphertext length');
    }
  } catch {
    throw new Error('Повреждённый формат зашифрованной копии');
  }
  return { format: FORMAT, rounds: ROUNDS, salt: sealed.salt, iv: sealed.iv, data: sealed.data };
}

/** Export only ciphertext and metadata; never decrypt or expose the finance password. */
export async function exportEncryptedLedgerBackup(): Promise<string> {
  const sealed = validatedEncryptedRecord(await getRaw());
  return JSON.stringify({
    backup_format: BACKUP_FORMAT,
    exported_at: new Date().toISOString(),
    ...sealed,
  }, null, 2);
}

/**
 * Restore only into an empty ledger. Existing records can NEVER be silently
 * overwritten by an imported file. Unlock later to verify GCM authentication.
 */
export async function importEncryptedLedgerBackup(contents: string): Promise<void> {
  if (contents.length > MAX_BACKUP_SIZE || contents.length === 0) {
    throw new Error('Недопустимый размер файла резервной копии');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error('Неверный JSON резервной копии');
  }
  if (!parsed || typeof parsed !== 'object'
      || (parsed as { backup_format?: unknown }).backup_format !== BACKUP_FORMAT) {
    throw new Error('Неизвестный формат резервной копии NEXUS');
  }
  const sealed = validatedEncryptedRecord(parsed);
  await checkedWrite(sealed, existing => {
    if (existing != null && !(Array.isArray(existing) && existing.length === 0)) {
      throw new Error('На устройстве уже есть реестр. Сначала сохрани его копию: импорт не перезаписывает данные.');
    }
  });
  session = null;
}

export function lockPrivateLedger(): void {
  session = null;
}
export function privateLedgerEncryptionActive(): boolean {
  return session !== null;
}
