# ZENO THE_COMMAND_CENTER

Niestandardowa strona nowej karty dla Chromium/Chrome — zbudowana jako modyfikacja rozszerzenia BrowserOS.

> "FEAR CAUSES HESITATION & HESITATION WILL CAUSE YOUR WORST FEARS TO BECOME A REALITY"

## Funkcje

| Moduł | Opis |
|-------|------|
| **Multi-engine search** | Brave, DuckDuckGo, Google, SearXNG (localhost:8888), Perplexity |
| **AI Chatboxy** | Claude, ChatGPT, Gemini, Perplexity, Grok, DeepSeek, Ollama, OpenRouter, LM Studio |
| **App Catalog** | Katalog webaplikacji: 23 kategorie, tagi, statusy, oceny, import/export JSON |
| **BRO Lab** | Edytor HTML/CSS/JS z live preview (12 slotów zapis, eksport .html) |
| **Tematy** | Firefly Ember, Linear, Framer, Bugatti — przełączane w locie |
| **DEV terminal** | Inline CSS/JS editor do modyfikacji strony bez przeładowania |
| **AI assistant** | OpenRouter API (Claude/GPT/Gemini/DeepSeek) + zapis notatek przez JIMBO Hub |
| **Status serwisów** | Ping: zenbrowsers.org, stolarnia-ams.workers.dev, JIMBO Hub :4111, SearXNG :8888 |
| **Zegar** | Cyfrowy zegar z datą po polsku |

## Pliki

```
ZENO-THE-COMMAND-CENTER/
├── app.html            # Glowna strona nowej karty (ZENO THE_COMMAND_CENTER)
├── app-script.js       # Logika: tematy, wyszukiwarka, karty AI, szybkie linki, DEV panel, AI tab
├── apps-catalog.html   # App Catalog — strona pelnego katalogu aplikacji
├── apps-catalog.js     # Logika katalogu: CRUD, filtry, kategorie, import/export JSON
├── bro-lab.html        # BRO Lab — edytor HTML/CSS/JS z live preview (12 slotow zapis)
├── manifest.json       # Manifest rozszerzenia Chrome MV3 (BrowserOS "Assistant" v0.0.102.0)
└── README.md           # Ten plik
```

## Instalacja

### Metoda 1 — BrowserOS (zalecana)

1. Zainstaluj [BrowserOS](https://browseros.com) (Chromium z wbudowanym AI)
2. Rozszerzenie "Assistant" jest wbudowane — ID: `bflpfmnmnokmjhmgnolecpppdbdophmk`
3. Skopiuj pliki do folderu rozszerzenia:
   ```
   C:\Users\<USER>\AppData\Local\Chromium\User Data\Default\Extensions\
     bflpfmnmnokmjhmgnolecpppdbdophmk\<WERSJA>\
   ```
4. Zastap: `app.html`, `app-script.js`, `apps-catalog.html`, `apps-catalog.js`, `bro-lab.html`
5. W Chromium: `chrome://extensions` → odswiez rozszerzenie (ikona odswiezania)
6. Otworz nowa karte — gotowe

### Metoda 2 — Rozpakowane rozszerzenie (dowolny Chrome/Chromium)

1. Stworz folder np. `zeno-extension/`
2. Skopiuj wszystkie pliki z tego katalogu
3. Stworz folder `icon/` z ikonami PNG (16, 32, 48, 96, 128px)
4. Edytuj `manifest.json`:
   - Usun pola `key` i `update_url`
   - Ewentualnie zmien `name` na wlasna nazwe
5. Chrome/Chromium: `chrome://extensions` → wlacz "Tryb dewelopera" → "Zaladuj rozpakowane" → wskaz folder
6. Otworz nowa karte

### Wymagania opcjonalne

| Usluga | Port | Do czego |
|--------|------|---------|
| **JIMBO Hub** | :4111 | Zapis notatek przez AI (fs/append), status ping |
| **SearXNG** | :8888 | Lokalna wyszukiwarka (self-hosted) |
| **Ollama** | :11434 | Lokalny LLM |
| **LM Studio** | :1234 | Lokalny GUI dla modeli |

Bez tych uslug strona dziala normalnie.

## Konfiguracja

Wszystkie ustawienia sa zapisywane w `localStorage` przegladarki:

| Klucz | Opis |
|-------|------|
| `zeno-theme` | Aktywny temat (`firefly-pro-ember`, `linear`, `framer`, `bugatti`) |
| `zeno-font` | Wybrany font |
| `zeno-engine` | Aktywna wyszukiwarka |
| `zeno-dev-css` | Custom CSS z DEV terminala |
| `zeno-dev-js` | Custom JS z DEV terminala |
| `zeno-ai-key` | Klucz OpenRouter API |
| `zeno-ai-model` | Wybrany model AI |
| `app_catalog_v2` | Dane katalogu aplikacji (JSON) |
| `bro-lab-v1` | Dane BRO Lab (12 slotow z kodem) |

## Tematy

| Temat | Accent | Styl |
|-------|--------|------|
| `firefly-pro-ember` | `#ff9a3c` | Mroczny terminal, retro amber |
| `linear` | `#5e6ad2` | Minimalistyczny, ciemny niebieski |
| `framer` | `#0099ff` | Nowoczesny, gradient niebieski/fiolet |
| `bugatti` | `#ffffff` | Czarno-bialy, ultra minimalistyczny |

Temat synchronizuje sie automatycznie miedzy `app.html` i `apps-catalog.html` przez `localStorage`.

## Dodaj wlasne AI Chatboty

W `app-script.js` edytuj tablice `CHATS`:
```js
const CHATS = [
  { name:'Claude', desc:'Anthropic · Sonnet 4.6', url:'https://claude.ai', icon:'✺', tag:'reasoning' },
  // ... dodaj wlasne
];
```

## Dodaj nowy temat

W `app-script.js` i `apps-catalog.js` dodaj do obiektu `THEMES`:
```js
'moj-temat': {
  label: 'Moj Temat',
  bg: '#000', bg2: '#111', bg3: '#1a1a1a',
  border: '#222', border2: '#333',
  accent: '#00ff88', accent2: '#00cc66', accentDim: '#00ff8822',
  text: '#eee', text2: '#999', text3: '#555',
  palette: ['#00ff88','#00cc66','...'],
},
```

## Changelog

| Data | Zmiana |
|------|--------|
| 2026-05-03 | BRO Lab: 12 slotow, drag-resize, export .html |
| 2026-05-03 | App Catalog: thumbnail w edit modal, przycisk refresh |
| 2026-05-02 | App Catalog v2: 23 kategorie, filtry, auto-fetch tytulu/opisu |
| 2026-05-02 | Pierwsze dzialajace rozszerzenie: ZENO nowa karta + podstawowy katalog |
| 2026-04-17 | Bazowe rozszerzenie BrowserOS "Assistant" v0.0.102.0 |
