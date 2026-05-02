# 🔄 ZENO CAY_FEED_Converter

Narzędzie do konwersji i obróbki feedów produktowych (XML, JSON, YAML, CSV) zaprojektowane pod rygorystyczne standardy **ZENO Architecture**.
Obsługuje bardzo duże pliki poprzez natywny streaming i integruje się bezpośrednio z przepływem danych `JIMBOKIT_COMMS` (protokół sufiksów stanu `_02`).

## 📁 Struktura Folderu
W ramach optymalizacji pozostawiono tylko niezbędne pliki:
```
CAY_FEED_conventer/
├── index.html                   # Interfejs graficzny UI (Frontend)
├── zen_bridge.py                # Silnik konwersji, API oraz Headless mode (Backend)
├── run_windows_hidden.vbs       # Launcher graficzny dla użytkownika (zero-console)
├── agent_convert.bat            # Launcher CLI dla Agentów (Pi/Goose)
└── README.md                    # Dokumentacja (ten plik)
```

---

## 👨‍💻 Instrukcja dla Użytkownika (Bonzo)

Narzędzie pracuje jako mikrousługa, która nie blokuje terminala.

1. **Uruchomienie:** Kliknij podwójnie w `run_windows_hidden.vbs`.
2. Otworzy się przeglądarka z narzędziem, a serwer backendowy podepnie się w tle.
3. W panelu możesz:
   - Konwertować mniejsze pliki przez URL lub Upload.
   - W sekcji na dole wywołać **podział ogromnych plików XML** na pakiety.
   - Zapisywać bezpośrednio do obiegu agentowego klikając **"WYŚLIJ DO ZENOBROWSER (_02)"**.
4. Wszelkie konwersje i podziały zapisują się bezpośrednio do `U:\WWW_Zen_BRo_wser_tool\JIMBOKIT_COMMS\`.
5. Serwer działa w tle (proces `pythonw.exe`). Możesz zamknąć przeglądarkę, a agenty nadal będą mogły korzystać z API na porcie 4658. Jeśli musisz ubić proces całkowicie, użyj `taskkill /F /IM pythonw.exe`.

---

## 🤖 STEPS & INSTRUCTIONS FOR AGENT PI / GOOSE

Jako Agent, nie potrzebujesz używać interfejsu graficznego. Moduł ETL jest przygotowany do pracy Headless (w terminalu).

### Narzędzie: `agent_convert.bat`
Używaj tego skryptu do konwersji zewnętrznych linków lub lokalnych plików bezpośrednio do formatu stanu Tabularis (`_02.json`).

**Składnia:**
```cmd
agent_convert.bat <URL_lub_PLIK> <FORMAT: xml|csv|json> <NAZWA_WYNIKU>
```

**Przykład Użycia (Pobranie i konwersja do JSON):**
```cmd
cd U:\WWW_Zen_BRo_wser_tool\CAY_FEED_conventer
agent_convert.bat "https://www.meblepumo.pl/data/export/feed.xml" xml pumo_feed
```
**Wynik:** Powstanie plik `U:\WWW_Zen_BRo_wser_tool\JIMBOKIT_COMMS\pumo_feed_02.json`, który następnie możesz zaczytać do analizy jako Agent.

### Narzędzie API: Podział dużych plików XML (Streaming)
Jeśli plik XML od dostawcy jest bardzo duży i brakuje pamięci do jego analizy, zleć podział przez lokalne REST API.

**Endpoint:** `POST http://localhost:4658/api/split_xml`
**Payload (JSON):**
```json
{
  "input_path": "U:\\WWW_Zen_BRo_wser_tool\\duzy_feed.xml",
  "split_tag": "product",
  "chunk_size": 2000
}
```
**Wynik:** Serwer podzieli plik asynchronicznie i zapisze części z odpowiednimi sufiksami np. `duzy_feed_part_1_02.xml` do folderu `JIMBOKIT_COMMS`.

---
**Status Dokumentu:** MANDATE (ZENO Standard)
**Ostatnia aktualizacja:** 26 Kwietnia 2026
