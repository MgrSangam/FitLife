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
  FaUsers
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
        const response = await AxiosInstance.get('/api/challenge-participants/');
        // Ensure response.data is an array
        setJoinedChallenges(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (err.response) {
          // Server responded with a status other than 2xx
          if (err.response.status === 401) {
            setError('Please log in to view your challenges');
          } else if (err.response.status === 404) {
            setError('Challenges endpoint not found');
          } else {
            setError('Failed to load challenges');
          }
        } else if (err.request) {
          // No response received (e.g., network error)
          setError('Network error: Unable to reach the server');
        } else {
          // Other errors
          setError('An unexpected error occurred');
        }
        console.error('Error fetching challenges:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchJoinedChallenges();
  }, []);

  const getChallengeIcon = (title) => {
    if (title.includes('Push-Up')) return <FaFire className="text-red-500" />;
    if (title.includes('Hydration')) return <FaGlassWhiskey className="text-blue-400" />;
    return <FaTrophy className="text-yellow-500" />;
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
        <p className="error-message">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="frontpage-container">
      <div className="hero-section">
        <div className="dumbbell-icon">
          <FaDumbbell style={{ color: 'white' }} />
        </div>
        <h1>Welcome to FitLife</h1>
        <p className="hero-text">
          Your journey to a healthier, stronger you starts here. Join our community and transform your fitness routine.
        </p>
  
        <div className="hero-buttons">
          <Link to="/goals" className="secondary-button">
            <FaTrophy /> Setup Goals
          </Link>
          <Link to="/subscriptions" className="premium-button">
            <FaTrophy /> Premium Plans
          </Link>
        </div>
      </div>
      
      
      <div className="joined-challenges-section">
  <h2 className="section-title">
    <FaTrophy /> Active Challenges
  </h2>
  
  {/* Add the conditional rendering here */}
  {joinedChallenges.length === 0 ? (
    <div className="no-challenges">
      <p>You haven't joined any challenges yet.</p>
      <Link to="/challenges" className="browse-link">
        Browse Challenges
      </Link>
    </div>
  ) : (
    <div className="challenges-grid">
      {joinedChallenges.map(challenge => (
        <div key={challenge.id} className="challenge-card">
          <div className="challenge-header">
            <div className="challenge-icon">
              {getChallengeIcon(challenge.title)}
            </div>
            <h3 className="challenge-title">{challenge.title}</h3>
          </div>
          
          <div className="challenge-details">
            <p>
              <FaCalendarAlt /> {challenge.duration} days
            </p>
            <p>
              <FaUsers /> {challenge.participants} participants
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
      {/* Features Section */}
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">
            <FaHeartbeat />
          </div>
          <h3>Workout Videos</h3>
          <p>Access workout vidoes to enhance your knowledge.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <FaUtensils />
          </div>
          <h3>Nutrition Guidance</h3>
          <p>Get meal plans and nutrition advice to complement your fitness routine.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">
            <FaTrophy />
          </div>
          <h3>Challenges</h3>
          <p>Participate in Challenges to Test Your Self</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;