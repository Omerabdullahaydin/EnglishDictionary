import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const DB_NAME = 'dictionary.db';
const DB_DIR = `${FileSystem.documentDirectory}SQLite`;
const DB_PATH = `${DB_DIR}/${DB_NAME}`;

type SQLiteDatabase = {
  transaction: (fn: (tx: { executeSql: (sql: string, params?: (string | number)[], ok?: any, err?: any) => void }) => void, onError?: (err: any) => void, onSuccess?: () => void) => void;
};

let dbInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

async function ensureDbFile() {
  const dirInfo = await FileSystem.getInfoAsync(DB_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DB_DIR, { intermediates: true });
  }

  const dbInfo = await FileSystem.getInfoAsync(DB_PATH);
  if (dbInfo.exists) return;

  const asset = Asset.fromModule(require('../assets/dictionary/dictionary.db'));
  await asset.downloadAsync();
  const sourceUri = asset.localUri ?? asset.uri;
  await FileSystem.copyAsync({ from: sourceUri, to: DB_PATH });
}

export async function getDictionaryDb() {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (Platform.OS === 'web') {
      throw new Error('SQLite is not supported on web');
    }
    const SQLite = await import('expo-sqlite');
    await ensureDbFile();
    dbInstance = SQLite.openDatabase(DB_NAME) as SQLiteDatabase;
    await initializeSchema(dbInstance);
    return dbInstance;
  })();

  return initPromise;
}

function queryAll<T>(db: SQLiteDatabase, sql: string, params: (string | number)[]) {
  return new Promise<T[]>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result.rows._array as T[]),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}

export async function querySuggestions(prefix: string, limit = 10) {
  if (Platform.OS === 'web') return [];
  const db = await getDictionaryDb();
  const like = `${prefix.toLowerCase()}%`;

  const rows = await queryAll<{ source: string }>(
    db,
    `
      SELECT DISTINCT source
      FROM dictionary
      WHERE source_norm LIKE ?
      ORDER BY source_norm
      LIMIT ?
    `,
    [like, limit]
  );

  return rows.map(r => r.source);
}

export async function queryExactTranslations(word: string, limit = 50) {
  if (Platform.OS === 'web') return [];
  const db = await getDictionaryDb();
  const key = word.toLowerCase();

  const rows = await queryAll<{ target: string }>(
    db,
    `
      SELECT DISTINCT target
      FROM dictionary
      WHERE source_norm = ?
      LIMIT ?
    `,
    [key, limit]
  );

  return rows.map(r => r.target);
}

async function initializeSchema(db: SQLiteDatabase) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS dictionary (
      id INTEGER PRIMARY KEY,
      source TEXT NOT NULL,
      target TEXT NOT NULL,
      source_lang TEXT NOT NULL,
      target_lang TEXT NOT NULL,
      source_norm TEXT NOT NULL,
      target_norm TEXT NOT NULL
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS uniq_pair
      ON dictionary(source_norm, target_norm, source_lang, target_lang);`,
    `CREATE INDEX IF NOT EXISTS idx_source_norm
      ON dictionary(source_lang, source_norm);`,
  ];

  await new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      statements.forEach(sql => tx.executeSql(sql));
    }, reject, resolve);
  });
}
