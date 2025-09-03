@echo off
echo Starting Test Sensor Data Generation
echo ===================================
echo.
echo This will generate realistic sensor data for testing
echo since your PM2.5 sensor is currently reading 0.0
echo.
echo The test data will include:
echo - PM2.5: 5-45 µg/m³ (mostly Good to Moderate)
echo - MQ135: 95-120 ppm (similar to your real sensor)
echo - Occasional higher pollution spikes
echo.
echo Press Ctrl+C to stop and return to real sensor data
echo.
python test_sensor_data.py
