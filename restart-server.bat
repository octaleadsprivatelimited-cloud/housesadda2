@echo off
echo Stopping existing server processes...
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
        echo Killing process %%a
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo Waiting for port to be free...
timeout /t 2 /nobreak >nul

echo Starting backend server...
cd /d "%~dp0"
start "Backend Server" cmd /k "npm run dev:server"

echo.
echo Backend server is starting in a new window...
echo Wait a few seconds for it to initialize, then test with: node test-server-auth.js
echo.
pause
