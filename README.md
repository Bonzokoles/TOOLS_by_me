# TOOLS_by_me

> Kolekcja narzędzi deweloperskich autorstwa Bonzokoles

## Zawartość

### I_Do_INDexer/
Async folder indexer (Python 3.11+) — indeksuje strukturę plików z metadanymi.

**Możliwości:**
- BFS scanner z async pipeline extractors
- Metadane: MIME type, hash (MD5/SHA256), język programowania, LOC, wymiary obrazów, duration audio/video
- 3 formaty wyjścia: SQLite (WAL), JSON, JSONL
- 50 concurrent workers, signal handling, progress bar
- Opcjonalne zależności: python-magic, Pillow, pymediainfo

**Użycie:**
```bash
# Windows launcher (instaluje zależności)
START_I_Do_INDEX.bat

# Bezpośrednio
python I_Do_INDEX.py scan "C:\Folder" -o index.db --hash sha256 --code-stats

# Export JSONL
python I_Do_INDEX.py scan "C:\Folder" -f jsonl -o files.jsonl
```

### .workspace_meta/
Uniwersalny meta-folder template (v2.0) dołączany do KAŻDEGO nowego workspace.

**Zawiera:**
- `Definition_of_done.html` — interaktywny dashboard z 90+ skills, task listą, awesome-copilot
- `workspace.spec.json` — maszynowo-czytelna specyfikacja projektu
- `mcp/config.json` — konfiguracja MCP serwerów
- `notes/` — ADR, snapshoty, notatki
- `ToDo/` + `History/` — plikowy system tasków (File System Access API)

**Jak użyć:**
```powershell
# Skopiuj do nowego workspace
Copy-Item -Recurse ".workspace_meta" "ŚCIEŻKA_DO_WORKSPACE\.workspace_meta"
```

## Licencja
Użytek prywatny
