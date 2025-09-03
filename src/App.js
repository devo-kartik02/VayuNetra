import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AirQuality from './pages/AirQuality';
import SensorData from './pages/SensorData';
import PlantStore from './pages/PlantStore';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/air-quality" element={<AirQuality />} />
            <Route path="/sensor-data" element={<SensorData />} />
            <Route path="/plant-store" element={<PlantStore />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
