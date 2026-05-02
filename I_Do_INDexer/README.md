# 🔍 ZENO I_Do_INDexer

Potężny silnik indeksujący strukturę plików, metadane oraz statystyki kodu, zintegrowany z systemem agentowym ZENO. 
Odpowiada za tworzenie bazy wiedzy o dużych zbiorach danych (Protokół Sufiksów: `_01`).

## 📁 Struktura Folderu
```
I_Do_INDexer/
├── I_Do_INDEX.py         # Główny silnik Jimbo v2.0 (Logic)
├── zeno_indexer.py       # Wrapper integrujący z JIMBOKIT_COMMS
├── agent_indexer.bat     # Launcher dla Agentów (Pi/Goose)
├── .venv/                # Izolowane środowisko Python
└── README.md             # Ta dokumentacja
```

---

## 👨‍💻 Instrukcja dla Użytkownika (Bonzo)

Narzędzie służy do błyskawicznego mapowania dużych folderów lub dysków.

1. **Uruchomienie ręczne:** Jeśli chcesz zaindeksować konkretny folder do bazy SQLite:
   ```cmd
   agent_indexer.bat "C:\Twoja\Sciezka" moja_baza
   ```
2. **Wynik:** Plik `moja_baza_01.db` pojawi się w folderze `JIMBOKIT_COMMS`.
3. Możesz go otworzyć dowolną przeglądarką SQLite, aby zobaczyć statystyki plików, hashe, rozmiary i typy MIME.

---

## 🤖 STEPS & INSTRUCTIONS FOR AGENT PI / GOOSE

Jako Agent, używasz tego narzędzia do "zrozumienia" struktury dużych zbiorów danych, których nie możesz przeczytać w całości do kontekstu.

### Zadanie: Indeksowanie zasobów
Zawsze, gdy musisz przeanalizować folder z dużą ilością plików (>10MB danych), użyj `agent_indexer.bat`.

**Komenda:**
```cmd
cd U:\WWW_Zen_BRo_wser_tool\I_Do_INDexer
agent_indexer.bat "<TARGET_PATH>" "<JOB_NAME>"
```

**Workflow:**
1. Zaindeksuj dane do pliku `_01.db`.
2. Użyj skilla `sqlite_query`, aby przeszukać bazę `_01.db` w poszukiwaniu konkretnych plików (np. "znajdź wszystkie obrazy powyżej 5MB" lub "pokaż pliki modyfikowane wczoraj").
3. Na podstawie wyników z bazy, decyduj które konkretne pliki wczytać do dalszej analizy.

---
**Status Dokumentu:** MANDATE (ZENO Standard)
**Ostatnia aktualizacja:** 26 Kwietnia 2026
