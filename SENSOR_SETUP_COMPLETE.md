# 🌍 Envira 2.0 - Real-Time Air Quality Monitoring System

## ✅ **Completed Tasks:**


### 1. **Updated Real-Time Architecture**
- ✅ **SensorData.js**: Fetches real sensor data every 5 seconds from API
- ✅ **server.py**: Reads latest data from `sensor_data.csv` 
- ✅ **sensor_data.py**: Collects real Arduino sensor data via COM7

## 🏗️ **System Architecture:**

```
Arduino Sensors (COM7) 
        ↓
sensor_data.py (Data Collection)
        ↓  
sensor_data.csv (Data Storage)
        ↓
server.py (API Server - Port 8000)
        ↓
React Frontend (Port 3000) - SensorData.js
```

## 🚀 **How to Run the Complete System:**

### **Step 1: Start Sensor Data Collection**
```bash
# Terminal 1 - Start collecting real sensor data
python sensor_data.py
```
*This will:*
- Connect to Arduino on COM7 (115200 baud)
- Collect PM2.5 and MQ135 gas sensor readings
- Save data to `sensor_data.csv`
- Display: `[SAVED] 2025-01-02 08:54:32 -> PM2.5:15.2 µg/m³ | Gas:145.3 ppm`

### **Step 2: Start API Server**  
```bash
# Terminal 2 - Start FastAPI backend
python server.py
```
*This will:*
- Load your ResNet18 air quality model
- Start API server on http://localhost:8000
- Serve sensor data from `sensor_data.csv`
- Handle image predictions

### **Step 3: Start React Frontend**
```bash
# Terminal 3 - Start React app
npm start
```
*This will:*
- Start React app on http://localhost:3000
- Display real-time sensor dashboard
- Update every 5 seconds with fresh data

## 📊 **Data Flow:**

### **Real-Time Sensor Data:**
- **Source**: Arduino PM2.5 + MQ135 sensors
- **Collection**: `sensor_data.py` → `sensor_data.csv`
- **API**: GET `/api/sensor-data` 
- **Frontend**: Updates every 5 seconds
- **Display**: Live AQI calculations, trends, charts

### **Image Predictions:**
- **Source**: User uploaded images
- **Model**: ResNet18 (`best_resnet18.pth`)
- **API**: POST `/api/predict`
- **Classes**: Good, Moderate, Severe, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy
- **Display**: Real predictions only (no fake data)

## 🔧 **Technical Specifications:**

### **Sensor Data Collection:**
- **Update Frequency**: Real-time (continuous)
- **Storage Format**: CSV with timestamp, PM2.5 (μg/m³), MQ135 (ppm)
- **Connection**: Arduino via Serial (COM7, 115200 baud)

### **Frontend Updates:**
- **Fetch Interval**: Every 5 seconds
- **Data Source**: Latest reading from CSV
- **Historical Data**: Last 50 readings kept in memory
- **Charts**: Real-time PM2.5, MQ135, and AQI trends

### **Error Handling:**
- **No Sensor Data**: Clear error message, offline indicators
- **API Failure**: Connection status shows offline
- **Model Error**: Proper error display (no fake predictions)

## 🎯 **Key Features:**

### **✅ Real-Time Dashboard:**
- Live AQI calculations using EPA formula
- PM2.5 and MQ135 sensor readings
- Trend analysis (rising/stable/improving)
- Historical charts (last 20 readings)
- Health recommendations based on current AQI

### **✅ Image Analysis:**
- Upload images for air quality prediction
- Real ResNet18 model predictions
- 6-class classification system
- Confidence scores
- No fallback predictions

### **✅ Data Export:**
- Export historical sensor data to CSV
- Timestamp, PM2.5, MQ135, AQI, Status
- Perfect for analysis and reporting

## 🚨 **Important Notes:**

1. **sensor_data.py MUST be running** for real sensor data
2. **Arduino must be connected** to COM7 for hardware sensors
3. **No fake predictions** - system shows offline when no real data
4. **server.py handles both** image predictions and sensor data
5. **All components remain separate** - clean architecture

## 📱 **URLs:**
- **React Frontend**: http://localhost:3000
- **FastAPI Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Sensor Data API**: http://localhost:8000/api/sensor-data
- **Image Prediction API**: http://localhost:8000/api/predict

## 🎉 **Result:**
Your system now provides 100% authentic real-time air quality monitoring with NO fallback or fake data! 🌍✨
