# GitNexus — Fragment do RULES.instructions.md

Dodaj poniższe sekcje do globalnego pliku:
`C:\Users\{USER}\AppData\Roaming\Code\User\prompts\RULES.instructions.md`

---

## 1. W sekcji MCP USAGE — dodaj na końcu:

```
- MCP gitnexus: MANDATORY for all code modification tasks (see GITNEXUS section below)
```

## 2. W sekcji CHANGE IMPACT ANALYSIS — dodaj na końcu:

```
If gitnexus MCP is available → MUST run `gitnexus_impact({target: "symbolName", direction: "upstream"})` BEFORE editing any function/class/method
```

## 3. W POST-COPY STEPS — dodaj jako ostatni krok:

```
7. OBOWIĄZKOWE: Zaindeksuj repozytorium w GitNexus — uruchom w terminalu w root workspace:
   `npx gitnexus analyze`
   Tworzy `.gitnexus/` z grafem kodu — wymagane do działania narzędzi impact/context/rename.
```

## 4. Nowa sekcja — wklej przed sekcją IDENTITY:

```
====================================
GITNEXUS CODE INTELLIGENCE (MANDATORY WHEN MCP AVAILABLE)
====================================

GitNexus indexes the codebase into a knowledge graph — call chains, dependencies, execution flows.
Check if available: look for `gitnexus` in .workspace_meta/mcp/config.json.
If index is stale: run `npx gitnexus analyze` in workspace root.

▸ BEFORE EDITING ANY SYMBOL (function/class/method):
  MUST run: `gitnexus_impact({target: "symbolName", direction: "upstream"})`
  Report blast radius: d=1 WILL BREAK | d=2 LIKELY AFFECTED | d=3 MAY NEED TESTING
  If HIGH or CRITICAL risk → WARN USER, ask for confirmation before proceeding.

▸ EXPLORING UNFAMILIAR CODE:
  1. `gitnexus_query({query: "concept"})` — find execution flows by concept
  2. `gitnexus_context({name: "symbolName"})` — 360° view: callers, callees, processes
  3. Read `gitnexus://repo/{name}/process/{name}` — full execution trace

▸ RENAMING SYMBOLS:
  NEVER use find-and-replace.
  MUST use: `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first.
  Review preview → then run with dry_run: false.

▸ BEFORE EVERY COMMIT:
  Run: `gitnexus_detect_changes({scope: "staged"})`
  Verify only expected symbols changed. Report affected processes.

▸ DEBUGGING:
  1. `gitnexus_query({query: "error or symptom"})` — find related flows
  2. `gitnexus_context({name: "suspect function"})` — trace callers/callees
  3. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})`

TOOL QUICK REFERENCE:
| Tool                    | Use for                        |
|-------------------------|-------------------------------|
| gitnexus_query          | Find code by concept          |
| gitnexus_context        | 360° symbol view              |
| gitnexus_impact         | Blast radius before editing   |
| gitnexus_detect_changes | Pre-commit scope check        |
| gitnexus_rename         | Safe multi-file rename        |
| gitnexus_cypher         | Custom graph queries          |

ENFORCEMENT: Editing a symbol without running gitnexus_impact is a protocol violation.
```
