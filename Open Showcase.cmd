@echo off
setlocal
cd /d "%~dp0"
title MaterialFluid - Local Showcase
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 22.12 or newer, then try again.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Installing MaterialFluid dependencies...
  call npm ci --cache ".cache\npm"
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
node "%~dp0scripts\launch-showcase.mjs"
if errorlevel 1 pause
endlocal
