import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaDumbbell, 
  FaHeartbeat, 
  FaUtensils, 
  FaChartLine,
  FaTrophy,
  FaGlassWhiskey,
  FaFire,
  FaCalendarAlt,
  FaUsers,
  FaPlus,
  FaExclamationTriangle
} from 'react-icons/fa';
import AxiosInstance from './Axiosinstance';
import './Home.css';
import { MdSubscriptions } from 'react-icons/md';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeChallenges: 0,
    daysRemaining: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch joined challenges (if needed for stats)
        const challengesResponse = await AxiosInstance.get('/api/challenge-participants/');
        const challengesData = Array.isArray(challengesResponse.data) ? 
          challengesResponse.data : [];
        
        // Calculate some basic stats
        if (challengesData.length > 0) {
          setStats({
            activeChallenges: challengesData.length,
            daysRemaining: calculateDaysRemaining(challengesData),
            completionPercentage: calculateCompletion(challengesData)
          });
        }
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateDaysRemaining = (challenges) => {
    return challenges.reduce((acc, challenge) => {
      const endDate = new Date(challenge.end_date);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + (diffDays > 0 ? diffDays : 0);
    }, 0);
  };

  const calculateCompletion = (challenges) => {
    return Math.round(challenges.filter(c => c.completed).length / challenges.length * 100);
  };

  const handleApiError = (err) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (err.response) {
      switch (err.response.status) {
        case 401:
          errorMessage = 'Please log in to view your challenges';
          break;
        case 403:
          errorMessage = 'You dont have permission to view this content';
          break;
        case 404:
          errorMessage = 'Challenges endpoint not found';
          break;
        default:
          errorMessage = err.response.data?.message || 'Failed to load data';
      }
    } else if (err.request) {
      errorMessage = 'Network error: Unable to reach the server';
    }
    
    setError(errorMessage);
    console.error('API Error:', err);
  };

  const renderLoading = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your fitness data...</p>
    </div>
  );

  const renderError = () => (
    <div className="error-container">
      <FaExclamationTriangle className="error-icon" />
      <p className="error-message">{error}</p>
      <div className="error-actions">
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
        {error.includes('log in') && (
          <Link to="/login" className="login-link">
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );

  if (loading) return renderLoading();
  if (error) return renderError();

  return (
    <div className="frontpage-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="dumbbell-icon">
            <FaDumbbell />
          </div>
          <h1>Welcome to FitLife</h1>
          <p className="hero-text">
            Your journey to a healthier, stronger you starts here. Track your progress, 
            join challenges, and transform your fitness routine.
          </p>
          <div className="hero-buttons">
            <Link to="/goals" className="secondary-button">
              <FaTrophy /> Setup Goals
            </Link>
            <Link to="/subscriptions" className="premium-button">
              <MdSubscriptions /> Premium Plan
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Overview - Removed since it's related to challenges */}
      
      {/* Features Section */}
      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaHeartbeat />
            </div>
            <h3>Workout Videos</h3>
            <p>Access hundreds of workout videos for all fitness levels.</p>
            <Link to="/education" className="feature-link">Explore</Link>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaUtensils />
            </div>
            <h3>Nutrition Guidance</h3>
            <p>Personalized meal plans and nutrition advice.</p>
            <Link to="/mealsplan" className="feature-link">Learn More</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;