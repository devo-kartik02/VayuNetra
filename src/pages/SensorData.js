import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Download, MapPin, Clock, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import './SensorData.css';

const SensorData = () => {
  const [sensorData, setSensorData] = useState({
    pm25: { value: 0, status: 'offline', lastUpdate: null },
    mq135: { value: 0, status: 'offline', lastUpdate: null }
  });
  const [aqiData, setAqiData] = useState({
    value: 0,
    classification: 'Good',
    status: 'good',
    trend: 'stable'
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch real-time sensor data every 5 seconds
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/sensor-data");
        if (!response.ok) {
          throw new Error(`Sensor API not available (${response.status})`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Check if we have valid sensor data
        if (data.source === "no_data") {
          throw new Error("No sensor data available. Please start sensor_data.py to collect real sensor readings.");
        }
        
        // Handle case where PM2.5 sensor might be reading 0.0 but MQ135 is working
        if (data.pm25 === 0.0 && data.mq135 > 0) {
          console.warn("PM2.5 sensor reading 0.0 - check sensor connection. Using MQ135 data only.");
        }
        
        // Update sensor readings
        const newSensorData = {
          pm25: {
            value: data.pm25,
            status: 'online',
            lastUpdate: new Date()
          },
          mq135: {
            value: data.mq135,
            status: 'online',
            lastUpdate: new Date()
          }
        };
        
        const newAqiData = calculateAQI(data.pm25, data.mq135);
        
        // Determine trend
        const prevAqi = aqiData.value;
        let trend = 'stable';
        if (newAqiData.value > prevAqi + 5) trend = 'increasing';
        else if (newAqiData.value < prevAqi - 5) trend = 'decreasing';
        
        setSensorData(newSensorData);
        setAqiData({ ...newAqiData, trend });
        setLastRefresh(new Date());
        setIsConnected(true);
        
        // Add to historical data (keep last 50 readings)
        setHistoricalData(prev => {
          const newData = [...prev, {
            timestamp: new Date(),
            pm25: data.pm25,
            mq135: data.mq135,
            aqi: newAqiData.value
          }];
          return newData.slice(-50);
        });
        
      } catch (error) {
        console.error('Failed to fetch sensor data:', error);
        setIsConnected(false);
        // Set sensors to offline status
        setSensorData({
          pm25: { value: 0, status: 'offline', lastUpdate: null },
          mq135: { value: 0, status: 'offline', lastUpdate: null }
        });
      }
    };

    // Initial fetch
    fetchSensorData();
    
    // Set up interval for real-time updates every 5 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchSensorData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, aqiData.value]);


  // Calculate AQI based on PM2.5 and MQ135 readings
  const calculateAQI = (pm25, mq135) => {
    let aqi = 0;
    let classification = 'Good';
    let status = 'good';

    // PM2.5 AQI calculation using EPA formula
    if (pm25 <= 12) {
      aqi = Math.round((50 / 12) * pm25);
    } else if (pm25 <= 35.4) {
      aqi = Math.round(50 + ((100 - 50) / (35.4 - 12.1)) * (pm25 - 12.1));
    } else if (pm25 <= 55.4) {
      aqi = Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5));
    } else if (pm25 <= 150.4) {
      aqi = Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5));
    } else if (pm25 <= 250.4) {
      aqi = Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5));
    } else {
      aqi = Math.round(301 + ((500 - 301) / (500 - 250.5)) * (pm25 - 250.5));
    }

    // Adjust AQI based on MQ135 gas sensor readings
    // MQ135 detects CO2, NH3, NOx, alcohol, benzene, smoke
    if (mq135 > 300) {
      aqi += 30; // Very high gas concentration
    } else if (mq135 > 200) {
      aqi += 20; // High gas concentration
    } else if (mq135 > 150) {
      aqi += 10; // Moderate gas concentration
    }

    // Classify AQI
    aqi = Math.min(aqi, 500); // Cap at 500
    
    if (aqi <= 50) {
      classification = 'Good';
      status = 'good';
    } else if (aqi <= 100) {
      classification = 'Moderate';
      status = 'moderate';
    } else if (aqi <= 150) {
      classification = 'Unhealthy for Sensitive Groups';
      status = 'unhealthy-sensitive';
    } else if (aqi <= 200) {
      classification = 'Unhealthy';
      status = 'unhealthy';
    } else if (aqi <= 300) {
      classification = 'Very Unhealthy';
      status = 'very-unhealthy';
    } else {
      classification = 'Hazardous';
      status = 'hazardous';
    }

    return { value: aqi, classification, status };
  };

  const handleManualRefresh = async () => {
    // Manually trigger a new sensor reading
    try {
      const response = await fetch('http://localhost:8000/api/sensor-data');
      if (response.ok) {
        // The main useEffect will handle the data update
        console.log('Manual refresh triggered');
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  const handlePlayPause = () => {
    setAutoRefresh(!autoRefresh); // Toggle auto refresh
  };

  const handleReset = () => {
    setHistoricalData([]);
    setSensorData({
      pm25: { value: 0, status: 'offline', lastUpdate: null },
      mq135: { value: 0, status: 'offline', lastUpdate: null }
    });
    setAqiData({
      value: 0,
      classification: 'Good',
      status: 'good',
      trend: 'stable'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="status-icon good" size={24} />;
      case 'moderate':
        return <AlertTriangle className="status-icon moderate" size={24} />;
      case 'unhealthy-sensitive':
      case 'unhealthy':
      case 'very-unhealthy':
      case 'hazardous':
        return <XCircle className="status-icon unhealthy" size={24} />;
      default:
        return <AlertTriangle className="status-icon" size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return '#22c55e';
      case 'moderate':
        return '#f59e0b';
      case 'unhealthy-sensitive':
        return '#f97316';
      case 'unhealthy':
        return '#ef4444';
      case 'very-unhealthy':
        return '#dc2626';
      case 'hazardous':
        return '#991b1b';
      default:
        return '#6b7280';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="trend-icon increasing" size={20} />;
      case 'decreasing':
        return <TrendingDown className="trend-icon decreasing" size={20} />;
      default:
        return <Minus className="trend-icon stable" size={20} />;
    }
  };

  const getSensorStatusColor = (status) => {
    return status === 'online' ? '#22c55e' : '#ef4444';
  };

  const getHealthRecommendations = (status) => {
    switch (status) {
      case 'good':
        return [
          'Excellent air quality for outdoor activities',
          'Perfect conditions for exercise and sports',
          'Safe for all age groups including children'
        ];
      case 'moderate':
        return [
          'Generally acceptable air quality',
          'Sensitive individuals should consider limiting outdoor activities',
          'Good time for most outdoor activities'
        ];
      case 'unhealthy-sensitive':
        return [
          'Sensitive groups should avoid prolonged outdoor activities',
          'Consider wearing masks if you must go outside',
          'Keep windows closed and use air purifiers indoors'
        ];
      case 'unhealthy':
      case 'very-unhealthy':
      case 'hazardous':
        return [
          'Avoid all outdoor activities',
          'Stay indoors with air purifiers running',
          'Wear N95 or P100 masks if you must go outside',
          'Seek medical attention if experiencing breathing difficulties'
        ];
      default:
        return ['Monitor air quality regularly', 'Stay informed about local conditions'];
    }
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Timestamp,PM2.5 (μg/m³),MQ135 (ppm),AQI,Status\n" +
      historicalData.map(row => 
        `${row.timestamp.toISOString()},${row.pm25},${row.mq135},${row.aqi},${aqiData.classification}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "envra_sensor_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="sensor-data-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Real-Time Air Quality Monitoring</h1>
          <p>Live sensor data from PM2.5 and MQ135 sensors with AI-powered AQI predictions</p>
        </div>
        <div className="header-controls">
          <div className="connection-status">
            {isConnected ? (
              <>
                <Wifi className="connection-icon online" size={20} />
                <span className="status-text online">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="connection-icon offline" size={20} />
                <span className="status-text offline">Offline</span>
              </>
            )}
          </div>
          <div className="refresh-controls">
            <button 
              className={`toggle-btn ${autoRefresh ? 'active' : 'inactive'}`}
              onClick={handlePlayPause}
              title={autoRefresh ? 'Pause real-time updates' : 'Resume real-time updates'}
            >
              {autoRefresh ? '⏸️' : '▶️'}
            </button>
            <button className="reset-btn" onClick={handleReset} title="Clear historical data">
              🔄
            </button>
            <span className="update-status">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          <button 
            className="refresh-btn"
            onClick={handleManualRefresh}
            title="Next reading"
          >
            <RefreshCw size={18} />
            Next
          </button>
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-play
          </label>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Main AQI Display */}
        <div className="aqi-main-card">
          <div className="aqi-header">
            <div className="aqi-title">
              <h2>Current Air Quality Index</h2>
              <div className="location-info">
                <MapPin size={16} />
                Environmental Monitoring Station
              </div>
            </div>
            <div className="aqi-trend">
              {getTrendIcon(aqiData.trend)}
              <span className={`trend-text ${aqiData.trend}`}>
                {aqiData.trend === 'increasing' ? 'Rising' : 
                 aqiData.trend === 'decreasing' ? 'Improving' : 'Stable'}
              </span>
            </div>
          </div>
          
          <div className="aqi-display">
            <div className="aqi-circle-container">
              <div 
                className="aqi-circle"
                style={{ 
                  borderColor: getStatusColor(aqiData.status),
                  boxShadow: `0 0 30px ${getStatusColor(aqiData.status)}40`
                }}
              >
                <div className="aqi-number" style={{ color: getStatusColor(aqiData.status) }}>
                  {aqiData.value}
                </div>
                <div className="aqi-classification">{aqiData.classification}</div>
              </div>
            </div>
            
            <div className="aqi-info">
              <div className="status-indicator">
                {getStatusIcon(aqiData.status)}
                <div className="status-details">
                  <div className="status-title">Air Quality Status</div>
                  <div className="status-description">
                    {aqiData.status === 'good' && 'Air quality is satisfactory and poses little or no health risk.'}
                    {aqiData.status === 'moderate' && 'Air quality is acceptable but may be a concern for sensitive individuals.'}
                    {(aqiData.status.includes('unhealthy') || aqiData.status === 'hazardous') && 'Air quality is unhealthy and may cause health effects.'}
                  </div>
                </div>
              </div>
              
              <div className="last-update">
                <Clock size={16} />
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Readings */}
        <div className="sensors-grid">
          {/* PM2.5 Sensor */}
          <div className="sensor-card">
            <div className="sensor-header">
              <div className="sensor-info">
                <h3>PM2.5 Sensor</h3>
                <div className="sensor-description">Particulate Matter ≤ 2.5 μm</div>
              </div>
              <div className="sensor-status">
                <div 
                  className={`status-dot ${sensorData.pm25.status}`}
                  style={{ backgroundColor: getSensorStatusColor(sensorData.pm25.status) }}
                ></div>
                <span className={`status-label ${sensorData.pm25.status}`}>
                  {sensorData.pm25.status}
                </span>
              </div>
            </div>
            
            <div className="sensor-reading">
              <div className="reading-value">
                {sensorData.pm25.value.toFixed(1)}
                <span className="reading-unit">μg/m³</span>
              </div>
              <div className="reading-status">
                {sensorData.pm25.value <= 12 && <span className="status-good">Good</span>}
                {sensorData.pm25.value > 12 && sensorData.pm25.value <= 35.4 && <span className="status-moderate">Moderate</span>}
                {sensorData.pm25.value > 35.4 && <span className="status-unhealthy">Unhealthy</span>}
              </div>
            </div>

            <div className="sensor-chart">
              <div className="chart-title">Recent readings</div>
              <div className="mini-chart">
                {historicalData.slice(-15).map((data, index) => (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{ 
                      height: `${Math.min((data.pm25 / 100) * 100, 100)}%`,
                      backgroundColor: data.pm25 <= 12 ? '#22c55e' : data.pm25 <= 35.4 ? '#f59e0b' : '#ef4444'
                    }}
                    title={`${data.pm25.toFixed(1)} μg/m³ at ${data.timestamp.toLocaleTimeString()}`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="sensor-meta">
              <div className="meta-item">
                <span>Current Level:</span>
                <span>{sensorData.pm25.value.toFixed(2)} μg/m³</span>
              </div>
              <div className="meta-item">
                <span>WHO Guideline:</span>
                <span>≤ 15 μg/m³</span>
              </div>
              <div className="meta-item">
                <span>Last Reading:</span>
                <span>{sensorData.pm25.lastUpdate?.toLocaleTimeString() || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* MQ135 Sensor */}
          <div className="sensor-card">
            <div className="sensor-header">
              <div className="sensor-info">
                <h3>MQ135 Gas Sensor</h3>
                <div className="sensor-description">Multi-gas Detection (CO₂, NH₃, NOₓ)</div>
              </div>
              <div className="sensor-status">
                <div 
                  className={`status-dot ${sensorData.mq135.status}`}
                  style={{ backgroundColor: getSensorStatusColor(sensorData.mq135.status) }}
                ></div>
                <span className={`status-label ${sensorData.mq135.status}`}>
                  {sensorData.mq135.status}
                </span>
              </div>
            </div>
            
            <div className="sensor-reading">
              <div className="reading-value">
                {sensorData.mq135.value.toFixed(1)}
                <span className="reading-unit">ppm</span>
              </div>
              <div className="reading-status">
                {sensorData.mq135.value <= 150 && <span className="status-good">Normal</span>}
                {sensorData.mq135.value > 150 && sensorData.mq135.value <= 300 && <span className="status-moderate">Elevated</span>}
                {sensorData.mq135.value > 300 && <span className="status-unhealthy">High</span>}
              </div>
            </div>

            <div className="sensor-chart">
              <div className="chart-title">Recent readings</div>
              <div className="mini-chart">
                {historicalData.slice(-15).map((data, index) => (
                  <div 
                    key={index}
                    className="chart-bar"
                    style={{ 
                      height: `${Math.min((data.mq135 / 500) * 100, 100)}%`,
                      backgroundColor: data.mq135 <= 150 ? '#22c55e' : data.mq135 <= 300 ? '#f59e0b' : '#ef4444'
                    }}
                    title={`${data.mq135.toFixed(1)} ppm at ${data.timestamp.toLocaleTimeString()}`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="sensor-meta">
              <div className="meta-item">
                <span>Current Level:</span>
                <span>{sensorData.mq135.value.toFixed(2)} ppm</span>
              </div>
              <div className="meta-item">
                <span>Detects:</span>
                <span>CO₂, NH₃, NOₓ, Alcohol, Smoke</span>
              </div>
              <div className="meta-item">
                <span>Last Reading:</span>
                <span>{sensorData.mq135.lastUpdate?.toLocaleTimeString() || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Section */}
        <div className="analysis-section">
          <div className="predictions-card">
            <h3>AQI Calculation Model</h3>
            <div className="prediction-content">
              <div className="prediction-formula">
                <h4>EPA-Based Calculation</h4>
                <div className="formula-explanation">
                  <div className="formula-step">
                    <span className="step-number">1</span>
                    <span>Base AQI calculated from PM2.5 using EPA breakpoint formula</span>
                  </div>
                  <div className="formula-step">
                    <span className="step-number">2</span>
                    <span>Gas concentration adjustment from MQ135 multi-gas readings</span>
                  </div>
                  <div className="formula-step">
                    <span className="step-number">3</span>
                    <span>Combined AQI classified into health impact categories</span>
                  </div>
                </div>
              </div>
              
              <div className="current-calculation">
                <h4>Current Calculation</h4>
                <div className="calc-details">
                  <div className="calc-item">
                    <span>PM2.5 Contribution:</span>
                    <span>{sensorData.pm25.value.toFixed(1)} μg/m³</span>
                  </div>
                  <div className="calc-item">
                    <span>Gas Adjustment:</span>
                    <span>
                      {sensorData.mq135.value > 300 ? '+30' : 
                       sensorData.mq135.value > 200 ? '+20' : 
                       sensorData.mq135.value > 150 ? '+10' : '+0'} points
                    </span>
                  </div>
                  <div className="calc-item">
                    <span>Final AQI:</span>
                    <span className="final-aqi" style={{ color: getStatusColor(aqiData.status) }}>
                      {aqiData.value}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="recommendations-card">
            <h3>Health Recommendations</h3>
            <div className="recommendations-list">
              {getHealthRecommendations(aqiData.status).map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <CheckCircle className="recommendation-icon" size={16} />
                  <span>{recommendation}</span>
                </div>
              ))}
            </div>
            
            <div className="air-quality-scale">
              <h4>AQI Scale Reference</h4>
              <div className="scale-items">
                <div className="scale-item">
                  <div className="scale-color" style={{ backgroundColor: '#22c55e' }}></div>
                  <span className="scale-range">0-50</span>
                  <span className="scale-label">Good</span>
                </div>
                <div className="scale-item">
                  <div className="scale-color" style={{ backgroundColor: '#f59e0b' }}></div>
                  <span className="scale-range">51-100</span>
                  <span className="scale-label">Moderate</span>
                </div>
                <div className="scale-item">
                  <div className="scale-color" style={{ backgroundColor: '#f97316' }}></div>
                  <span className="scale-range">101-150</span>
                  <span className="scale-label">Unhealthy for Sensitive</span>
                </div>
                <div className="scale-item">
                  <div className="scale-color" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="scale-range">151-200</span>
                  <span className="scale-label">Unhealthy</span>
                </div>
                <div className="scale-item">
                  <div className="scale-color" style={{ backgroundColor: '#dc2626' }}></div>
                  <span className="scale-range">201-300</span>
                  <span className="scale-label">Very Unhealthy</span>
                </div>
                <div className="scale-item">
                  <div className="scale-color" style={{ backgroundColor: '#991b1b' }}></div>
                  <span className="scale-range">301+</span>
                  <span className="scale-label">Hazardous</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Data Chart */}
        <div className="historical-section">
          <div className="chart-header">
            <h3>Historical Trends</h3>
            <div className="chart-controls">
              <button className="export-btn" onClick={exportData}>
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
          
          <div className="historical-chart">
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color pm25"></div>
                <span>PM2.5 (μg/m³)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color mq135"></div>
                <span>MQ135 (ppm ÷ 10)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color aqi"></div>
                <span>AQI</span>
              </div>
            </div>
            
            <div className="chart-container">
              <div className="chart-y-axis">
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
              </div>
              <div className="chart-area">
                {historicalData.slice(-20).map((data, index) => (
                  <div key={index} className="chart-column">
                    <div 
                      className="chart-line pm25"
                      style={{ height: `${Math.min((data.pm25 / 50) * 100, 100)}%` }}
                      title={`PM2.5: ${data.pm25.toFixed(1)} μg/m³`}
                    ></div>
                    <div 
                      className="chart-line mq135"
                      style={{ height: `${Math.min((data.mq135 / 10 / 50) * 100, 100)}%` }}
                      title={`MQ135: ${data.mq135.toFixed(1)} ppm`}
                    ></div>
                    <div 
                      className="chart-line aqi"
                      style={{ height: `${Math.min((data.aqi / 200) * 100, 100)}%` }}
                      title={`AQI: ${data.aqi}`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="chart-x-axis">
              {historicalData.slice(-5).map((data, index) => (
                <span key={index}>
                  {data.timestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="technical-section">
          <h3>Technical Specifications</h3>
          <div className="tech-grid">
            <div className="tech-card">
              <h4>PM2.5 Sensor</h4>
              <div className="tech-details">
                <div className="tech-item">
                  <span>Measurement Principle:</span>
                  <span>Laser Scattering</span>
                </div>
                <div className="tech-item">
                  <span>Range:</span>
                  <span>0-500 μg/m³</span>
                </div>
                <div className="tech-item">
                  <span>Resolution:</span>
                  <span>1 μg/m³</span>
                </div>
                <div className="tech-item">
                  <span>Accuracy:</span>
                  <span>±10% (0-100 μg/m³)</span>
                </div>
                <div className="tech-item">
                  <span>Response Time:</span>
                  <span>≤1 second</span>
                </div>
              </div>
            </div>

            <div className="tech-card">
              <h4>MQ135 Gas Sensor</h4>
              <div className="tech-details">
                <div className="tech-item">
                  <span>Sensor Type:</span>
                  <span>Tin Dioxide (SnO₂)</span>
                </div>
                <div className="tech-item">
                  <span>Detection Range:</span>
                  <span>10-1000 ppm</span>
                </div>
                <div className="tech-item">
                  <span>Target Gases:</span>
                  <span>CO₂, NH₃, NOₓ, Alcohol</span>
                </div>
                <div className="tech-item">
                  <span>Operating Temp:</span>
                  <span>-20°C to 50°C</span>
                </div>
                <div className="tech-item">
                  <span>Response Time:</span>
                  <span>≤30 seconds</span>
                </div>
              </div>
            </div>

            <div className="tech-card">
              <h4>Data Processing</h4>
              <div className="tech-details">
                <div className="tech-item">
                  <span>Update Frequency:</span>
                  <span>Every 5 seconds</span>
                </div>
                <div className="tech-item">
                  <span>AQI Calculation:</span>
                  <span>EPA Standard + Gas Factor</span>
                </div>
                <div className="tech-item">
                  <span>Data Source:</span>
                  <span>sensor_data.csv</span>
                </div>
                <div className="tech-item">
                  <span>Total Records:</span>
                  <span>{historicalData.length}</span>
                </div>
                <div className="tech-item">
                  <span>Current Position:</span>
                  <span>Live Stream</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorData;
