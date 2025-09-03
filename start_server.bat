@echo off
echo Starting Air Quality Prediction Server...
echo.
echo Server will run on http://localhost:8000
echo API endpoint: http://localhost:8000/api/predict
echo Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.
python server.py
pause
