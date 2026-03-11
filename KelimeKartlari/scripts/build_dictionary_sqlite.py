import argparse
import gzip
import json
import os
import sqlite3
import sys


def open_input(path):
    if path.endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8")
    return open(path, "rt", encoding="utf-8")


def iter_translations(entry):
    translations = []
    if isinstance(entry.get("translations"), list):
        translations.extend(entry["translations"])
    for sense in entry.get("senses", []):
        if isinstance(sense, dict) and isinstance(sense.get("translations"), list):
            translations.extend(sense["translations"])
    return translations


def is_lang(obj, name, code):
    return obj.get("lang") == name or obj.get("code") == code or obj.get("lang_code") == code


def normalize(text):
    return text.strip().lower()


def main():
    parser = argparse.ArgumentParser(description="Build EN<->TR dictionary SQLite from Kaikki raw JSONL.")
    parser.add_argument("--input", required=True, help="Path to raw-wiktextract-data.jsonl(.gz)")
    parser.add_argument("--output", required=True, help="Output SQLite file path")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of lines processed (0 = no limit)")
    parser.add_argument("--mirror", action="store_true", help="Also insert reversed pairs for each translation")
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.output), exist_ok=True)

    conn = sqlite3.connect(args.output)
    cur = conn.cursor()
    cur.executescript(
        """
        PRAGMA journal_mode=WAL;
        PRAGMA synchronous=NORMAL;

        CREATE TABLE IF NOT EXISTS dictionary (
          id INTEGER PRIMARY KEY,
          source TEXT NOT NULL,
          target TEXT NOT NULL,
          source_lang TEXT NOT NULL,
          target_lang TEXT NOT NULL,
          source_norm TEXT NOT NULL,
          target_norm TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS uniq_pair
          ON dictionary(source_norm, target_norm, source_lang, target_lang);

        CREATE INDEX IF NOT EXISTS idx_source_norm
          ON dictionary(source_lang, source_norm);
        """
    )
    conn.commit()

    insert_sql = """
        INSERT OR IGNORE INTO dictionary
        (source, target, source_lang, target_lang, source_norm, target_norm)
        VALUES (?, ?, ?, ?, ?, ?)
    """

    batch = []
    processed = 0
    inserted = 0

    with open_input(args.input) as f:
        for line in f:
            if args.limit and processed >= args.limit:
                break
            processed += 1
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue

            entry_lang = entry.get("lang")
            entry_code = entry.get("lang_code")
            if entry_lang is None and entry_code is None:
                continue

            translations = iter_translations(entry)
            if not translations:
                continue

            if entry_lang == "English" or entry_code == "en":
                source_lang = "en"
                target_lang = "tr"
                source = entry.get("word") or ""
                if not source:
                    continue
                for tr in translations:
                    if not isinstance(tr, dict):
                        continue
                    if not is_lang(tr, "Turkish", "tr"):
                        continue
                    target = tr.get("word") or tr.get("alt") or tr.get("roman") or ""
                    if not target:
                        continue
                    batch.append((source, target, source_lang, target_lang, normalize(source), normalize(target)))
                    if args.mirror:
                        batch.append((target, source, target_lang, source_lang, normalize(target), normalize(source)))

            if entry_lang == "Turkish" or entry_code == "tr":
                source_lang = "tr"
                target_lang = "en"
                source = entry.get("word") or ""
                if not source:
                    continue
                for tr in translations:
                    if not isinstance(tr, dict):
                        continue
                    if not is_lang(tr, "English", "en"):
                        continue
                    target = tr.get("word") or tr.get("alt") or tr.get("roman") or ""
                    if not target:
                        continue
                    batch.append((source, target, source_lang, target_lang, normalize(source), normalize(target)))
                    if args.mirror:
                        batch.append((target, source, target_lang, source_lang, normalize(target), normalize(source)))

            if len(batch) >= 2000:
                cur.executemany(insert_sql, batch)
                conn.commit()
                inserted += cur.rowcount
                batch = []

            if processed % 100000 == 0:
                print(f"processed={processed} inserted={inserted}")

    if batch:
        cur.executemany(insert_sql, batch)
        conn.commit()
        inserted += cur.rowcount

    conn.close()
    print(f"done: processed={processed} inserted={inserted}")


if __name__ == "__main__":
    main()
