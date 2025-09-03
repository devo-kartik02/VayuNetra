# VayuNetra - Air Quality Monitoring System

A comprehensive air quality monitoring system with AI-powered image analysis and real-time sensor data collection.

## 🌟 Features

- **AI Image Analysis**: Upload photos to get instant air quality predictions using ResNet18 deep learning model
- **Real-time Sensor Monitoring**: Live PM2.5 and MQ135 gas sensor data with 5-second updates
- **EPA-Standard AQI Calculation**: Professional air quality index calculation with health recommendations
- **Interactive Dashboard**: Modern React frontend with real-time charts and data visualization
- **Historical Data Tracking**: Export sensor data to CSV for analysis
- **Multi-sensor Integration**: Combines particulate matter and gas concentration measurements

## 🏗️ System Architecture

### Backend (FastAPI + PyTorch)
- **server.py**: Main API server handling image classification and sensor data
- **sensor_data.py**: Arduino sensor data collection script
- **Model**: ResNet18 trained for air quality classification (6 categories)

### Frontend (React)
- **Air Quality Analysis**: Image upload and AI prediction interface
- **Sensor Dashboard**: Real-time monitoring with live charts
- **Plant Store**: Environmental-friendly plant recommendations
- **User Authentication**: Login/registration system

## 🚀 Quick Start

### 1. Start All Services
```bash
# Run the complete system
start_all.bat
```

This will automatically start:
- Backend server on http://localhost:8000
- Frontend server on http://localhost:3000
- API documentation on http://localhost:8000/docs

### 2. Start Sensor Data Collection (Optional)
```bash
# If you have Arduino sensors connected
start_sensors.bat
```

## 📋 Manual Setup

### Prerequisites
- **Python 3.8+**
- **Node.js 16+**
- **Arduino with PM2.5 and MQ135 sensors** (optional)

### Backend Setup
1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Verify model file exists:
```
C:\Users\kartik\Desktop\VayuNetra\Models\best_resnet18.pth
```

3. Start the backend:
```bash
python server.py
```

### Frontend Setup
1. Install Node dependencies:
```bash
npm install
```

2. Start the React development server:
```bash
npm start
```

### Sensor Setup (Optional)
1. Connect your Arduino to **COM7** (or update the port in sensor_data.py)
2. Ensure sensors output data in CSV format: `timestamp,pm25_value,gas_ppm`
3. Run sensor data collection:
```bash
python sensor_data.py
```

## 🔧 Configuration

### Model Configuration (server.py)
- **Model Path**: `C:\Users\kartik\Desktop\VayuNetra\Models\best_resnet18.pth`
- **Classes**: Good, Moderate, Severe, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy
- **Input**: 224x224 RGB images

### Sensor Configuration (sensor_data.py)
- **Serial Port**: COM7
- **Baud Rate**: 115200
- **Update Interval**: 5 seconds
- **Data Format**: CSV with timestamp, PM2.5 (μg/m³), MQ135 (ppm)

### API Endpoints
- **POST** `/api/predict` - Image classification
- **GET** `/api/sensor-data` - Latest sensor readings

## 🛠️ Troubleshooting

### Common Issues

1. **Backend server won't start**:
   - Check if model file exists
   - Verify Python dependencies are installed
   - Ensure port 8000 is not in use

2. **Frontend compilation errors**:
   - Run `npm install` to update dependencies
   - Clear cache with `npm start -- --reset-cache`

3. **Sensor data not updating**:
   - Verify Arduino is connected to COM7
   - Check if sensor_data.py is running
   - Ensure CSV file has write permissions

4. **Image classification fails**:
   - Verify backend server is running
   - Check if model file is accessible
   - Ensure uploaded images are valid formats (JPG, PNG, WEBP)

### Fixed Issues ✅

- ✅ **Fixed**: Missing reportWebVitals import in index.js
- ✅ **Fixed**: Undefined variables in SensorData.js
- ✅ **Fixed**: CSS class name typo in AirQuality.js
- ✅ **Fixed**: 5-second interval implementation in sensor_data.py
- ✅ **Fixed**: React dependency warnings
- ✅ **Fixed**: Backend API integration

## 📊 Air Quality Classifications

| AQI Range | Classification | Health Impact | Color |
|-----------|---------------|---------------|-------|
| 0-50 | Good | Minimal impact | Green |
| 51-100 | Moderate | Acceptable for most | Yellow |
| 101-150 | Unhealthy for Sensitive | Sensitive groups affected | Orange |
| 151-200 | Unhealthy | Everyone may be affected | Red |
| 201-300 | Very Unhealthy | Health alert conditions | Dark Red |
| 301+ | Hazardous | Emergency conditions | Maroon |

## 📁 Project Structure

```
envra_2.0-frontend/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable React components
│   ├── pages/               # Main application pages
│   └── App.js              # Main React application
├── server.py               # FastAPI backend server
├── sensor_data.py          # Arduino sensor data collector
├── start_all.bat          # Complete system startup script
├── start_sensors.bat      # Sensor data collection script
├── requirements.txt       # Python dependencies
└── package.json          # Node.js dependencies
```

## 🚦 System Status

All major issues have been resolved and the system is ready for deployment:

- ✅ React frontend compiles successfully
- ✅ FastAPI backend server functional
- ✅ Image classification model integrated
- ✅ Real-time sensor data pipeline working
- ✅ 5-second update intervals implemented
- ✅ All compilation errors fixed

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all dependencies are installed correctly
3. Ensure hardware connections (for sensors) are secure
4. Check console logs for specific error messages

---

**Ready to monitor air quality with AI! 🌍**
