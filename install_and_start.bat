@echo off
SETLOCAL ENABLEEXTENSIONS
SET "LOG_FILE=%~dp0install_log.txt"
SET "PROJECT_DIR=%~dp0Chrome Extension"
SET "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
SET "SHORTCUT_NAME=StartChromeExtensionServer.bat"
SET "SHORTCUT_PATH=%STARTUP_FOLDER%\%SHORTCUT_NAME%"

:: Function to log messages
echo Logging started at %DATE% %TIME% > "%LOG_FILE"

:: Step 1: Check Node.js
echo Checking for Node.js... >> "%LOG_FILE"
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Installing Node.js... >> "%LOG_FILE"
    echo Node.js is not installed. Please install it manually from https://nodejs.org/ >> "%LOG_FILE"
    echo Node.js is not installed. Please install it manually from https://nodejs.org/
    pause
    exit /b
) ELSE (
    echo Node.js is installed. >> "%LOG_FILE"
)

:: Step 2: Install dependencies
echo Installing dependencies... >> "%LOG_FILE"
cd /d "%PROJECT_DIR%"
npm install >> "%LOG_FILE" 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies. >> "%LOG_FILE"
    echo Dependency installation failed. Check install_log.txt for details.
    pause
    exit /b
) ELSE (
    echo Dependencies installed successfully. >> "%LOG_FILE"
)

:: Step 3: Create startup shortcut
echo Creating startup shortcut... >> "%LOG_FILE"
echo @echo off > "%SHORTCUT_PATH%"
echo cd /d "%PROJECT_DIR%" >> "%SHORTCUT_PATH%"
echo node server.js >> "%SHORTCUT_PATH%"
echo Startup shortcut created at %SHORTCUT_PATH% >> "%LOG_FILE"

:: Step 4: Start the server
echo Starting server... >> "%LOG_FILE"
start "" cmd /k "cd /d \"%PROJECT_DIR%\" && node server.js"
echo Server started. >> "%LOG_FILE"

:: Step 5: Final message
echo Installation complete. Press any key to exit. >> "%LOG_FILE"
echo Installation complete. Press any key to exit.
pause
ENDLOCAL
