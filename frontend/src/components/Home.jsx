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
  FaCalendarAlt
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
        // First get the user's participations
        const participationsResponse = await AxiosInstance.get('/api/challenge-participants/');
        
        // Then fetch details for each challenge
        const challengesData = await Promise.all(
          participationsResponse.data.map(participation => 
            AxiosInstance.get(`/api/challenges/${participation.challenge}/`)
          )
        );
        
        // Combine participation data with challenge details
        const challengesWithProgress = challengesData.map((res, index) => {
          const challenge = res.data;
          const participation = participationsResponse.data[index];
          const startDate = new Date(challenge.start_date);
          const endDate = new Date(challenge.end_date);
          const today = new Date();
          
          // Calculate progress percentage
          const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
          const progress = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
          
          return {
            ...challenge,
            join_id: participation.id,
            date_joined: participation.date_joined,
            progress,
            current_day: daysPassed + 1, // Adding 1 to make it 1-based
            total_days: totalDays
          };
        });
        
        setJoinedChallenges(challengesWithProgress);
      } catch (err) {
        setError("Failed to load your challenges");
        console.error("Error fetching challenges:", err);
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
          <FaDumbbell />
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
      
      {/* Joined Challenges Section */}
      <div className="joined-challenges-section">
        <h2 className="section-title">
          <FaTrophy /> Your Challenges
        </h2>
        
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
                    <FaCalendarAlt /> Day {challenge.current_day} of {challenge.total_days}
                  </p>
                  {challenge.title.includes('Push-Up') && (
                    <p>{challenge.current_day * 2} push-ups today</p>
                  )}
                  {challenge.title.includes('Hydration') && (
                    <p>{challenge.current_day} glasses of water per day</p>
                  )}
                </div>
                
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${challenge.progress}%` }}></div>
                </div>
                <p className="progress-text">{challenge.progress}% complete</p>
                
                <Link 
                  to={`/challenge-detail/${challenge.id}`} 
                  className="view-details-button"
                >
                  View Details
                </Link>
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
          <h3>Personalized Workouts</h3>
          <p>Access workout plans tailored to your fitness level, goals, and preferences.</p>
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
            <FaChartLine />
          </div>
          <h3>Progress Tracking</h3>
          <p>Track your workouts, measurements, and achievements to stay motivated.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;              
