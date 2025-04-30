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
  const [joinedChallenges, setJoinedChallenges] = useState([]);
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
        
        // Fetch joined challenges
        const challengesResponse = await AxiosInstance.get('/api/challenge-participants/');
        const challengesData = Array.isArray(challengesResponse.data) ? 
          challengesResponse.data : [];
        
        setJoinedChallenges(challengesData);
        
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
    // Implement your logic to calculate days remaining
    return challenges.reduce((acc, challenge) => {
      const endDate = new Date(challenge.end_date);
      const today = new Date();
      const diffTime = endDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + (diffDays > 0 ? diffDays : 0);
    }, 0);
  };

  const calculateCompletion = (challenges) => {
    // Implement your completion percentage logic
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

  const getChallengeIcon = (challenge) => {
    const icons = {
      'Push-Up': <FaFire className="text-red-500" />,
      'Hydration': <FaGlassWhiskey className="text-blue-400" />,
      'Cardio': <FaHeartbeat className="text-green-500" />,
      'Strength': <FaDumbbell className="text-orange-500" />
    };
    
    return icons[challenge.workout_type] || <FaTrophy className="text-yellow-500" />;
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

  const renderChallengeCard = (challenge) => (
    <div key={challenge.id} className="challenge-card">
      <div className="challenge-header">
        <div className="challenge-icon">
          {getChallengeIcon(challenge)}
        </div>
        <h3 className="challenge-title">{challenge.title}</h3>
        <span className={`difficulty-badge ${challenge.difficulty}`}>
          {challenge.difficulty}
        </span>
      </div>
      
      <div className="challenge-details">
        <p>
          <FaCalendarAlt /> {challenge.duration} days
        </p>
        <p>
          <FaUsers /> {challenge.participants || 0} participants
        </p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${challenge.progress || 0}%` }}
          ></div>
        </div>
      </div>
      <Link 
        to={`/challenge-detail/${challenge.id}`} 
        className="view-details-link"
      >
        View Details
      </Link>
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
            <Link to="/subscriptions" className="primary-button">
              <MdSubscriptions /> Premium Plan
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      {joinedChallenges.length > 0 && (
        <div className="stats-section">
          <div className="stat-card">
            <h3>Active Challenges</h3>
            <p className="stat-value">{stats.activeChallenges}</p>
          </div>

        </div>
      )}
      
      {/* Joined Challenges Section */}
      <div className="joined-challenges-section">
        <h2 className="section-title">
          <FaTrophy /> Your Challenges
        </h2>
        
        {joinedChallenges.length === 0 ? (
          <div className="no-challenges">
            <p>You haven't joined any challenges yet.</p>
            <Link to="/challenges" className="browse-link">
              Browse Available Challenges
            </Link>
          </div>
        ) : (
          <div className="challenges-grid">
            {joinedChallenges.map(renderChallengeCard)}
          </div>
        )}
      </div>
      
      {/* Features Section */}
      <div className="features-section">

  
  <div className="features-grid">
    <div className="feature-card">
      <div className="feature-icon">
        <FaHeartbeat />
      </div>
      <h3>Workout Videos</h3>
      <p>Access hundreds of workout videos for all fitness levels.</p>
      <Link to="/workouts" className="feature-link">Explore</Link>
    </div>
    
    <div className="feature-card">
      <div className="feature-icon">
        <FaUtensils />
      </div>
      <h3>Nutrition Guidance</h3>
      <p>Personalized meal plans and nutrition advice.</p>
      <Link to="/nutrition" className="feature-link">Learn More</Link>
    </div>
    
  </div>
</div>
    </div>
  );
};

export default HomePage;