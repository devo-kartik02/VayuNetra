import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wind, Leaf, BarChart3, Upload, ShoppingCart, Users, User, Activity } from 'lucide-react';
import Chatbot from '../components/Chatbot';
import './Home.css';

const Home = () => {
  const [liveAirData, setLiveAirData] = useState({
    aqi: 42,
    status: 'Good',
    pm25: 12,
    gasLevel: 145,
    lastUpdate: new Date()
  });

  // Simulate real-time data updates
  useEffect(() => {
    const updateLiveData = () => {
      const newPM25 = Math.max(5, Math.round(
        15 + Math.sin(Date.now() / 10000) * 8 + Math.random() * 4
      ));
      const newGasLevel = Math.max(100, Math.round(
        140 + Math.cos(Date.now() / 8000) * 15 + Math.random() * 10
      ));
      
      // Calculate AQI based on PM2.5
      let aqi = 0;
      let status = 'Good';
      
      if (newPM25 <= 12) {
        aqi = Math.round((50 / 12) * newPM25);
        status = 'Good';
      } else if (newPM25 <= 35.4) {
        aqi = Math.round(50 + ((100 - 50) / (35.4 - 12.1)) * (newPM25 - 12.1));
        status = 'Moderate';
      } else {
        aqi = Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (newPM25 - 35.5));
        status = 'Unhealthy';
      }
      
      // Adjust for gas levels
      if (newGasLevel > 200) {
        aqi += 10;
        if (aqi > 50) status = 'Moderate';
      }
      
      setLiveAirData({
        aqi: Math.min(aqi, 200),
        status,
        pm25: newPM25,
        gasLevel: newGasLevel,
        lastUpdate: new Date()
      });
    };
    
    // Update immediately
    updateLiveData();
    
    // Update every 30 seconds
    const interval = setInterval(updateLiveData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fix infinite re-render by removing dependency on liveAirData

  const features = [
    {
      icon: Upload,
      title: 'Air Quality Analysis',
      description: 'Upload images to get instant air quality assessments powered by AI technology.',
      link: '/air-quality',
      color: '#3b82f6'
    },
    {
      icon: BarChart3,
      title: 'Real-time Monitoring',
      description: 'Access live sensor data and environmental predictions for your area.',
      link: '/sensor-data',
      color: '#22c55e'
    },
    {
      icon: Leaf,
      title: 'Plant Store',
      description: 'Buy eco-friendly plants that improve air quality and contribute to the environment.',
      link: '/plant-store',
      color: '#16a34a'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Active Users', icon: Users },
    { number: '1M+', label: 'Air Quality Checks', icon: Wind },
    { number: '25K+', label: 'Plants Sold', icon: Leaf },
    { number: '99%', label: 'Data Accuracy', icon: BarChart3 }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Monitor Air Quality,
              <span className="title-highlight"> Protect Our Future</span>
            </h1>
            <p className="hero-description">
              Envra empowers communities with real-time air quality monitoring, 
              AI-powered analysis, and sustainable solutions. Join thousands 
              making a difference in environmental health.
            </p>
            <div className="hero-actions">
              <Link to="/air-quality" className="cta-primary">
                <Upload size={20} />
                Check Air Quality
              </Link>
              <Link to="/sensor-data" className="cta-secondary">
                <BarChart3 size={20} />
                View Data Dashboard
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card">
              <div className="card-header">
                <Wind className="card-icon" />
                <span>Live Air Quality</span>
                <div className="live-indicator">
                  <Activity size={14} />
                  <span>LIVE</span>
                </div>
              </div>
              <div className="aqi-display">
                <div className="aqi-number" style={{ 
                  color: liveAirData.status === 'Good' ? '#22c55e' : 
                         liveAirData.status === 'Moderate' ? '#f59e0b' : '#ef4444'
                }}>
                  {liveAirData.aqi}
                </div>
                <div className="aqi-label">{liveAirData.status}</div>
              </div>
              <div className="aqi-details">
                <div className="detail-item">
                  <span>PM2.5</span>
                  <span>{liveAirData.pm25.toFixed(1)} μg/m³</span>
                </div>
                <div className="detail-item">
                  <span>Gas Level</span>
                  <span>{liveAirData.gasLevel} ppm</span>
                </div>
                <div className="detail-item">
                  <span>Updated</span>
                  <span>{liveAirData.lastUpdate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Comprehensive Environmental Solutions</h2>
            <p>Everything you need to monitor, analyze, and improve air quality</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <Link key={index} to={feature.link} className="feature-card">
                <div className="feature-icon" style={{ backgroundColor: `${feature.color}20`, color: feature.color }}>
                  <feature.icon size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-arrow">
                  <span>Learn More</span>
                  <div className="arrow">→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Making a Global Impact</h2>
            <p>Join our growing community of environmental advocates</p>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">
                  <stat.icon size={32} />
                </div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Ready to Make a Difference?</h2>
              <p>
                Start monitoring air quality in your area and join thousands of users 
                contributing to environmental awareness and action.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/register" className="cta-btn primary">
                <User size={20} />
                Get Started Free
              </Link>
              <Link to="/plant-store" className="cta-btn secondary">
                <ShoppingCart size={20} />
                Shop Plants
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Home;
