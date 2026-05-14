"""
DEVz HUB — Nodle Graph API (Standalone Backend)
Replaces the full Nodle/FastAPI backend with a lightweight server.
Stores graph data in JSON file. Full CRUD + CORS + Dashboard integration.
Includes Chat API with KB search for library knowledge access.

Endpoints:
  GET  /api/nodle/nodes          — all nodes
  GET  /api/nodle/nodes/:id      — single node
  POST /api/nodle/nodes          — create node
  PUT  /api/nodle/nodes/:id      — update node
  DELETE /api/nodle/nodes/:id    — delete node
  GET  /api/nodle/edges          — all edges
  POST /api/nodle/edges          — create edge
  DELETE /api/nodle/edges/:id    — delete edge
  GET  /api/nodle/graph          — full graph (nodes + edges)
  POST /api/nodle/sync           — replace full graph
  GET  /api/nodle/search?q=      — search nodes
  GET  /api/nodle/stats          — stats for dashboard
  GET  /api/nodle/summary        — compact summary for dashboard iframe
  POST /api/chat                 — chat with KB context
  POST /api/chat/search          — search knowledge base
  GET  /api/chat/libraries       — list available libraries
  GET  /api/chat/history         — get chat history

Usage:
  python server.py [port]        — default port 8001
"""

import http.server
import json
import os
import sys
import uuid
import urllib.parse
import socketserver
import glob
import re
import threading
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8001
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "graph_data.json")
CHAT_HISTORY_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "chat_history.json"
)

# ── Libraries Knowledge Base paths ──────────────────────────────────
LIBRARIES_BASE = Path(r"U:\The_DEVz_HUB_of_work\LIBRARIES")
LIBRARIES_API_URL = "http://localhost:7070"  # FastAPI Libraries server (optional)

# ── API Keys (loaded from .env) ─────────────────────────────────────
ENV_FILE = Path(r"U:\.env")


def load_env_keys():
    """Load API keys from .env file."""
    keys = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                keys[k.strip()] = v.strip()
    return keys


_ENV_KEYS = load_env_keys()
ANTHROPIC_API_KEY = _ENV_KEYS.get(
    "ANTHROPIC_API_KEY", os.environ.get("ANTHROPIC_API_KEY", "")
)
GEMINI_API_KEY = _ENV_KEYS.get("GEMINI_API_KEY", os.environ.get("GEMINI_API_KEY", ""))
OPENAI_API_KEY = _ENV_KEYS.get("OPENAI_API_KEY", os.environ.get("OPENAI_API_KEY", ""))
OPENROUTER_API_KEY = _ENV_KEYS.get("OPENROUTER_API_KEY", os.environ.get("OPENROUTER_API_KEY", ""))

# Agent Zero tunnel
AGENT_ZERO_URL = _ENV_KEYS.get(
    "AGENT_ZERO_TUNNEL_URL",
    os.environ.get(
        "AGENT_ZERO_TUNNEL_URL", "https://criterion-sons-course-learn.trycloudflare.com"
    ),
)
AGENT_ZERO_API_KEY = _ENV_KEYS.get(
    "AGENT_ZERO_API_KEY", os.environ.get("AGENT_ZERO_API_KEY", "jVD0r1eqaoXKz-18")
)

# Default LLM provider: anthropic, gemini, openrouter, or agent_zero
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "openrouter")


def _log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")


_log(
    f"Anthropic key: {'...'+ANTHROPIC_API_KEY[-8:] if ANTHROPIC_API_KEY else 'NOT SET'}"
)
_log(f"Gemini key:    {'...'+GEMINI_API_KEY[-8:] if GEMINI_API_KEY else 'NOT SET'}")
_log(f"OpenRouter:    {'...'+OPENROUTER_API_KEY[-8:] if OPENROUTER_API_KEY else 'NOT SET'}")
_log(f"Agent Zero:    {AGENT_ZERO_URL or 'NOT SET'}")
_log(
    f"A0 API key:    {'...'+AGENT_ZERO_API_KEY[-6:] if AGENT_ZERO_API_KEY else 'NOT SET'}"
)
_log(f"LLM provider:  {LLM_PROVIDER}")

LIBRARY_DEFS = {
    "money_machine": {
        "name": "THE MONEY MACHINE",
        "tag": "[BIZ]",
        "path": "[BIZ] THE_MONEY_MACHINE",
        "description": "AI monetization, e-commerce, payment systems",
    },
    "bucket_of_blood": {
        "name": "THE BUCKET OF BLOOD",
        "tag": "[BIZ]",
        "path": "[BIZ] THE_BUCKET_OF_BLOOD",
        "description": "Customer retention, LTV, subscription models",
    },
    "shadow_boxing": {
        "name": "THE SHADOW BOXING",
        "tag": "[BIZ]",
        "path": "[BIZ] THE_SHADOW_BOXING",
        "description": "Competitive intelligence, market domination",
    },
    "the_now": {
        "name": "THE NOW",
        "tag": "[BIZ]",
        "path": "[BIZ] THE_NOW",
        "description": "Current operations, real-time data",
    },
    "ai_lab": {
        "name": "AI LAB",
        "tag": "[PRV]",
        "path": "[PRV] AI_LAB",
        "description": "AI experiments, models, prompts, fine-tuning",
    },
    "tech_vault": {
        "name": "TECH VAULT",
        "tag": "[PRV]",
        "path": "[PRV] TECH_VAULT",
        "description": "Technical documentation, architecture, DevOps",
    },
}

# ── Agent Fleet data ────────────────────────────────────────────────
AGENT_FLEET = {
    "jimbo": {
        "name": "Jimbo",
        "role": "Orchestrator & Lead",
        "status": "active",
        "model": "Claude 4.5 Sonnet",
        "tag": "[JM]",
    },
    "elwirka": {
        "name": "Elwirka",
        "role": "E-commerce Specialist",
        "status": "active",
        "model": "GPT-4o",
        "tag": "[EL]",
    },
    "norbert": {
        "name": "Norbert",
        "role": "Research & Data",
        "status": "standby",
        "model": "DeepSeek R1",
        "tag": "[NR]",
    },
    "zbychu": {
        "name": "Zbychu",
        "role": "Automation & DevOps",
        "status": "standby",
        "model": "Qwen 2.5",
        "tag": "[ZB]",
    },
    "angels": {
        "name": "Angels",
        "role": "Quality Control",
        "status": "standby",
        "model": "Gemini Flash",
        "tag": "[AN]",
    },
}

# ── Data store ──────────────────────────────────────────────


def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"nodes": [], "edges": []}


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def gen_id():
    return str(uuid.uuid4())[:8]


def now():
    return datetime.now().isoformat()


# ── Chat history ──────────────────────────────────────────


def load_chat_history():
    if os.path.exists(CHAT_HISTORY_FILE):
        with open(CHAT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"messages": []}


def save_chat_history(history):
    with open(CHAT_HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)


# ── KB Search (local filesystem) ──────────────────────────


def search_library_files(library_id, query, limit=10):
    """Search library files for matching content (filesystem-based, no ChromaDB needed)."""
    if library_id not in LIBRARY_DEFS:
        return []

    lib = LIBRARY_DEFS[library_id]
    lib_path = LIBRARIES_BASE / lib["path"]

    if not lib_path.exists():
        return []

    results = []
    query_lower = query.lower()
    query_words = query_lower.split()

    # Search through text files
    extensions = ["*.md", "*.txt", "*.json", "*.py", "*.yaml", "*.yml"]
    for ext in extensions:
        for fpath in lib_path.rglob(ext):
            try:
                content = fpath.read_text(encoding="utf-8", errors="ignore")
                content_lower = content.lower()

                # Score: count matching words
                score = sum(1 for w in query_words if w in content_lower)
                if score == 0:
                    continue

                # Extract relevant snippet (first match context)
                snippet = ""
                for w in query_words:
                    idx = content_lower.find(w)
                    if idx >= 0:
                        start = max(0, idx - 100)
                        end = min(len(content), idx + 200)
                        snippet = content[start:end].strip()
                        break

                results.append(
                    {
                        "file": str(fpath.relative_to(LIBRARIES_BASE)),
                        "library": library_id,
                        "library_name": lib["name"],
                        "score": score,
                        "snippet": snippet[:500],
                        "size": fpath.stat().st_size,
                    }
                )
            except Exception:
                continue

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:limit]


def search_all_libraries(query, limit=15):
    """Search all libraries for matching content."""
    all_results = []
    for lib_id in LIBRARY_DEFS:
        results = search_library_files(lib_id, query, limit=5)
        all_results.extend(results)

    all_results.sort(key=lambda x: x["score"], reverse=True)
    return all_results[:limit]


def build_kb_context(query, library_id=None):
    """Build knowledge context from library search results."""
    if library_id:
        results = search_library_files(library_id, query, limit=5)
    else:
        results = search_all_libraries(query, limit=8)

    if not results:
        return None

    context_parts = []
    for r in results:
        lib = LIBRARY_DEFS.get(r["library"], {})
        context_parts.append(
            f"### {lib.get('tag', '[--]')} {r['library_name']} -- {r['file']}\n{r['snippet']}"
        )

    return "\n\n---\n\n".join(context_parts)


# ── LLM Integration ───────────────────────────────────────


def call_anthropic(message, system_prompt, kb_context=None):
    """Call Anthropic Claude API (Messages API)."""
    if not ANTHROPIC_API_KEY:
        return None, "Anthropic API key not set"

    user_content = message
    if kb_context:
        user_content = f"Kontekst z bazy wiedzy (uzyj do odpowiedzi):\n\n{kb_context}\n\n---\n\nPytanie uzytkownika: {message}"

    payload = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 2048,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_content}],
    }

    req = Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )

    try:
        with urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
            text = data.get("content", [{}])[0].get("text", "")
            return text, None
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")[:500]
        return None, f"Anthropic HTTP {e.code}: {body}"
    except Exception as e:
        return None, f"Anthropic error: {str(e)}"


def call_gemini(message, system_prompt, kb_context=None):
    """Call Google Gemini API (generateContent)."""
    if not GEMINI_API_KEY:
        return None, "Gemini API key not set"

    user_content = message
    if kb_context:
        user_content = f"Kontekst z bazy wiedzy (uzyj do odpowiedzi):\n\n{kb_context}\n\n---\n\nPytanie uzytkownika: {message}"

    payload = {
        "contents": [{"parts": [{"text": user_content}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "maxOutputTokens": 2048,
            "temperature": 0.7,
        },
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    req = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read())
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                text = parts[0].get("text", "") if parts else ""
                return text, None
            return None, "Gemini: no candidates"
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")[:500]
        return None, f"Gemini HTTP {e.code}: {body}"
    except Exception as e:
        return None, f"Gemini error: {str(e)}"


def call_openrouter(message, system_prompt, kb_context=None, model="anthropic/claude-3.7-sonnet"):
    """Call OpenRouter API (unified LLM gateway).
    
    Recommended models for project visualization:
    - anthropic/claude-3.7-sonnet (best for complex analysis, default)
    - anthropic/claude-sonnet-4-20250514 (latest Sonnet)
    - google/gemini-2.0-flash-thinking-exp (fast, good reasoning)
    - deepseek/deepseek-chat (excellent for code analysis)
    - x-ai/grok-3-2 (good for analysis)
    """
    if not OPENROUTER_API_KEY:
        return None, "OpenRouter API key not set"

    user_content = message
    if kb_context:
        user_content = f"Kontekst z bazy wiedzy (uzyj do odpowiedzi):\n\n{kb_context}\n\n---\n\nPytanie uzytkownika: {message}"

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "max_tokens": 4096,
        "temperature": 0.7,
    }

    req = Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://devz-hub.local",
            "X-Title": "DEVz HUB Graph API",
        },
        method="POST",
    )

    try:
        with urlopen(req, timeout=90) as resp:
            data = json.loads(resp.read())
            choices = data.get("choices", [])
            if choices:
                text = choices[0].get("message", {}).get("content", "")
                return text, None
            return None, "OpenRouter: no choices returned"
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")[:500]
        return None, f"OpenRouter HTTP {e.code}: {body}"
    except Exception as e:
        return None, f"OpenRouter error: {str(e)}"


# ── Agent Zero context tracking ─────────────────────────────────
_a0_contexts = {}  # agent_id -> context_id mapping


def call_agent_zero(message, agent_id=None, kb_context=None):
    """Call Agent Zero via Cloudflare tunnel (POST /api_message)."""
    if not AGENT_ZERO_URL or not AGENT_ZERO_API_KEY:
        return None, "Agent Zero URL or API key not set"

    user_content = message
    if kb_context:
        user_content = (
            f"Kontekst z bazy wiedzy DEVz HUB (uzyj do odpowiedzi):\n\n{kb_context}\n\n---\n\n"
            f"Pytanie uzytkownika: {message}"
        )

    # Use persistent context per agent
    ctx_key = agent_id or "_default"
    context_id = _a0_contexts.get(ctx_key, "")

    payload = {
        "message": user_content,
        "context_id": context_id,
    }

    url = AGENT_ZERO_URL.rstrip("/") + "/api_message"
    req = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-API-KEY": AGENT_ZERO_API_KEY,
        },
        method="POST",
    )

    try:
        import ssl

        ctx = ssl.create_default_context()
        with urlopen(req, timeout=120, context=ctx) as resp:
            data = json.loads(resp.read())
            # Store context_id for conversation continuity
            new_ctx = data.get("context_id", "")
            if new_ctx:
                _a0_contexts[ctx_key] = new_ctx
            response_text = data.get("response", "")
            if not response_text:
                return None, "Agent Zero returned empty response"
            return response_text, None
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")[:500]
        return None, f"Agent Zero HTTP {e.code}: {body}"
    except URLError as e:
        return None, f"Agent Zero connection error: {str(e.reason)}"
    except Exception as e:
        return None, f"Agent Zero error: {str(e)}"


def call_llm(message, agent_id=None, kb_context=None, provider=None):
    """Route to LLM provider. Returns (response_text, error_string)."""
    if provider is None:
        provider = LLM_PROVIDER

    # Build system prompt based on agent
    agent = AGENT_FLEET.get(agent_id) if agent_id else None
    if agent:
        system_prompt = (
            f"Jestes {agent['name']} ({agent['role']}) w systemie DEVz HUB. "
            f"Odpowiadasz w stylu terminala — zwiezle, konkretnie, bez emoji. "
            f"Uzywaj tagów [XX] do oznaczania sekcji. Odpowiadaj po polsku."
        )
    else:
        system_prompt = (
            "Jestes asystentem DEVz HUB Command Center. "
            "Odpowiadasz w stylu terminala — zwiezle, konkretnie, bez emoji. "
            "Uzywaj tagów [XX] do oznaczania sekcji. "
            "Masz dostep do 6 bibliotek strategicznych i 5 agentow. Odpowiadaj po polsku."
        )

    # Try primary provider
    if provider == "agent_zero":
        # Agent Zero gets the raw message + KB context, it has its own system prompt
        text, err = call_agent_zero(message, agent_id, kb_context)
        if text:
            return text, None
        # Fallback to OpenRouter/Anthropic/Gemini
        _log(f"Agent Zero failed ({err}), trying OpenRouter fallback")
        text2, err2 = call_openrouter(message, system_prompt, kb_context)
        if text2:
            return text2, None
        text3, err3 = call_anthropic(message, system_prompt, kb_context)
        if text3:
            return text3, None
        text4, err4 = call_gemini(message, system_prompt, kb_context)
        if text4:
            return text4, None
        return None, f"A0: {err} | OpenRouter: {err2} | Anthropic: {err3} | Gemini: {err4}"
    elif provider == "openrouter":
        text, err = call_openrouter(message, system_prompt, kb_context)
        if text:
            return text, None
        # Fallback to Anthropic
        _log(f"OpenRouter failed ({err}), trying Anthropic fallback")
        text2, err2 = call_anthropic(message, system_prompt, kb_context)
        if text2:
            return text2, None
        # Fallback to Gemini
        text3, err3 = call_gemini(message, system_prompt, kb_context)
        if text3:
            return text3, None
        return None, f"OpenRouter: {err} | Anthropic: {err2} | Gemini: {err3}"
    elif provider == "anthropic":
        text, err = call_anthropic(message, system_prompt, kb_context)
        if text:
            return text, None
        # Fallback to Gemini
        _log(f"Anthropic failed ({err}), trying Gemini fallback")
        text2, err2 = call_gemini(message, system_prompt, kb_context)
        if text2:
            return text2, None
        return None, f"Anthropic: {err} | Gemini: {err2}"
    else:  # gemini
        text, err = call_gemini(message, system_prompt, kb_context)
        if text:
            return text, None
        # Fallback to Anthropic
        _log(f"Gemini failed ({err}), trying Anthropic fallback")
        text2, err2 = call_anthropic(message, system_prompt, kb_context)
        if text2:
            return text2, None
        return None, f"Gemini: {err} | Anthropic: {err2}"


# ── HTTP Handler ──────────────────────────────────────────


class NodleHandler(http.server.BaseHTTPRequestHandler):

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    # ── ROUTING ──

    def do_GET(self):
        path = urllib.parse.urlparse(self.path)
        route = path.path.rstrip("/")
        qs = urllib.parse.parse_qs(path.query)
        data = load_data()

        if route == "/api/nodle/nodes":
            self._json(200, data["nodes"])

        elif route.startswith("/api/nodle/nodes/"):
            nid = route.split("/")[-1]
            node = next((n for n in data["nodes"] if n["id"] == nid), None)
            if node:
                self._json(200, node)
            else:
                self._json(404, {"error": "Node not found"})

        elif route == "/api/nodle/edges":
            self._json(200, data["edges"])

        elif route == "/api/nodle/graph":
            self._json(200, {"nodes": data["nodes"], "edges": data["edges"]})

        elif route == "/api/nodle/search":
            q = (qs.get("q", [""])[0]).lower()
            results = [
                n
                for n in data["nodes"]
                if q in n.get("name", "").lower()
                or q in n.get("description", "").lower()
                or q in n.get("type", "").lower()
            ]
            self._json(200, results)

        elif route == "/api/nodle/stats":
            types = {}
            for n in data["nodes"]:
                t = n.get("type", "unknown")
                types[t] = types.get(t, 0) + 1
            self._json(
                200,
                {
                    "totalNodes": len(data["nodes"]),
                    "totalEdges": len(data["edges"]),
                    "nodeTypes": types,
                    "edgeLabels": list(set(e.get("label", "") for e in data["edges"])),
                    "lastUpdate": now(),
                },
            )

        elif route == "/api/nodle/summary":
            # Compact summary for dashboard embedding
            nodes_summary = []
            for n in data["nodes"]:
                nodes_summary.append(
                    {
                        "id": n["id"],
                        "name": n.get("name", ""),
                        "type": n.get("type", ""),
                        "status": n.get("metadata", {}).get("status", "idle"),
                        "description": n.get("description", "")[:80],
                    }
                )
            edges_summary = []
            for e in data["edges"]:
                src = next(
                    (n["name"] for n in data["nodes"] if n["id"] == e["source"]),
                    e["source"],
                )
                tgt = next(
                    (n["name"] for n in data["nodes"] if n["id"] == e["target"]),
                    e["target"],
                )
                edges_summary.append(
                    {"id": e["id"], "from": src, "to": tgt, "label": e.get("label", "")}
                )
            self._json(
                200,
                {
                    "nodes": nodes_summary,
                    "edges": edges_summary,
                    "stats": {
                        "totalNodes": len(data["nodes"]),
                        "totalEdges": len(data["edges"]),
                    },
                },
            )

        # ── Chat GET routes ──

        elif route == "/api/chat/libraries":
            libs = []
            for lib_id, lib_data in LIBRARY_DEFS.items():
                lib_path = LIBRARIES_BASE / lib_data["path"]
                libs.append(
                    {
                        "id": lib_id,
                        "name": lib_data["name"],
                        "tag": lib_data["tag"],
                        "description": lib_data["description"],
                        "exists": lib_path.exists(),
                    }
                )
            self._json(200, {"libraries": libs})

        elif route == "/api/chat/history":
            history = load_chat_history()
            limit = int(qs.get("limit", ["50"])[0])
            messages = history.get("messages", [])[-limit:]
            self._json(
                200, {"messages": messages, "total": len(history.get("messages", []))}
            )

        # ── Agent GET routes ──

        elif route == "/api/agents":
            agents = []
            for aid, adata in AGENT_FLEET.items():
                agents.append({"id": aid, **adata})
            self._json(200, {"agents": agents})

        elif route.startswith("/api/agents/") and route.count("/") == 3:
            aid = route.split("/")[-1]
            if aid in AGENT_FLEET:
                self._json(200, {"id": aid, **AGENT_FLEET[aid]})
            else:
                self._json(404, {"error": "Agent not found"})

        elif route == "/api/chat/config":
            self._json(
                200,
                {
                    "provider": LLM_PROVIDER,
                    "anthropic": bool(ANTHROPIC_API_KEY),
                    "gemini": bool(GEMINI_API_KEY),
                    "openai": bool(OPENAI_API_KEY),
                    "agent_zero": bool(AGENT_ZERO_URL and AGENT_ZERO_API_KEY),
                    "agent_zero_url": AGENT_ZERO_URL or "",
                    "a0_contexts": len(_a0_contexts),
                },
            )

        else:
            self._json(404, {"error": "Not found", "path": route})

    def do_POST(self):
        route = urllib.parse.urlparse(self.path).path.rstrip("/")
        data = load_data()
        body = self._read_body()

        if route == "/api/nodle/nodes":
            node = {
                "id": gen_id(),
                "name": body.get("name", "Untitled"),
                "type": body.get("type", "system"),
                "description": body.get("description", ""),
                "files": body.get("files", []),
                "metadata": body.get("metadata", {}),
                "position": body.get("position", {"x": 100, "y": 100}),
                "createdAt": now(),
                "updatedAt": now(),
            }
            data["nodes"].append(node)
            save_data(data)
            self._json(201, node)

        elif route == "/api/nodle/edges":
            edge = {
                "id": gen_id(),
                "source": body.get("source", ""),
                "target": body.get("target", ""),
                "label": body.get("label", "connects"),
                "type": body.get("type", "default"),
                "metadata": body.get("metadata", {}),
            }
            data["edges"].append(edge)
            save_data(data)
            self._json(201, edge)

        elif route == "/api/nodle/sync":
            # Replace entire graph — reject empty sync to prevent accidental wipe
            new_nodes = body.get("nodes", [])
            new_edges = body.get("edges", [])
            if len(new_nodes) == 0 and len(data["nodes"]) > 0:
                # Frontend sent empty state — return current data instead of wiping
                self._json(
                    200,
                    {
                        "nodes": data["nodes"],
                        "edges": data["edges"],
                        "_note": "empty sync rejected",
                    },
                )
                return
            data["nodes"] = new_nodes
            data["edges"] = new_edges
            save_data(data)
            self._json(200, {"nodes": data["nodes"], "edges": data["edges"]})

        # ── Chat POST routes ──

        elif route == "/api/chat/search":
            # Search knowledge base
            query = body.get("query", "")
            library_id = body.get("library", None)
            limit = body.get("limit", 10)

            if not query:
                self._json(400, {"error": "Query is required"})
                return

            if library_id:
                results = search_library_files(library_id, query, limit=limit)
            else:
                results = search_all_libraries(query, limit=limit)

            self._json(
                200,
                {
                    "query": query,
                    "library": library_id,
                    "results": results,
                    "total": len(results),
                },
            )

        elif route == "/api/chat":
            # Chat message with LLM + KB context
            message = body.get("message", "")
            library_id = body.get("library", None)
            use_kb = body.get("useKB", True)
            agent_id = body.get("agent", None)
            provider = body.get("provider", None)

            if not message:
                self._json(400, {"error": "Message is required"})
                return

            # Build response with KB context
            kb_context = None
            kb_results = []
            if use_kb:
                kb_context = build_kb_context(message, library_id)
                if library_id:
                    kb_results = search_library_files(library_id, message, limit=5)
                else:
                    kb_results = search_all_libraries(message, limit=5)

            # Create chat entry
            chat_entry = {
                "id": gen_id(),
                "timestamp": now(),
                "role": "user",
                "message": message,
                "library": library_id,
            }

            # Call LLM with KB context
            _log(
                f"[CHAT] msg='{message[:60]}' agent={agent_id} provider={provider or LLM_PROVIDER} kb={len(kb_results)} docs"
            )
            llm_text, llm_err = call_llm(message, agent_id, kb_context, provider)

            if llm_text:
                used_provider = provider or LLM_PROVIDER
                assistant_response = {
                    "id": gen_id(),
                    "timestamp": now(),
                    "role": "assistant",
                    "message": llm_text,
                    "sources": kb_results,
                    "library": library_id,
                    "agent": agent_id,
                    "type": "llm",
                    "provider": used_provider,
                }
            elif kb_context:
                # LLM failed but we have KB results — fallback
                assistant_response = {
                    "id": gen_id(),
                    "timestamp": now(),
                    "role": "assistant",
                    "message": f"[!!] LLM niedostepny ({llm_err}).\n\n[KB] Wyniki z bazy wiedzy ({len(kb_results)} dokumentow):\n\n{kb_context}",
                    "sources": kb_results,
                    "library": library_id,
                    "agent": agent_id,
                    "type": "kb_fallback",
                }
            else:
                assistant_response = {
                    "id": gen_id(),
                    "timestamp": now(),
                    "role": "assistant",
                    "message": f"[!!] LLM niedostepny ({llm_err}). Brak wynikow w KB.",
                    "sources": [],
                    "library": library_id,
                    "agent": agent_id,
                    "type": "error",
                }

            # Save to history
            history = load_chat_history()
            history["messages"].append(chat_entry)
            history["messages"].append(assistant_response)
            # Keep last 200 messages
            if len(history["messages"]) > 200:
                history["messages"] = history["messages"][-200:]
            save_chat_history(history)

            self._json(
                200,
                {
                    "userMessage": chat_entry,
                    "assistantMessage": assistant_response,
                },
            )

        elif route == "/api/chat/clear":
            save_chat_history({"messages": []})
            self._json(200, {"message": "Chat history cleared"})

        elif route == "/api/chat/a0/tunnel":
            # Update Agent Zero tunnel URL dynamically
            global AGENT_ZERO_URL
            new_url = body.get("url", "").strip()
            if not new_url:
                self._json(400, {"error": "URL is required"})
                return
            AGENT_ZERO_URL = new_url
            _a0_contexts.clear()
            _log(f"[A0] Tunnel updated: {AGENT_ZERO_URL}")
            self._json(
                200, {"message": "Agent Zero tunnel updated", "url": AGENT_ZERO_URL}
            )

        elif route == "/api/chat/a0/reset":
            # Reset Agent Zero conversation contexts
            _a0_contexts.clear()
            _log("[A0] Contexts reset")
            self._json(200, {"message": "Agent Zero contexts reset", "cleared": True})

        # ── Agent POST routes ──

        elif route.startswith("/api/agents/") and route.endswith("/status"):
            # POST /api/agents/<id>/status
            parts = route.split("/")
            aid = parts[3] if len(parts) >= 5 else None
            if aid and aid in AGENT_FLEET:
                new_status = body.get("status", "standby")
                AGENT_FLEET[aid]["status"] = new_status
                self._json(200, {"id": aid, "status": new_status})
            else:
                self._json(404, {"error": "Agent not found"})

        else:
            self._json(404, {"error": "Not found"})

    def do_PUT(self):
        route = urllib.parse.urlparse(self.path).path.rstrip("/")
        data = load_data()
        body = self._read_body()

        if route.startswith("/api/nodle/nodes/"):
            nid = route.split("/")[-1]
            node = next((n for n in data["nodes"] if n["id"] == nid), None)
            if not node:
                self._json(404, {"error": "Node not found"})
                return
            for key in ("name", "type", "description", "files", "metadata", "position"):
                if key in body:
                    node[key] = body[key]
            node["updatedAt"] = now()
            save_data(data)
            self._json(200, node)
        else:
            self._json(404, {"error": "Not found"})

    def do_DELETE(self):
        route = urllib.parse.urlparse(self.path).path.rstrip("/")
        data = load_data()

        if route.startswith("/api/nodle/nodes/"):
            nid = route.split("/")[-1]
            before = len(data["nodes"])
            data["nodes"] = [n for n in data["nodes"] if n["id"] != nid]
            # Also remove edges connected to this node
            data["edges"] = [
                e for e in data["edges"] if e["source"] != nid and e["target"] != nid
            ]
            if len(data["nodes"]) < before:
                save_data(data)
                self._json(200, {"message": "Deleted"})
            else:
                self._json(404, {"error": "Node not found"})

        elif route.startswith("/api/nodle/edges/"):
            eid = route.split("/")[-1]
            before = len(data["edges"])
            data["edges"] = [e for e in data["edges"] if e["id"] != eid]
            if len(data["edges"]) < before:
                save_data(data)
                self._json(200, {"message": "Deleted"})
            else:
                self._json(404, {"error": "Edge not found"})
        else:
            self._json(404, {"error": "Not found"})

    def log_message(self, format, *args):
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] {args[0]}" if args else "")


# ── Main ──

if __name__ == "__main__":
    print(f"╔══════════════════════════════════════════════╗")
    print(f"║  DEVz HUB — Nodle Graph API                 ║")
    print(f"║  Port: {PORT}                                 ║")
    print(f"║  Data: {os.path.basename(DATA_FILE):30s}     ║")
    print(f"╚══════════════════════════════════════════════╝")

    class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True

    server = ThreadedServer(("0.0.0.0", PORT), NodleHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()
