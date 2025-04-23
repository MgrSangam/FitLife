import { useState, useEffect } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaCircle,
  FaDumbbell,
  FaHeart,
  FaTrophy,
} from "react-icons/fa";
import AxiosInstance from "./AxiosInstance";
import "./Challenge.css";
import { useNavigate } from "react-router-dom"; 

const Challenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [difficulty, setDifficulty] = useState("all");
  const [muscleGroup, setMuscleGroup] = useState("all");
  const [workoutType, setWorkoutType] = useState("all");
  const [joinMessage, setJoinMessage] = useState(null);
  const [joiningId, setJoiningId] = useState(null);

  const navigate = useNavigate();

  // Fetch all challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/challenges/");
        setChallenges(data);
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };
    fetchChallenges();
  }, []);

  // Fetch joined challenges (IDs)
  useEffect(() => {
    const fetchJoined = async () => {
      try {
        const { data } = await AxiosInstance.get(
          "/api/challenge-participants/"
        );
        setJoinedIds(data.map((p) => p.challenge));
      } catch (error) {
        if (error.response?.status === 401) {
          setJoinedIds([]);
        } else {
          console.error("Error fetching joined challenges:", error);
        }
      }
    };
    fetchJoined();
  }, []);

  const filteredChallenges = challenges.filter((challenge) => {
    const matchDifficulty =
      difficulty === "all" || challenge.difficulty === difficulty;
    const matchMuscle =
      muscleGroup === "all" || challenge.muscle_group === muscleGroup;
    const matchType =
      workoutType === "all" || challenge.workout_type === workoutType;
    return matchDifficulty && matchMuscle && matchType;
  });

  const handleJoinChallenge = async (challengeId) => {
    try {
      setJoiningId(challengeId);
      const { data } = await AxiosInstance.post(
        "/api/challenge-participants/",
        { challenge: challengeId }
      );
      setJoinMessage("Successfully joined the challenge!");
      setJoinedIds((prev) => [...prev, challengeId]);
    } catch (error) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setJoinMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Error joining the challenge"
      );
    } finally {
      setJoiningId(null);
      setTimeout(() => setJoinMessage(null), 3000);
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return <FaArrowDown className="difficulty-icon beginner" />;
      case "intermediate":
        return <FaCircle className="difficulty-icon intermediate" />;
      case "advance":
        return <FaArrowUp className="difficulty-icon advance" />;
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
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advance">Advance</option>
          </select>

          <select
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Muscle Groups</option>
            <option value="chest">Chest</option>
            <option value="core">Core</option>
            <option value="full-body">Full Body</option>
          </select>

          <select
            value={workoutType}
            onChange={(e) => setWorkoutType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
          </select>
        </div>

        <div className="challenges-grid">
          {filteredChallenges.map((challenge) => {
            const alreadyJoined = joinedIds.includes(challenge.id);
            return (
              <div
                key={challenge.id}
                className="challenge-card"
                onClick={() => navigate(`/challenge-detail/${challenge.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-header">
                  <div className="card-title">
                    <span>{challenge.title}</span>
                    {getDifficultyIcon(challenge.difficulty)}
                  </div>
                  {challenge.image_url && (
                    <img
                      src={challenge.image_url}
                      alt={challenge.title}
                      className="challenge-image"
                    />
                  )}
                  <p className="card-description">{challenge.description}</p>
                </div>

                <div className="card-content">
                  <div className="details-container">
                  <div className="details-container">
                    <div className="detail-item">
                      <FaTrophy className="detail-icon" />
                      <span className="capitalize">
                        {challenge.difficulty} Level
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaDumbbell className="detail-icon" />
                      <span className="capitalize">
                        {challenge.muscle_group}
                      </span>
                    </div>
                    <div className="detail-item">
                      <FaHeart className="detail-icon" />
                      <span className="capitalize">
                        {challenge.workout_type}
                      </span>
                    </div>
                  </div>
                  </div>
                </div>

                <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleJoinChallenge(challenge.id)}
                    className="join-button"
                    disabled={alreadyJoined || joiningId === challenge.id}
                    aria-disabled={alreadyJoined || joiningId === challenge.id}
                  >
                    {alreadyJoined
                      ? "Joined"
                      : joiningId === challenge.id
                      ? "Joining..."
                      : "Join Challenge"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Challenge;
