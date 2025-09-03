import React, { useState, useRef } from 'react';
import { Upload, Camera, Image, CheckCircle, AlertTriangle, RefreshCw, Download, Share2 } from 'lucide-react';
import './AirQuality.css';

const classStatusMap = {
  "Good": "good",
  "Moderate": "moderate",
  "Severe": "severe",
  "Unhealthy for Sensitive Groups": "unhealthy for sensitive groups",
  "Unhealthy": "unhealthy",
  "Very Unhealthy": "very unhealthy",
};

const AirQuality = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setAnalysisResult(null);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // analyzeImage function - only uses real model predictions
  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API not available (${response.status})`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Use actual backend response
      const predictedClass = data.predicted_class;
      const result = {
        quality: predictedClass,
        confidence: Math.round(data.confidence * 100),
        timestamp: new Date()
      };

      setAnalysisResult(result);

    } catch (error) {
      console.error("Analysis failed:", error);
      alert(`Analysis failed: ${error.message}. Please ensure the server is running and try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendationsByQuality = (quality) => {
    switch (quality) {
      case "Good":
        return [
          "Great air quality! Perfect for outdoor activities.",
          "Ideal conditions for exercise and sports.",
          "Safe for all age groups including children and elderly."
        ];
      case "Moderate":
        return [
          "Air quality is acceptable for most people.",
          "Sensitive individuals should consider limiting prolonged outdoor activities.",
          "Generally safe for outdoor activities."
        ];
      case "Severe":
      case "Unhealthy for Sensitive Groups":
        return [
          "Sensitive groups should avoid prolonged outdoor activities.",
          "Consider wearing masks when going outside.",
          "Keep windows closed and use air purifiers indoors."
        ];
      case "Unhealthy":
      case "Very Unhealthy":
        return [
          "Avoid all outdoor activities.",
          "Stay indoors with air purifiers running.",
          "Wear N95 or P100 masks if you must go outside.",
          "Seek medical attention if experiencing breathing difficulties."
        ];
      default:
        return ["Monitor air quality regularly and follow local guidelines."];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="status-icon good" />;
      case 'moderate':
        return <AlertTriangle className="status-icon moderate" />;
      case 'severe':
        return <AlertTriangle className="status-icon severe" />;  
      case 'unhealthy for sensitive groups':
        return <AlertTriangle className="status-icon unhealthy-sensitive" />;
      case 'unhealthy':
        return <AlertTriangle className="status-icon unhealthy" />;
      case 'very unhealthy':
        return <AlertTriangle className="status-icon very-unhealthy" />;  
      default:
        return <AlertTriangle className="status-icon" />;
    }
  };

  const getStatusColor = (quality) => {
  switch (quality) {
    case "Good":
      return "#22c55e";               // Green
    case "Moderate":
      return "#facc15";               // Yellow
    case "Severe":
      return "#f97316";               // Orange
    case "Unhealthy for Sensitive Groups":
      return "#ef4444";               // Red
    case "Unhealthy":
      return "#b91c1c";               // Dark Red
    case "Very Unhealthy":
      return "#7e1b1b";               // Very Dark Red
    default:
      return "#6b7280";               // Gray for unknown
  }
};

  const resetAnalysis = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="air-quality-container">
      <div className="page-header">
        <h1>Air Quality Analysis</h1>
        <p>Upload an image from your area to get instant air quality assessment powered by AI</p>
      </div>

      <div className="analysis-content">
        <div className="upload-section">
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />

            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Selected" className="preview-image" />
                <div className="image-overlay">
                  <button className="change-image-btn" onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}>
                    <Camera size={20} />
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">
                  <Upload size={48} />
                </div>
                <h3>Drop your image here</h3>
                <p>or click to browse from your device</p>
                <div className="supported-formats">
                  <span>Supports: JPG, PNG, WEBP</span>
                </div>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="file-info">
              <div className="file-details">
                <Image className="file-icon" />
                <div>
                  <div className="file-name">{selectedFile.name}</div>
                  <div className="file-size">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <div className="upload-actions">
                <button 
                  className="analyze-btn"
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="spinning" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Analyze Image
                    </>
                  )}
                </button>
                <button className="reset-btn" onClick={resetAnalysis}>
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {analysisResult && (
          <div className="results-section">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <div className="results-actions">
                <button className="action-btn">
                  <Download size={18} />
                  Download Report
                </button>
                <button className="action-btn">
                  <Share2 size={18} />
                  Share Results
                </button>
              </div>
            </div>

            <div className="prediction-result">
              <div className="prediction-card">
                <div className="prediction-header">
                  <h3>🌍 Air Quality Prediction</h3>
                </div>
                <div className="prediction-content">
                  <div className="prediction-class" style={{ color: getStatusColor(analysisResult.quality) }}>
                    {analysisResult.quality}
                  </div>
                  <div className="prediction-confidence">
                    Confidence: {analysisResult.confidence}%
                  </div>
                  <div className="prediction-timestamp">
                    Analyzed at: {analysisResult.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="info-section">
          <h2>How It Works</h2>
          <div className="info-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Upload Image</h4>
                <p>Take a photo of your surroundings or upload an existing image</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>AI Analysis</h4>
                <p>Our AI analyzes visual indicators of air quality in your image</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Get Results</h4>
                <p>Receive detailed air quality metrics and health recommendations</p>
              </div>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h4>🌍 Global Coverage</h4>
              <p>Our AI model is trained on data from around the world to provide accurate results for any location.</p>
            </div>
            <div className="info-card">
              <h4>⚡ Instant Results</h4>
              <p>Get air quality analysis in seconds with detailed breakdowns of all major pollutants.</p>
            </div>
            <div className="info-card">
              <h4>🎯 High Accuracy</h4>
              <p>Our machine learning models achieve 90%+ accuracy in air quality assessments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;
