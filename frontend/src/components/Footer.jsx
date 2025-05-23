import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import '../CSS/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section with Services and Join Us */}
        <div className="footer-section footer-brand">
          <h3 className="footer-heading">Customer Care</h3>
          <ul className="footer-list">
            <li>Help Center</li>
          </ul>
          <h3 className="footer-heading">Join Us</h3>
          <ul className="footer-list">
            <li>Become Instuctor</li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-section footer-contact">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="footer-list">
            <li>
              <FaEnvelope className="footer-icon" />
              <a href="mailto:fitlife256@gmail.com">fitlife256@gmail.com</a>
            </li>
            <li>
              <FaPhone className="footer-icon" />
              <a href="tel:+9779804567389">+977 9804567389</a>
            </li>
            <li>
              <FaMapMarkerAlt className="footer-icon" />
              Pokhara, Gandaki Province, Nepal
            </li>
          </ul>
        </div>

        {/* Follow Us */}
        <div className="footer-section footer-social">
          <h3 className="footer-heading">Follow Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF className="social-icon" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter className="social-icon" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram className="social-icon" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube className="social-icon" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FitLife. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;