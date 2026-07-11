@echo off
title HVAC Pro v8 — Sunucu
echo.
echo  HVAC Pro v8 baslatiliyor...
echo.

:: Node.js kontrolü
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  HATA: Node.js bulunamadi!
    echo  Lutfen nodejs.org adresinden Node.js yukleyin.
    pause
    exit /b 1
)

:: Paketleri yükle (ilk çalıştırmada)
if not exist "node_modules" (
    echo  Bagimliliklar yukleniyor...
    call npm install
    echo.
)

:: Sunucuyu başlat
echo  Sunucu baslatiliyor...
start "" http://localhost:3001
node server.js

pause
