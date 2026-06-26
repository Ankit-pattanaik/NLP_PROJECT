@echo off
title NykaaSentiment - NLP Project

echo ============================================
echo   NykaaSentiment - Nykaa Review Analysis
echo ============================================
echo.

:: ── Install backend deps ──────────────────────
echo [1/4] Installing Python dependencies...
cd /d "%~dp0backend"
pip install -r requirements.txt --quiet
echo       Done.
echo.

:: ── Start Flask backend ───────────────────────
echo [2/4] Starting Flask backend on http://localhost:5000
start "Flask Backend" cmd /k "cd /d %~dp0backend && python app.py"
echo       Flask starting in background...
echo.

:: ── Install frontend deps ─────────────────────
echo [3/4] Installing Node dependencies...
cd /d "%~dp0frontend"
call npm install --silent
echo       Done.
echo.

:: ── Start React frontend ──────────────────────
echo [4/4] Starting React frontend on http://localhost:3000
echo.
echo ============================================
echo   Open http://localhost:3000 in your browser
echo   The dashboard will show a loading screen
echo   while the model trains (~1-2 minutes).
echo ============================================
echo.
start "" "http://localhost:3000"
call npm run dev

pause
