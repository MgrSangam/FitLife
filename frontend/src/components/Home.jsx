import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaDumbbell, 
  FaHeartbeat, 
  FaUtensils, 
  FaTrophy,
  FaGlassWhiskey,
  FaFire,
  FaCalendarAlt,
  FaUsers,
  FaExclamationTriangle,
  FaArrowRight
} from 'react-icons/fa';
import AxiosInstance from './Axiosinstance';
import './Home.css';

const HomePage = () => {
  const [joinedChallenges, setJoinedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJoinedChallenges = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AxiosInstance.get('/api/challenge-participants/');
        setJoinedChallenges(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchJoinedChallenges();
  }, []);

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
          errorMessage = err.response.data?.message || 'Failed to load challenges';
      }
    } else if (err.request) {
      errorMessage = 'Network error: Unable to reach the server';
    }
    
    setError(errorMessage);
    console.error('API Error:', err);
  };

  const getChallengeIcon = (title) => {
    if (title.includes('Push-Up')) return <FaFire className="challenge-icon" />;
    if (title.includes('Hydration')) return <FaGlassWhiskey className="challenge-icon" />;
    return <FaTrophy className="challenge-icon" />;
  };

  const calculateProgress = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    
    return Math.min(100, Math.round((daysPassed / totalDays) * 100));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your challenges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle className="error-icon" />
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
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
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Your journey to a healthier, stronger you starts here</h1>
          <p className="hero-subtext">Join our community and transform your fitness routine</p>
          <div className="hero-buttons">
            <Link to="/goals" className="primary-button">
              Start Your Fitness Journey <FaArrowRight />
            </Link>
            <Link to="/subscriptions" className="secondary-button">
              Set Goals <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="section">
        <h2 className="section-title">
          <FaCalendarAlt /> Your Activities
        </h2>
        <div className="activities-grid">
          {/* Placeholder for activities - you can replace with real data */}
          <div className="activity-card">
            <div className="activity-icon">
              <FaDumbbell />
            </div>
            <div className="activity-info">
              <h3>Today's Workout</h3>
              <p>Upper Body Strength Training</p>
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-icon">
              <FaUtensils />
            </div>
            <div className="activity-info">
              <h3>Meal Plan</h3>
              <p>High Protein Diet</p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Section */}
      <div className="section">
        <h2 className="section-title">
          <FaCalendarAlt /> Your Challenges
        </h2>
        
        {joinedChallenges.length === 0 ? (
          <div className="no-challenges">
            <p>You haven't joined any challenges yet.</p>
            <Link to="/challenges" className="browse-link">
              Browse Challenges <FaArrowRight />
            </Link>
          </div>
        ) : (
          <div className="challenges-grid">
            {joinedChallenges.map(challenge => {
              const progress = calculateProgress(challenge.start_date, challenge.end_date);
              
              return (
                <div key={challenge.id} className="challenge-card">
                  <div className="challenge-header">
                    {getChallengeIcon(challenge.title)}
                    <h3 className="challenge-title">{challenge.title}</h3>
                  </div>
                  
                  <div className="challenge-progress">
                    <div className="progress-text">
                      <span>Day {Math.ceil(progress/100 * challenge.duration)} of {challenge.duration}</span>
                      <span>{progress}% complete</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="challenge-details">
                    <p>{challenge.description || 'Complete daily tasks to finish this challenge'}</p>
                  </div>
                  
                  <Link 
                    to={`/challenge-detail/${challenge.id}`}
                    className="view-details-link"
                  >
                    View Details <FaArrowRight />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;