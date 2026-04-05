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

### TOOLS_CATALOG/
Standalone HTML katalog 88+ narzędzi deweloperskich z dark theme UI.

**Możliwości:**
- 88+ narzędzi w 12 kategoriach (AI, Cloud, DevOps, Security, Frontend, Backend...)
- System ocen 3 gwiazdek (★★★) — klikalny rating na kartach i w modalu
- Auto-fetch z URL — wklej link GitHub/dowolny i automatycznie pobierze metadane
- Auto-kategoryzacja i auto-tagi na podstawie treści README
- Filtrowanie po kategoriach, statusie (Priorytet/Wdrożone/Odrzucone) i gwiazdkach
- LocalStorage persistence — dodane narzędzia i zmiany statusów zapisywane lokalnie
- Export JSON całego katalogu
- Responsywny glassmorphism dark UI

**Użycie:**
```powershell
# Otwórz w przeglądarce
start TOOLS_CATALOG.html

# Lub z file protocol
start "file:///C:/Users/Bonzo2/Desktop/TOOLS_CATALOG.html"
```

### GITNEXUS/
Konfiguracja GitNexus — code intelligence dla workspace'ów VS Code (backup).

**Zawiera:**
- `agent/gitnexus.agent.md` — agent Copilot z protokołem impact/context/rename
- `mcp-config-snippet.json` — wpis MCP do `.workspace_meta/mcp/config.json`
- `vscode-system-prompt-snippet.md` — sekcja do globalnego `RULES.instructions.md`
- `setup-workspace.ps1` — automatyczna konfiguracja workspace

**Użycie:**
```powershell
# W rocie projektu:
.\GITNEXUS\setup-workspace.ps1

# Lub ręcznie:
npx gitnexus analyze
```

## Licencja
Użytek prywatny
