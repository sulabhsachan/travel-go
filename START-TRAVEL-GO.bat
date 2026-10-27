@echo off
title Travel Go Launcher
cd /d "%~dp0"
rem Add your real UPI ID below, then save this file. Example: name@oksbi
set "TRAVEL_GO_UPI_ID=sachansulab@oksbi"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Please install it from https://nodejs.org/
  pause
  exit /b 1
)
start "Travel Go Server" cmd /k "node server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
exit
