import { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaCircle, FaDumbbell, FaHeart, FaTrophy } from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import "./Challenge.css";

const Challenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [difficulty, setDifficulty] = useState("all");
  const [muscleGroup, setMuscleGroup] = useState("all");
  const [workoutType, setWorkoutType] = useState("all");
  const [joinMessage, setJoinMessage] = useState(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await AxiosInstance.get("/api/challenges/");
        setChallenges(response.data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };
    fetchChallenges();
  }, []);

  const filteredChallenges = challenges.filter(challenge => {
    const matchDifficulty = difficulty === "all" || challenge.difficulty === difficulty;
    const matchMuscle = muscleGroup === "all" || challenge.muscle_group === muscleGroup;
    const matchType = workoutType === "all" || challenge.workout_type === workoutType;
    return matchDifficulty && matchMuscle && matchType;
  });

  const handleJoinChallenge = async (challengeId) => {
    try {
      // First verify we have a token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setJoinMessage('Please login first');
        return;
      }
  
      console.log('Using token:', token); // Debug log
  
      const response = await AxiosInstance.post(
        '/api/challenge-participants/', 
        { challenge: challengeId }, 
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Challenge joined:', response.data);
      setJoinMessage('Successfully joined the challenge!');
      setTimeout(() => setJoinMessage(null), 3000);
    } catch (error) {
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      setJoinMessage(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Error joining the challenge'
      );
      setTimeout(() => setJoinMessage(null), 3000);
    }
  };
  
  

  const handleAddChallenge = async (newChallenge) => {
    try {
      const response = await AxiosInstance.post('/api/challenges/', newChallenge);
      setChallenges((prevChallenges) => [...prevChallenges, response.data]); // Append new challenge
    } catch (error) {
      console.error("Error adding challenge:", error);
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return <FaArrowDown className="difficulty-icon beginner" />;
      case "intermediate":
        return <FaCircle className="difficulty-icon intermediate" />;
      case "advanced":
        return <FaArrowUp className="difficulty-icon advanced" />;
      default:
        return null;
    }
  };

  return (
    <div className="challenges-container">
      <div className="challenges-content">
        <h1 className="challenges-header">Fitness Challenges</h1>

        {joinMessage && <div className="join-message">{joinMessage}</div>}

        <div className="filters">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="filter-select">
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className="filter-select">
            <option value="all">All Muscle Groups</option>
            <option value="chest">Chest</option>
            <option value="core">Core</option>
            <option value="full-body">Full Body</option>
          </select>

          <select value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} className="filter-select">
            <option value="all">All Types</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>

        <div className="challenges-grid">
  {filteredChallenges.map((challenge) => (
    <div key={challenge.id} className="challenge-card">
      <div className="card-header">
        <div className="card-title">
          <span>{challenge.title}</span>
          {getDifficultyIcon(challenge.difficulty)}
        </div>
        
        {/* Add image here */}
        {challenge.image_url && (
          <img src={challenge.image_url} alt={challenge.title} className="challenge-image" />
        )}

        <p className="card-description">{challenge.description}</p>
      </div>

      <div className="card-content">
        <div className="details-container">
          <div className="detail-item">
            <FaTrophy className="detail-icon" />
            <span className="capitalize">{challenge.difficulty} Level</span>
          </div>
          <div className="detail-item">
            <FaDumbbell className="detail-icon" />
            <span className="capitalize">{challenge.muscle_group}</span>
          </div>
          <div className="detail-item">
            <FaHeart className="detail-icon" />
            <span className="capitalize">{challenge.workout_type}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button
          onClick={() => handleJoinChallenge(challenge.id)}
          className="join-button"
        >
          Join Challenge
        </button>
      </div>
    </div>
  ))}
</div>

      </div>
    </div>
  );
};

export default Challenge;
