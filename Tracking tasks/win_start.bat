@echo off
cd /d "%~dp0"

echo Checking data file...

if not exist "WebTreking\src\data\treking.JSON" (
echo Creating treking.JSON
mkdir "WebTreking\src\data" 2>nul
echo { "FOLDER": [] } > "WebTreking\src\data\treking.JSON"
)

echo Detecting local IPv4...

for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
set IP=%%i
goto :found
)

:found
set IP=%IP: =%

echo.
echo Starting server on http://%IP%:8000
echo.

start http://%IP%:8000

WebTreking\php\php.exe -c WebTreking\php\php.ini -S %IP%:8000 -t WebTreking

pause