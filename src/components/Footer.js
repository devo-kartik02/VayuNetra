import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <Leaf className="footer-logo-icon" />
              <span>VayuNetra</span>
            </div>
            <p className="footer-description">
              Empowering communities to make data-driven decisions about air quality 
              and environmental health. Together, we're building a cleaner, greener future.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="social-link" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/air-quality">Air Quality Check</Link></li>
              <li><Link to="/sensor-data">Sensor Data</Link></li>
              <li><Link to="/plant-store">Plant Store</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3 className="footer-title">Services</h3>
            <ul className="footer-links">
              <li><a href="#chatbot">Environmental Chatbot</a></li>
              <li><a href="#analysis">Air Quality Analysis</a></li>
              <li><a href="#monitoring">Real-time Monitoring</a></li>
              <li><a href="#plants">Eco-friendly Plants</a></li>
              <li><a href="#consultation">Environmental Consultation</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={16} />
                <span>info@vayunetra.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} />
                <span>+91 1800 1800</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} />
                <span>22 Green Street, Nagpur, NG 3425</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="newsletter-section">
          <h3>Stay Updated</h3>
          <p>Get the latest environmental news and air quality updates.</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="newsletter-input"
            />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; 2024 VayuNetra. All rights reserved.</p>
          </div>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
