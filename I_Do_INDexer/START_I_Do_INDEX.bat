@echo off
chcp 65001 >nul
echo ==========================================
echo   I_Do_INDEX v2.0 - Folder Indexer
echo   Jimbo (MOA System) - 2026-01-31
echo ==========================================
echo.

:: Sprawdź czy Python jest zainstalowany
python --version >nul 2>&1
if errorlevel 1 (
    echo [BLAD] Python nie jest zainstalowany lub nie ma go w PATH
    echo [INFO] Pobierz Python z: https://python.org
    pause
    exit /b 1
)

:: Sprawdź wersję Python (wymagana 3.11+)
for /f "tokens=2" %%a in ('python --version 2^>^&1') do set PYVER=%%a
for /f "tokens=1 delims=." %%a in ("%PYVER%") do set PYMAJOR=%%a
for /f "tokens=2 delims=." %%b in ("%PYVER%") do set PYMINOR=%%b

if %PYMAJOR% LSS 3 (
    echo [BLAD] Wymagany Python 3.11+, masz %PYVER%
    pause
    exit /b 1
)
if %PYMAJOR%==3 if %PYMINOR% LSS 11 (
    echo [BLAD] Wymagany Python 3.11+, masz %PYVER%
    pause
    exit /b 1
)

echo [OK] Python %PYVER% znaleziony
echo.

:: Sprawdź czy zależności są zainstalowane
echo [INFO] Sprawdzanie zależności...
python -c "import pydantic, aiosqlite, aiofiles, pathspec, typer" 2>nul
if errorlevel 1 (
    echo [INFO] Instalowanie zależności...
    echo.
    pip install pydantic aiosqlite aiofiles pathspec typer tqdm
    if errorlevel 1 (
        echo [BLAD] Nie udalo sie zainstalowac zaleznosci
        pause
        exit /b 1
    )
    echo [OK] Zależności zainstalowane
) else (
    echo [OK] Zależności OK
)

echo.
echo ==========================================
echo   DOSTEPNE KOMENDY:
echo ==========================================
echo.
echo 1. Podstawowe skanowanie (SQLite):
echo    I_Do_INDEX scan "C:\Twoj\Folder" -o output.db
echo.
echo 2. Pełne skanowanie z hashami:
echo    I_Do_INDEX scan "C:\Folder" -o index.db --hash sha256 --code-stats
echo.
echo 3. Export do JSONL:
echo    I_Do_INDEX scan "C:\Folder" -f jsonl -o files.jsonl
echo.
echo 4. Tylko statystyki kodu:
echo    I_Do_INDEX scan "C:\Projekt" --code-stats -o code.db
echo.
