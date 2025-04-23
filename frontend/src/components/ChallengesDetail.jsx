import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaArrowUp,
  FaArrowDown,
  FaCircle,
  FaDumbbell,
  FaHeart,
  FaCalendarAlt,
} from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import "./ChallengesDetail.css";

const ChallengeDetail = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [joined, setJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState(null);
  const [joining, setJoining] = useState(false);

  // Fetch challenge details
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await AxiosInstance.get(`/api/challenges/${id}/`);
        setChallenge(data);
      } catch (err) {
        console.error("Error fetching challenge details:", err);
      }
    };
    fetchDetail();
  }, [id]);

  // Check if already joined
  useEffect(() => {
    const fetchJoined = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/challenge-participants/");
        const hasJoined = data.some((p) => p.challenge === Number(id));
        setJoined(hasJoined);
      } catch (err) {
        console.error("Error checking join status:", err);
      }
    };
    fetchJoined();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await AxiosInstance.post("/api/challenge-participants/", { challenge: id });
      setJoined(true);
      setJoinMessage("You have joined this challenge!");
    } catch (err) {
      console.error("Error joining challenge:", err.response || err);
      setJoinMessage(err.response?.data?.detail || "Could not join");
    } finally {
      setJoining(false);
      setTimeout(() => setJoinMessage(null), 3000);
    }
  };

  const getDifficultyIcon = (diff) => {
    switch (diff) {
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

  if (!challenge) {
    return <div className="loading">Loading challenge details...</div>;
  }

  return (
    <div className="challenge-detail-container">
      <Link to="/challenges" className="back-link">
        &larr; Back to Challenges
      </Link>

      <div className="challenge-detail">
        <h2 className="detail-title">{challenge.title}</h2>

        {challenge.image_url && (
          <img
            src={challenge.image_url}
            alt={challenge.title}
            className="detail-image"
          />
        )}

        <div className="detail-meta">
          {getDifficultyIcon(challenge.difficulty)}
          <span className="meta-item capitalize">{challenge.difficulty}</span>
          <span className="meta-item capitalize">
            <FaDumbbell /> {challenge.muscle_group}
          </span>
          <span className="meta-item capitalize">
            <FaHeart /> {challenge.workout_type}
          </span>
          <span className="meta-item">
            <FaCalendarAlt /> {challenge.duration}
          </span>
          <span className="meta-item">
            Start: {new Date(challenge.start_date).toLocaleDateString()}
          </span>
          <span className="meta-item">
            End: {new Date(challenge.end_date).toLocaleDateString()}
          </span>
        </div>

        <p className="detail-description">{challenge.description}</p>

        {joinMessage && <div className="join-message">{joinMessage}</div>}

        <button
          className="join-button-detail"
          onClick={handleJoin}
          disabled={joined || joining}
          aria-disabled={joined || joining}
        >
          {joined ? "Joined" : joining ? "Joining..." : "Join Challenge"}
        </button>
      </div>
    </div>
  );
};

export default ChallengeDetail;
