@echo off
echo Starting Envra 2.0 - Air Quality Monitoring System
echo =================================================

echo.
echo Stopping any existing servers...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo.
echo 1. Starting Backend Server (FastAPI)...
start "FastAPI Server" cmd /k python server.py

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo 2. Starting Frontend Server (React)...
start "React Frontend" cmd /k npm start

echo.
echo 3. Instructions for Sensor Data:
echo    - Connect your Arduino sensor to COM7
echo    - Run sensor_data.py in a separate terminal when ready
echo    - Command: python sensor_data.py
echo.

echo All servers started! 
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:3000
echo - API Docs: http://localhost:8000/docs
echo.

echo Press any key to exit...
pause > nul
