@echo off
echo ============================================
echo   DEVz HUB - React Flow Graph System
echo ============================================
echo.

echo [1/2] Starting Nodle Graph API (port 8001)...
start "Nodle API" cmd /c "cd /d %~dp0backend && python server.py 8001"
timeout /t 2 /nobreak >nul

echo [2/2] Starting React Flow Frontend (Vite)...
start "React Flow" cmd /c "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo   Backend API:  http://localhost:8001/api/nodle/graph
echo   Frontend:     http://localhost:5273
echo   Dashboard:    http://localhost:4200 (DEVz HUB)
echo.
echo   Press any key to stop...
pause >nul
