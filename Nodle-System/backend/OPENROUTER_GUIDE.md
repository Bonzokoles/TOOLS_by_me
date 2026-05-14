# OpenRouter Integration Guide

## 🔌 Konfiguracja

Server automatycznie ładuje klucz OpenRouter z `U:\.env`:

```env
OPENROUTER_API_KEY=your_api_key_here
```

Domyślny provider: **openrouter**  
Domyślny model: **anthropic/claude-3.7-sonnet**

---

## 🎯 Najlepsze modele do generowania wizualizacji projektów

### 1. **anthropic/claude-3.7-sonnet** ⭐ DOMYŚLNY
- **Zastosowanie:** Kompleksowa analiza architektury, generowanie grafów zależności
- **Mocne strony:** Rozumienie złożonych struktur kodu, świetna analiza relacji
- **Max tokens:** ~200k context
- **Koszt:** Średni-wysoki
- **Idealne do:** Tworzenia interaktywnych map projektu, wykrywania wzorców architektonicznych

### 2. **anthropic/claude-sonnet-4-20250514**
- **Zastosowanie:** Najnowszy Sonnet, jeszcze lepsze rozumienie kontekstu
- **Mocne strony:** Ulepszona analiza kodu TypeScript/JavaScript
- **Max tokens:** ~200k context
- **Koszt:** Wysoki
- **Idealne do:** Głębokiej analizy dużych projektów (ZENO Browser, React apps)

### 3. **google/gemini-2.0-flash-thinking-exp**
- **Zastosowanie:** Szybka analiza + rozumowanie
- **Mocne strony:** Bardzo szybki, dobre rozumowanie logiczne, tani
- **Max tokens:** ~1M context
- **Koszt:** Niski
- **Idealne do:** Prototypowania wizualizacji, szybkich iteracji

### 4. **deepseek/deepseek-chat**
- **Zastosowanie:** Analiza kodu i zależności
- **Mocne strony:** Świetny w analizie struktury kodu, wykrywaniu importów
- **Max tokens:** ~64k context
- **Koszt:** Bardzo niski
- **Idealne do:** Mapowania zależności między modułami, analizy tree-shaking

### 5. **x-ai/grok-3-2**
- **Zastosowanie:** Analiza systemowa
- **Mocne strony:** Dobre w rozumieniu przepływu danych
- **Max tokens:** ~128k context
- **Koszt:** Wysoki
- **Idealne do:** Analizy pipeline'ów danych, przepływu eventów

---

## 🔧 Użycie w kodzie

### Zmiana providera

W `server.py`:
```python
# Domyślny provider (linia 90)
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "openrouter")
```

Lub ustaw zmienną środowiskową:
```bash
$env:LLM_PROVIDER="openrouter"  # PowerShell
export LLM_PROVIDER=openrouter  # Bash
```

Dostępne providery:
- `openrouter` ⭐ (domyślny)
- `anthropic`
- `gemini`
- `agent_zero`

### Zmiana modelu OpenRouter

W `server.py`, funkcja `call_openrouter()` (linia ~360):
```python
def call_openrouter(message, system_prompt, kb_context=None, model="anthropic/claude-3.7-sonnet"):
```

Możesz zmienić parametr `model` na dowolny z powyższych.

### Wywołanie w API

Endpoint `/api/chat` automatycznie używa skonfigurowanego providera:

```bash
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Wygeneruj interaktywną wizualizację projektu ZENO Browser",
    "agent_id": "jimbo",
    "library_id": "tech_vault"
  }'
```

---

## 📊 Rekomendacje dla różnych zadań

| Zadanie | Model | Dlaczego |
|---------|-------|----------|
| **Mapa architektury systemu** | `claude-3.7-sonnet` | Najlepsze rozumienie złożonych relacji |
| **Graf zależności npm** | `deepseek-chat` | Specjalista od analizy kodu |
| **Diagram przepływu danych** | `grok-3-2` | Świetny w data flow |
| **Prototyp wizualizacji** | `gemini-2.0-flash-thinking-exp` | Szybki + tani |
| **Głęboka analiza kodu** | `claude-sonnet-4` | Najnowocześniejszy |
| **Interaktywny dashboard** | `claude-3.7-sonnet` | UI/UX understanding |

---

## 🚀 Przykład: Generowanie grafu projektu

```python
# W server.py możesz dodać endpoint do generowania wizualizacji:

def generate_project_graph(project_path, depth=3):
    """Generate interactive project visualization using OpenRouter."""
    
    # Prompt for AI
    prompt = f"""
    Przeanalizuj projekt w lokalizacji: {project_path}
    
    Wygeneruj JSON do vis-network z:
    1. Nodes: pliki/moduły (id, label, group)
    2. Edges: import/require między modułami (from, to, label)
    3. Metadata: tech stack, dependencies, architecture layers
    
    Format:
    {{
        "nodes": [
            {{"id": "src/main.ts", "label": "Main", "group": "core"}},
            ...
        ],
        "edges": [
            {{"from": "src/main.ts", "to": "src/app.tsx", "label": "imports"}},
            ...
        ],
        "layers": ["W1: Data", "W2: Processing", "W3: UI"]
    }}
    """
    
    # Call OpenRouter with Claude 3.7 Sonnet
    response, error = call_openrouter(
        message=prompt,
        system_prompt="You are a code architecture analyzer. Return only valid JSON.",
        model="anthropic/claude-3.7-sonnet"
    )
    
    if error:
        return {"error": error}
    
    return json.loads(response)
```

---

## 🔥 Fallback Strategy

Server automatycznie próbuje backup providerów w kolejności:

1. **OpenRouter** (primary)
2. **Anthropic** (fallback 1)
3. **Gemini** (fallback 2)

Logi w terminalu pokażą:
```
[04:27:40] OpenRouter:    ...c1b915d2 ✅
[04:27:40] LLM provider:  openrouter
```

---

## 💡 Pro Tips

1. **Dla dużych projektów:** Użyj `gemini-2.0-flash-thinking-exp` (1M context)
2. **Dla dokładności:** Użyj `claude-3.7-sonnet` lub `claude-sonnet-4`
3. **Dla kosztów:** Użyj `deepseek-chat` (bardzo tani)
4. **Dla prototypów:** Użyj `gemini-2.0-flash-thinking-exp` (szybki + tani)

---

## 🧪 Test OpenRouter

```bash
cd U:\The_DEVz_HUB_of_work\CONTROL_CENTER\react-flow-diagram\backend
python server.py 8001
```

Sprawdź logi - powinno się wyświetlić:
```
[HH:MM:SS] OpenRouter:    ...c1b915d2
[HH:MM:SS] LLM provider:  openrouter
```

Endpoint test:
```bash
curl http://localhost:8001/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "Test OpenRouter connection", "agent_id": "jimbo"}'
```

---

## 📝 Status

✅ OpenRouter zintegrowany  
✅ Klucz załadowany z U:\.env  
✅ Domyślny model: Claude 3.7 Sonnet  
✅ Fallback: Anthropic → Gemini  
✅ Składnia Python: poprawna  

**Gotowe do użycia!** 🚀
