# Met à jour la date des documents régénérés dans docs/index.json (date du jour, heure de Paris)
import json, os, sys
from common import ISO, HERE
idx = os.path.join(HERE, "..", "docs", "index.json")
files = sys.argv[1:] or None
data = json.load(open(idx, encoding="utf-8"))
for d in data:
    if files is None or d["file"] in files:
        d["date"] = ISO
json.dump(data, open(idx, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("dates mises à jour :", ", ".join(d["file"] for d in data if files is None or d["file"] in files))
