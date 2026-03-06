@echo off
cd WebTreking

echo Getting local IPv4 address...

for /f "tokens=14 delims= " %%i in ('ipconfig ^| findstr /i "IPv4"') do (
set IP=%%i
goto :found
)

:found
echo Your IP: %IP%

echo Starting PHP server...
start http://%IP%:8000
php -S %IP%:8000

pause
