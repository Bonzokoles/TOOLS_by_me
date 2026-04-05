<#
.SYNOPSIS
    Konfiguruje GitNexus w bieżącym workspace VS Code.

.DESCRIPTION
    1. Dodaje wpis gitnexus do .workspace_meta/mcp/config.json
    2. Kopiuje agenta do .github/agents/
    3. Uruchamia npx gitnexus analyze

.EXAMPLE
    cd C:\MojProjekt
    .\setup-workspace.ps1
#>

param(
    [string]$WorkspaceRoot = (Get-Location).Path
)

Write-Host "`n[GitNexus Setup] Workspace: $WorkspaceRoot`n" -ForegroundColor Cyan

# --- 1. MCP config ---
$mcpPath = Join-Path $WorkspaceRoot ".workspace_meta\mcp\config.json"
if (Test-Path $mcpPath) {
    $config = Get-Content $mcpPath -Raw | ConvertFrom-Json
    if (-not $config.mcpServers.gitnexus) {
        $config.mcpServers | Add-Member -NotePropertyName "gitnexus" -NotePropertyValue ([PSCustomObject]@{
            command = "cmd"
            args    = @("/c", "npx", "-y", "gitnexus@latest", "mcp")
        })
        $config | ConvertTo-Json -Depth 10 | Set-Content $mcpPath -Encoding UTF8
        Write-Host "[OK] Dodano gitnexus do $mcpPath" -ForegroundColor Green
    } else {
        Write-Host "[--] gitnexus juz istnieje w mcp/config.json" -ForegroundColor Yellow
    }
} else {
    Write-Host "[!!] Brak $mcpPath — pomijam MCP config" -ForegroundColor Red
}

# --- 2. Agent ---
$agentDir = Join-Path $WorkspaceRoot ".github\agents"
$agentSrc = Join-Path $PSScriptRoot "agent\gitnexus.agent.md"
$agentDst = Join-Path $agentDir "gitnexus.agent.md"

if (Test-Path $agentSrc) {
    if (-not (Test-Path $agentDir)) { New-Item -ItemType Directory -Path $agentDir | Out-Null }
    Copy-Item $agentSrc $agentDst -Force
    Write-Host "[OK] Skopiowano agenta do $agentDst" -ForegroundColor Green
} else {
    Write-Host "[!!] Brak pliku agenta: $agentSrc" -ForegroundColor Red
}

# --- 3. Analyze ---
Write-Host "`n[GitNexus] Indeksowanie repozytorium..." -ForegroundColor Cyan
Push-Location $WorkspaceRoot
try {
    npx gitnexus analyze
    Write-Host "`n[OK] Indeksowanie zakonczone." -ForegroundColor Green
} catch {
    Write-Host "[!!] Blad podczas gitnexus analyze: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host "`n[GitNexus Setup] Gotowe! Zrestartuj VS Code aby zaladowac MCP.`n" -ForegroundColor Cyan
