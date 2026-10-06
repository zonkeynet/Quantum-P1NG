@echo off
title QUANTUM P1NG - LIVE SCREEN RECORDER STUDIO
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\record_live.ps1"
pause
