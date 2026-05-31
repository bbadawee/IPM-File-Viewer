@echo off
echo ==============================================
echo Building IPM Viewer for Windows using PyInstaller
echo ==============================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Installing dependencies...
pip install -r requirements.txt
pip install pyinstaller

echo Compiling IPM-Viewer.exe...
pyinstaller --noconfirm --onedir --windowed --add-data "templates;templates/" --add-data "static;static/" --name "IPM-Viewer" server.py

echo ==============================================
echo Build Complete!
echo Your executable is located in the 'dist\IPM-Viewer' folder.
echo You can run 'IPM-Viewer.exe' directly from there!
echo ==============================================
pause
