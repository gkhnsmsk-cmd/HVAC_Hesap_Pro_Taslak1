@echo off
cd /d "%~dp0HVAC_Pro_v8"
echo HVAC Pro v8 sunucu baslatiliyor...
echo Tarayicinizda acin: http://localhost:8765
echo Durdurmak icin: Ctrl+C
python -m http.server 8765
pause
