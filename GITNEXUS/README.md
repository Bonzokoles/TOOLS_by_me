# GitNexus — Code Intelligence Setup

> Backup konfiguracji GitNexus dla workspace'ów Bonzokoles.
> GitNexus indeksuje repozytorium w graf wiedzy i udostępnia 16 narzędzi MCP dla agentów AI.

## Co tu jest

| Plik | Opis |
|---|---|
| `agent/gitnexus.agent.md` | Agent VS Code Copilot z protokołem używania GitNexus |
| `mcp-config-snippet.json` | Fragment do wklejenia w `.workspace_meta/mcp/config.json` |
| `vscode-system-prompt-snippet.md` | Sekcja GITNEXUS do dodania w globalnym `RULES.instructions.md` |
| `setup-workspace.ps1` | Skrypt PowerShell — automatycznie konfiguruje workspace |

## Szybki start

```powershell
# W rocie nowego workspace:
.\GITNEXUS\setup-workspace.ps1

# Lub ręcznie:
npx gitnexus analyze
Copy-Item GITNEXUS\agent\gitnexus.agent.md .github\agents\gitnexus.agent.md
# + wklej mcp-config-snippet.json do .workspace_meta/mcp/config.json
# + zrestartuj VS Code
```

## Jak działa

GitNexus buduje graf zależności kodu — call chains, klastry, execution flows — i wystawia je przez MCP:

| Narzędzie | Do czego |
|---|---|
| `gitnexus_impact` | Blast radius przed edycją (kto się posypie) |
| `gitnexus_context` | 360° widok symbolu — callery, callees, procesy |
| `gitnexus_query` | Wyszukiwanie kodu po konceptach |
| `gitnexus_rename` | Bezpieczny rename w wielu plikach z podglądem |
| `gitnexus_detect_changes` | Pre-commit scope check — tylko oczekiwane zmiany |

## Wymagania

- Node.js 18+
- `npm install -g gitnexus` lub `npx gitnexus@latest`

## Linki

- GitHub: https://github.com/abhigyanpatwari/GitNexus
- npm: https://www.npmjs.com/package/gitnexus
- Web UI: https://gitnexus.vercel.app
