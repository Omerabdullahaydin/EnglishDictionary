type DictEntry = {
  source: string;
  target: string;
  source_norm: string;
  target_norm: string;
};

const DB_NAME = 'dictionary-web';
const STORE = 'dictionary';

let dbPromise: Promise<IDBDatabase> | null = null;
let importPromise: Promise<void> | null = null;
let ready = false;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: ['source_norm', 'target_norm'] as any });
        store.createIndex('source_norm', 'source_norm', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function loadJsonEntries() {
  if (importPromise) return importPromise;
  importPromise = (async () => {
    const response = await fetch('/dictionary.json');
    if (!response.ok) throw new Error('dictionary.json not found');
    const entries = (await response.json()) as Array<{ source: string; target: string }>;
    const db = await openDb();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      entries.forEach(entry => {
        const source_norm = entry.source.toLowerCase();
        const target_norm = entry.target.toLowerCase();
        store.put({ ...entry, source_norm, target_norm });
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    ready = true;
  })();
  return importPromise;
}

export async function getDictionaryDb() {
  await loadJsonEntries();
  return true;
}

export async function querySuggestions(prefix: string, limit = 10) {
  await loadJsonEntries();
  const db = await openDb();
  const key = prefix.toLowerCase();

  return new Promise<string[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const index = tx.objectStore(STORE).index('source_norm');
    const results: string[] = [];

    const range = IDBKeyRange.bound(key, `${key}\uffff`);
    const request = index.openCursor(range);

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || results.length >= limit) {
        resolve(results);
        return;
      }
      const value = cursor.value as DictEntry;
      results.push(value.source);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function queryExactTranslations(word: string, limit = 50) {
  await loadJsonEntries();
  const db = await openDb();
  const key = word.toLowerCase();

  return new Promise<string[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const index = tx.objectStore(STORE).index('source_norm');
    const results: string[] = [];

    const range = IDBKeyRange.only(key);
    const request = index.openCursor(range);

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || results.length >= limit) {
        resolve(results);
        return;
      }
      const value = cursor.value as DictEntry;
      results.push(value.target);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}
