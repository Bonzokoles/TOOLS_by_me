# TOOLS_by_me

Prywatne repozytorium narzedzi i katalogow — lokalny stack deweloperski Bonzokoles.
Wszystko co tu jest, jest aktywnie uzywane.

---

## Narzedzia

### I_Do_INDexer/

Python 3.11+ async indexer do mapowania duzych folderow i dyskow.
Wyjscie: SQLite (WAL), JSON lub JSONL z pelna hierarchia, MIME, hashami, LOC i statystykami kodu.
Zintegrowany z JIMBOKIT_COMMS — wynik laduje jako `_01.db` do obiegu agentowego ZENO.

```cmd
agent_indexer.bat "C:\Folder" nazwa_bazy
```

Pliki:
- `I_Do_INDEX.py` — silnik skanera (async, 50 workerow, BFS pipeline)
- `zeno_indexer.py` — wrapper JIMBOKIT_COMMS
- `agent_indexer.bat` — launcher CLI dla agentow i uzytkow recznych

---

### CAY_FEED_conventer/

Konwerter feedow produktowych (XML, JSON, CSV, YAML) z obsuga streaming dla duzych plikow.
Dziala jako mikrousuga na porcie 4658. Wyjscie zapisuje jako `_02.json` do JIMBOKIT_COMMS.

Uruchomienie dla uzytkownika:
```
run_windows_hidden.vbs   — otwiera UI w przegladarce, serwer w tle
```

Uruchomienie dla agenta (headless):
```cmd
agent_convert.bat "https://dostawca.pl/feed.xml" xml nazwa_wyniku
```

Podzia duzych plikow XML przez REST:
```
POST http://localhost:4658/api/split_xml
{"input_path": "...", "split_tag": "product", "chunk_size": 2000}
```

Pliki:
- `zen_bridge.py` — backend (FastAPI/Flask, streaming parser)
- `index.html` — frontend UI
- `agent_convert.bat` — CLI launcher
- `run_windows_hidden.vbs` — launcher bez konsoli

---

## Katalogi

### apps-catalog.html

Katalog aplikacji webowych i PWA w stylu ZENO Start (amber/dark, monospace).
23 kategorie: AI, Dev, Design, Cloud, Media, Security, Finance i inne.
Miniaturki przez WordPress mshots, favicony przez Google s2.
Dane w localStorage, export/import JSON, filtrowanie po kategorii przez URL hash (`#cat=ai`).

### tools-catalog.html / TOOLS_CATALOG/

Katalog narzedzi deweloperskich — repozytoria GitHub, CLI, biblioteki.
88+ narzedzi, 12 kategorii, rating gwiazdkowy, auto-fetch metadanych z URL.
Export JSON, LocalStorage persistence.

---

## Infrastruktura workspace

### .workspace_meta/

Szablon meta-folderu dolaczany do kazdego nowego workspace.
Zawiera: `Definition_of_done.html` (dashboard 90+ skills), `workspace.spec.json`,
konfiguracje MCP, foldery History/ToDo, notatki ADR.

```powershell
Copy-Item -Recurse ".workspace_meta" "SCIEZKA_DO_WORKSPACE\.workspace_meta"
```

### GITNEXUS/

Konfiguracja GitNexus (code intelligence) dla VS Code.
Zawiera agent Copilot, snippet MCP, snippet system prompt i skrypt setup.

```powershell
.\GITNEXUS\setup-workspace.ps1
```

---

## Licencja

Uzynek prywatny.
