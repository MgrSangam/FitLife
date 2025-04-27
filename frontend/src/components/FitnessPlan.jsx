import { useState, useEffect } from "react";
import { FaDumbbell, FaCalendarAlt, FaClock, FaHeartbeat } from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import { useNavigate } from "react-router-dom";
import "./FitnessPlan.css"; // Reusing Challenge.css for styling

const FitnessPlan = () => {
  const [fitnessPlans, setFitnessPlans] = useState([]);
  const [planType, setPlanType] = useState("all");
  const [duration, setDuration] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFitnessPlans = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/fitness-plans/");
        setFitnessPlans(data);
      } catch (error) {
        console.error("Error fetching fitness plans:", error);
      }
    };
    fetchFitnessPlans();
  }, []);

  const filteredPlans = fitnessPlans.filter((plan) => {
    const matchPlan = planType === "all" || plan.plan_type === planType;
    const matchDuration = duration === "all" || plan.duration_weeks === parseInt(duration);
    return matchPlan && matchDuration;
  });

  return (
    <div className="fitness-container">
      <div className="fitness-content">
        <h1 className="fitness-header">Fitness Plans</h1>

        <div className="filters">
          <select
            value={planType}
            onChange={(e) => setPlanType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Goals</option>
            <option value="lose_weight">Lose Weight</option>
            <option value="gain_muscle">Gain Muscle</option>
            <option value="maintain_weight">Maintain Weight</option>
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
        </div>

        <div className="fitness-grid">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="fitness-card"
              onClick={() => navigate(`/fitnessplan-detail/${plan.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-header">
                <div className="card-title">
                  <span>{plan.title}</span>
                </div>
                {plan.picture_url && (
                  <img
                    src={plan.picture_url}
                    alt={plan.title}
                    className="fitness-image"
                  />
                )}
                <p className="card-description">{plan.description}</p>
              </div>

              <div className="card-content">
                <div className="details-container">
                <div className="detail-item">
                  <FaDumbbell className="detail-icon" />
                  <span className="capitalize">
                    {plan.goal_type ? plan.goal_type.replace("_", " ") : "No goal specified"}
                  </span>
                </div>

                  <div className="detail-item">
                    <FaCalendarAlt className="detail-icon" />
                    <span>{plan.duration_weeks} Weeks</span>
                  </div>
                  <div className="detail-item">
                    <FaClock className="detail-icon" />
                    <span>{plan.sessions_per_week} Sessions/Week</span>
                  </div>
                  <div className="detail-item">
                    <FaHeartbeat className="detail-icon" />
                    <span>{plan.intensity_level}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                <button className="join-button">
                  View Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FitnessPlan;
