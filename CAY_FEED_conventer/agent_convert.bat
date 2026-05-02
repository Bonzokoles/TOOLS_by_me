@echo off
:: Skrypt dla agentow (bez UI)
:: Uzycie: agent_convert.bat <URL_lub_PLIK> <FORMAT: xml|csv|json> <NAZWA_WYNIKU>
:: Przyklad: agent_convert.bat "https://sklep.pl/feed.xml" xml pumo_feed

if "%~1"=="" (
    echo [Błąd] Brak sciezki wejsciowej.
    echo Uzycie: %0 ^<URL_lub_PLIK^> ^<FORMAT: xml^|csv^|json^> ^<NAZWA_WYNIKU^>
    exit /b 1
)

if "%~2"=="" (
    echo [Błąd] Brak formatu.
    exit /b 1
)

if "%~3"=="" (
    set OUT_NAME=auto_feed
) else (
    set OUT_NAME=%~3
)

cd /d "U:\WWW_Zen_BRo_wser_tool\CAY_FEED_conventer"
python zen_bridge.py --headless --input "%~1" --format "%~2" --out "%OUT_NAME%"
exit /b %ERRORLEVEL%
