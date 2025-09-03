@echo off
echo Starting Real-Time Sensor Data Collection
echo ==========================================
echo.
echo This script will:
echo - Try to connect to Arduino on COM7
echo - If Arduino not found, run in simulation mode
echo - Generate real-time data every 5 seconds
echo - Update the frontend automatically
echo.
echo Press Ctrl+C to stop data collection
echo.
python sensor_data.py
