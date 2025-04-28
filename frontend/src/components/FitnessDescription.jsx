import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AxiosInstance from "./Axiosinstance";
import {
  FaDumbbell,
  FaCalendarAlt,
  FaClock,
  FaHeartbeat,
  FaFire,
  FaRunning,
  FaWeightHanging,
} from "react-icons/fa";
import "./FitnessPlanDetail.css";

const FitnessPlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState("monday");

  // Fetch plan details
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await AxiosInstance.get(`/api/fitness-plans/${id}/`);

        setPlan(data);
      } catch (err) {
        setError("Failed to fetch plan details");
        console.error("Error fetching plan details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

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

  if (loading) return <div className="loading">Loading plan details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!plan) return <div className="error">Plan not found</div>;

  // Group exercises by day
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
        &larr; Back to Fitness Plans
      </Link>

      <div className="fitness-plan-detail">
        <h2 className="detail-title">{plan.name}</h2>

        {plan.picture && (
          <img
            src={plan.picture}
            alt={plan.name}
            className="detail-image"
          />
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
                        <img
                          src={exercise.exercise.image_url}
                          alt={exercise.exercise.name}
                          className="exercise-image"
                        />
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