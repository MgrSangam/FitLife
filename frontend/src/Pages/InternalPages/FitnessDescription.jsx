import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AxiosInstance from "../../components/Axiosinstance";
import {
  FaDumbbell,
  FaCalendarAlt,
  FaClock,
  FaHeartbeat,
  FaFire,
  FaRunning,
  FaWeightHanging,
  FaDownload,
} from "react-icons/fa";
import "../../CSS/FitnessPlanDetail.css";

const FitnessPlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState("monday");
  const [downloading, setDownloading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [planResponse, joinedResponse] = await Promise.all([
          AxiosInstance.get(`/api/fitness-plans/${id}/`),
          AxiosInstance.get("/api/fitness-plan-users/")
        ]);
        console.log("Plan Response:", planResponse.data);
        console.log("Joined Response:", joinedResponse.data);
        setPlan(planResponse.data);
        const joinedPlanIds = joinedResponse.data.map(item => item.fitness_plan);
        setIsJoined(joinedPlanIds.includes(parseInt(id)));
      } catch (err) {
        const errorMessage = err.response
          ? `API Error: ${err.response.status} - ${err.response.data?.detail || "No detail provided"}`
          : `Network Error: ${err.message}`;
        console.error("Error fetching plan details:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleJoinPlan = async () => {
    try {
      const response = await AxiosInstance.post("/api/fitness-plan-users/", { fitness_plan: id });
      console.log("Join Plan Response:", response.data);
      setIsJoined(true);
      alert("Successfully joined the fitness plan!");
    } catch (error) {
      const errorMessage = error.response
        ? `Join Error: ${error.response.status} - ${error.response.data?.detail || "No detail provided"}`
        : `Network Error: ${error.message}`;
      console.error("Error joining plan:", errorMessage);
      alert(`Failed to join the plan: ${errorMessage}`);
    }
  };

  const getPlanTypeIcon = (type) => {
    switch (type) {
      case "weight_loss":
        return <FaFire className="icon weight-loss" />;
      case "muscle_gain":
        return <FaWeightHanging className="icon muscle-gain" />;
      case "endurance":
        return <FaRunning className="icon endurance" />;
      default:
        return <FaDumbbell className="icon default" />;
    }
  };

  const getDayDisplayName = (day) => {
    const days = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    };
    return days[day] || day;
  };

  const handleDownloadImage = async (imageUrl, imageName) => {
    if (!imageUrl) return;
    
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const fileName = `fitness-${imageName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      link.download = fileName;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error.message);
      const fallbackLink = document.createElement('a');
      fallbackLink.href = imageUrl;
      fallbackLink.download = `fitness-${imageName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="loading">Loading plan details, please wait...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!plan) return <div className="error">No plan found for ID: {id}</div>;

  const exercisesByDay = plan.exercises?.reduce((acc, exercise) => {
    const day = exercise.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(exercise);
    return acc;
  }, {}) || {};

  const daysWithExercises = Object.keys(exercisesByDay).filter(
    day => exercisesByDay[day]?.length > 0
  );

  return (
    <div className="fitness-plan-container">
      <Link to="/fitnessplan" className="back-link">
        ← Back to Fitness Plans
      </Link>

      <div className="fitness-plan-detail">
        <div className="detail-header">
          <h2 className="detail-title">{plan.name}</h2>
        </div>

        {plan.picture && (
          <div className="image-container">
            <img
              src={plan.picture}
              alt={plan.name}
              className="detail-image"
            />
            <button 
              onClick={() => handleDownloadImage(plan.picture, plan.name)}
              className="download-button"
              title="Download image"
              disabled={downloading}
            >
              {downloading ? '...' : <FaDownload />}
            </button>
          </div>
        )}

        <div className="detail-meta">
          <span className="meta-item">
            {getPlanTypeIcon(plan.plan_type)}
            <span className="capitalize">{plan.plan_type_display}</span>
          </span>
          <span className="meta-item">
            <FaCalendarAlt /> {plan.duration_weeks} weeks
          </span>
          <span className="meta-item">
            <FaHeartbeat /> {plan.difficulty_display}
          </span>
        </div>

        <div className="detail-section">
          <h3>About This Plan</h3>
          <p className="detail-description">
            {plan.description || "No description provided."}
          </p>
          <button
            className={`join-button ${isJoined ? 'joined' : ''}`}
            onClick={handleJoinPlan}
            disabled={isJoined}
          >
            {isJoined ? 'Joined' : 'Join Plan'}
          </button>
        </div>

        <div className="detail-section">
          <h3>Workout Schedule</h3>
          
          {daysWithExercises.length > 0 ? (
            <>
              <div className="day-tabs">
                {daysWithExercises.map(day => (
                  <button
                    key={day}
                    className={`day-tab ${activeDay === day ? "active" : ""}`}
                    onClick={() => setActiveDay(day)}
                  >
                    {getDayDisplayName(day)}
                  </button>
                ))}
              </div>

              <div className="exercises-container">
                {exercisesByDay[activeDay]?.map(exercise => (
                  <div key={exercise.id} className="exercise-card">
                    <div className="exercise-header">
                      <h4>{exercise.exercise?.name}</h4>
                      {exercise.exercise?.image_url && (
                        <div className="image-container">
                          <img
                            src={exercise.exercise.image_url}
                            alt={exercise.exercise.name}
                            className="exercise-image"
                          />
                          <button 
                            onClick={() => handleDownloadImage(
                              exercise.exercise.image_url, 
                              exercise.exercise.name
                            )}
                            className="download-button"
                            title="Download image"
                            disabled={downloading}
                          >
                            <FaDownload />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="exercise-details">
                      {exercise.sets && exercise.reps && (
                        <div className="detail-item">
                          <FaWeightHanging />
                          <span>{exercise.sets} sets × {exercise.reps} reps</span>
                        </div>
                      )}
                      
                      {exercise.duration_minutes && (
                        <div className="detail-item">
                          <FaClock />
                          <span>{exercise.duration_minutes} minutes</span>
                        </div>
                      )}
                      
                      <div className="exercise-description">
                        {exercise.exercise?.instructions || 
                         "No specific instructions provided."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="no-exercises">No exercises scheduled for this plan yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FitnessPlanDetail;