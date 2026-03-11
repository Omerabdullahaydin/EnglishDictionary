import argparse
import json
import sqlite3


def main():
    parser = argparse.ArgumentParser(description="Export dictionary.db to web dictionary.json")
    parser.add_argument("--input", required=True, help="Path to dictionary.db")
    parser.add_argument("--output", required=True, help="Output dictionary.json path")
    parser.add_argument("--limit", type=int, default=0, help="Limit rows (0 = all)")
    args = parser.parse_args()

    conn = sqlite3.connect(args.input)
    cur = conn.cursor()

    sql = "SELECT DISTINCT source, target FROM dictionary"
    if args.limit and args.limit > 0:
        sql += f" LIMIT {args.limit}"

    cur.execute(sql)

    with open(args.output, "w", encoding="utf-8") as f:
        f.write("[")
        first = True
        for row in cur:
            item = {"source": row[0], "target": row[1]}
            if not first:
                f.write(",")
            f.write(json.dumps(item, ensure_ascii=False))
            first = False
        f.write("]")

    conn.close()


if __name__ == "__main__":
    main()
