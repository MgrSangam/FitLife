import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaArrowUp,
  FaArrowDown,
  FaCircle,
  FaDumbbell,
  FaHeart,
  FaCalendarAlt,
  FaDownload,
} from "react-icons/fa";
import AxiosInstance from "../../components/Axiosinstance";
import "../../CSS/ChallengesDetail.css";

const ChallengeDetail = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [joined, setJoined] = useState(false);
  const [joinMessage, setJoinMessage] = useState(null);
  const [joining, setJoining] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [progress, setProgress] = useState([]);
  const [tickMessage, setTickMessage] = useState(null);

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

  // Check if already joined or enrolled in any challenge and fetch progress
  useEffect(() => {
    const fetchJoined = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/challenge-participants/");
        const participant = data.find((p) => Number(p.challenge.id) === Number(id));
        setJoined(!!participant);
        setAlreadyEnrolled(data.length > 0);
        setProgress(participant ? participant.progress : []);
      } catch (err) {
        console.error("Error checking join status:", err);
      }
    };
    fetchJoined();
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await AxiosInstance.post("/api/challenge-participants/", { challenge_id: id });
      setJoined(true);
      setAlreadyEnrolled(true);
      setJoinMessage("You have joined this challenge!");
      // Fetch updated progress after joining
      const { data } = await AxiosInstance.get("/api/challenge-participants/");
      const participant = data.find((p) => Number(p.challenge.id) === Number(id));
      setProgress(participant ? participant.progress : []);
    } catch (err) {
      console.error("Error joining challenge:", err.response || err);
      setJoinMessage(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Could not join"
      );
    } finally {
      setJoining(false);
      setTimeout(() => setJoinMessage(null), 3000);
    }
  };

  const handleTickDay = async (day) => {
    try {
      // Fetch the current participant data
      const { data: participants } = await AxiosInstance.get("/api/challenge-participants/");
      console.log("Participants data:", participants); // Debug log
      const participant = participants.find((p) => Number(p.challenge.id) === Number(id));
      console.log("Found participant:", participant); // Debug log
      if (!participant) {
        setTickMessage("You must join the challenge before ticking days.");
        setTimeout(() => setTickMessage(null), 3000);
        return;
      }

      const participantId = participant.participate_id; // Revert to 'participate_id'
      console.log("Participant ID:", participantId); // Debug log
      if (!participantId) {
        setTickMessage("Invalid participant data. Please try again.");
        setTimeout(() => setTickMessage(null), 3000);
        return;
      }

      const { data } = await AxiosInstance.post(
        `/api/challenge-participants/${participantId}/tick-day/`,
        { day }
      );
      setProgress(data.progress);
      setTickMessage(`Day ${day} ticked successfully!`);
    } catch (err) {
      console.error("Error ticking day:", err.response || err);
      setTickMessage(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Could not tick day"
      );
    } finally {
      setTimeout(() => setTickMessage(null), 3000);
    }
  };

  const handleDownloadImage = async () => {
    if (!challenge?.image_url) return;
    
    setDownloading(true);
    try {
      const response = await fetch(challenge.image_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = `challenge-${challenge.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      link.download = fileName;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      const fallbackLink = document.createElement('a');
      fallbackLink.href = challenge.image_url;
      fallbackLink.download = `challenge-${challenge.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    } finally {
      setDownloading(false);
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

  const totalDays = 30;
  const progressBoxes = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="challenge-detail-container">
      <Link to="/challenges" className="back-link">
        ← Back to Challenges
      </Link>

      <div className="challenge-detail">
        <h2 className="detail-title">{challenge.title}</h2>

        {challenge.image_url && (
          <div className="image-container">
            <img
              src={challenge.image_url}
              alt={challenge.title}
              className="detail-image"
            />
            <button 
              onClick={handleDownloadImage}
              className="download-button"
              title="Download image"
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : <FaDownload />}
            </button>
          </div>
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
          disabled={joined || joining || alreadyEnrolled}
          aria-disabled={joined || joining || alreadyEnrolled}
        >
          {joined
            ? "Joined"
            : joining
            ? "Joining..."
            : alreadyEnrolled
            ? "Already in a Challenge"
            : "Join Challenge"}
        </button>

        {joined && (
          <div className="progress-tracker">
            <h3>Progress Tracking</h3>
            <div className="progress-boxes">
              {progressBoxes.map((day) => (
                <button
                  key={day}
                  className={`progress-box ${progress.includes(day) ? 'ticked' : ''}`}
                  onClick={() => handleTickDay(day)}
                  disabled={progress.includes(day)}
                >
                  {day}
                </button>
              ))}
            </div>
            {tickMessage && <div className="tick-message">{tickMessage}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetail;