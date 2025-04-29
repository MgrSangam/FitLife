import { useState, useEffect } from "react";
import { FaDumbbell, FaCalendarAlt, FaHeartbeat, FaRunning } from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import { useNavigate } from "react-router-dom";

import "./FitnessPlan.css";

const FitnessPlan = () => {
  const [fitnessPlans, setFitnessPlans] = useState([]);
  const [planType, setPlanType] = useState("all");
  const [duration, setDuration] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFitnessPlans = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/fitness-plans/");
        const plansWithDisplay = data.map(plan => ({
          ...plan,
          plan_type_display: plan.plan_type_display || getPlanTypeDisplay(plan.plan_type),
          imageUrl: plan.picture_url // Use the URL provided by the serializer
        }));
        setFitnessPlans(plansWithDisplay);
      } catch (error) {
        console.error("Error fetching fitness plans:", error);
      }
    };
    fetchFitnessPlans();
  }, []);

  const getPlanTypeDisplay = (planType) => {
    const typeMap = {
      'weight_loss': 'Weight Loss',
      'muscle_gain': 'Muscle Gain',
      'endurance': 'Endurance Training',
      'maintain': 'Maintain Weight',
      'lose_weight': 'Lose Weight',
      'gain_muscle': 'Gain Muscle',
      'maintain_weight': 'Maintain Weight'
    };
    return typeMap[planType] || planType;
  };

  const getDifficultyDisplay = (difficulty) => {
    const difficultyMap = {
      'sedentary': 'Very Easy',
      'light': 'Easy',
      'moderate': 'Normal',
      'active': 'Hard',
      'very_active': 'Very Hard'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const filteredPlans = fitnessPlans.filter((plan) => {
    const matchPlan = planType === "all" || plan.plan_type === planType;
    const matchDuration = duration === "all" || plan.duration_weeks === parseInt(duration);
    const matchDifficulty = difficulty === "all" || plan.difficulty === difficulty;
    return matchPlan && matchDuration && matchDifficulty;
  });

  return (
    <div className="fitness-container">
      <div className="fitness-content">
        {/* Combined header with icon and filters */}
        <div className="fitness-header-container">
          <div className="header-icon-title">
            <FaRunning className="fitness-plan-icon" />
            <h1 className="fitness-header">Fitness Plans</h1>
            <p className="fitness-subheader">
                Browse personalized meal plans tailored to your fitness goals.
            </p>
          </div>
          
          <div className="filters">
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Goals</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance Training</option>
              <option value="maintain">Maintain Weight</option>
            </select>

            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Durations</option>
              <option value="4">4 Weeks</option>
              <option value="8">8 Weeks</option>
              <option value="12">12 Weeks</option>
            </select>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Difficulties</option>
              <option value="sedentary">Very Easy</option>
              <option value="light">Easy</option>
              <option value="moderate">Normal</option>
              <option value="active">Hard</option>
              <option value="very_active">Very Hard</option>
            </select>
          </div>
        </div>

        <div className="fitness-grid">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="fitness-card"
                onClick={() => navigate(`/fitnessplan-detail/${plan.id}`)}
              >
                {/* Image at the top */}
                {plan.imageUrl && (
                  <div className="card-image-container">
                    <img
                      src={plan.imageUrl}
                      alt={plan.name || plan.title || "Fitness plan"}
                      className="fitness-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="card-body">
                  {/* Title below image */}
                  <h3 className="card-title">
                    {plan.name || plan.title || "Untitled Plan"}
                  </h3>

                  {/* Description below title */}
                  {plan.description && (
                    <p className="card-description">
                      {plan.description.length > 100 
                        ? `${plan.description.substring(0, 100)}...` 
                        : plan.description}
                    </p>
                  )}

                  {/* Details at the bottom */}
                  <div className="card-details">
                    <div className="detail-item">
                      <FaDumbbell className="detail-icon" />
                      <span>{plan.plan_type_display || getPlanTypeDisplay(plan.plan_type)}</span>
                    </div>

                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{plan.duration_weeks} Weeks</span>
                    </div>

                    <div className="detail-item">
                      <FaHeartbeat className="detail-icon" />
                      <span>{getDifficultyDisplay(plan.difficulty)}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <button 
                    className="view-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/fitnessplan-detail/${plan.id}`);
                    }}
                  >
                    View Plan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-plans-message">
              No fitness plans match your selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FitnessPlan;