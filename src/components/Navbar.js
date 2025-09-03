import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Leaf, BarChart3, Upload, Home, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Check for user authentication on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        setIsLoggedIn(true);
        setCurrentUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    
    checkAuthStatus();
    
    // Listen for storage changes and custom login events
    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('userLogin', checkAuthStatus);
    window.addEventListener('userLogout', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('userLogin', checkAuthStatus);
      window.removeEventListener('userLogout', checkAuthStatus);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Update state
    setIsLoggedIn(false);
    setCurrentUser(null);
    
    // Trigger storage event for other components to detect logout
    window.dispatchEvent(new Event('storage'));
    
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Leaf className="logo-icon" />
          <span>VayuNetra</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            <Home size={18} />
            Home
          </Link>
          <Link to="/air-quality" className="navbar-link">
            <Upload size={18} />
            Air Quality Check
          </Link>
          <Link to="/sensor-data" className="navbar-link">
            <BarChart3 size={18} />
            Sensor Data
          </Link>
          <Link to="/plant-store" className="navbar-link">
            <Leaf size={18} />
            Plant Store
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="navbar-auth">
          {isLoggedIn ? (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-avatar">
                  <User size={18} />
                </div>
                <div className="user-details">
                  <span className="user-name">
                    {currentUser?.name || currentUser?.email?.split('@')[0] || 'User'}
                  </span>
                  <span className="user-role">Member</span>
                </div>
              </div>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-link">
                  <User size={16} />
                  Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-link logout-btn">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <Home size={18} />
            Home
          </Link>
          <Link to="/air-quality" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <Upload size={18} />
            Air Quality Check
          </Link>
          <Link to="/sensor-data" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <BarChart3 size={18} />
            Sensor Data
          </Link>
          <Link to="/plant-store" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            <Leaf size={18} />
            Plant Store
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                <User size={18} />
                Profile
              </Link>
              <button onClick={handleLogout} className="mobile-link logout-mobile">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
