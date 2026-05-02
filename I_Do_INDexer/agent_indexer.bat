@echo off
:: ZENO I_Do_INDEX Launcher dla Agentow
:: Uzycie: agent_indexer.bat <FOLDER_DO_SKANU> <NAZWA_INDEXU>
:: Przyklad: agent_indexer.bat "U:\WWW_Zen_BRo_wser_tool\src" my_project

if "%~1"=="" (
    echo [Błąd] Brak sciezki do zeskanowania.
    echo Uzycie: %0 ^<FOLDER_DO_SKANU^> ^<NAZWA_INDEXU^>
    exit /b 1
)

if "%~2"=="" (
    set INDEX_NAME=workspace_auto
) else (
    set INDEX_NAME=%~2
)

cd /d "U:\WWW_Zen_BRo_wser_tool\I_Do_INDexer"
:: Wywolujemy wrapper zeno_indexer.py korzystajac z venv
.venv\Scripts\python.exe zeno_indexer.py "%~1" --name "%INDEX_NAME%" --format sqlite
exit /b %ERRORLEVEL%
