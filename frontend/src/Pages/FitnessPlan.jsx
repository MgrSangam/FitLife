import { useState, useEffect } from "react";
import { FaDumbbell, FaCalendarAlt, FaHeartbeat, FaRunning } from "react-icons/fa";
import AxiosInstance from "../components/Axiosinstance";
import { useNavigate } from "react-router-dom";
import "../CSS/FitnessPlan.css";

const FitnessPlan = () => {
  const [fitnessPlans, setFitnessPlans] = useState([]);
  const [joinedPlans, setJoinedPlans] = useState([]);
  const [planType, setPlanType] = useState("all");
  const [duration, setDuration] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);
  const [joinMessage, setJoinMessage] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserGoals = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/goals/", {
          headers: { Authorization: `Token ${localStorage.getItem("authToken")}` },
        });
        if (data && data.length > 0) {
          const userGoal = data[0]; // Assuming one goal per user due to OneToOneField
          // Map goal_type to planType
          const goalTypeMap = {
            lose: "weight_loss",
            gain: "muscle_gain",
            maintain: "maintain",
          };
          setPlanType(goalTypeMap[userGoal.goal_type] || "all");
          // Map activity_level to difficulty
          setDifficulty(userGoal.activity_level || "all");
        }
      } catch (error) {
        console.error("Error fetching user goals:", error);
        // Default to "all" if goal fetch fails
        setPlanType("all");
        setDifficulty("all");
      }
    };

    const fetchFitnessPlans = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/fitness-plans/");
        const plansWithDisplay = data.map(plan => ({
          ...plan,
          plan_type_display: plan.plan_type_display || getPlanTypeDisplay(plan.plan_type),
          imageUrl: plan.picture_url
        }));
        setFitnessPlans(plansWithDisplay);
      } catch (error) {
        console.error("Error fetching fitness plans:", error);
      }
    };

    const fetchJoinedPlans = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/fitness-plan-users/");
        const ids = data.map(item => item.fitness_plan);
        setJoinedPlans(ids);
        if (ids.length > 0) {
          setShowJoinedOnly(true);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setJoinedPlans([]);
          setShowJoinedOnly(false);
        } else {
          console.error("Error fetching joined plans:", error);
        }
      }
    };

    fetchUserGoals();
    fetchFitnessPlans();
    fetchJoinedPlans();
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

  const handleJoinPlan = async (planId) => {
    if (joinedPlans.length > 0) {
      setJoinMessage("You can only join one plan at a time.");
      setTimeout(() => setJoinMessage(null), 3000);
      return;
    }

    try {
      setJoiningId(planId);
      const { data } = await AxiosInstance.post("/api/fitness-plan-users/", { fitness_plan: planId });
      setJoinMessage("Successfully joined the fitness plan!");
      setJoinedPlans([planId]); // Set to single plan ID
      setShowJoinedOnly(true);
    } catch (error) {
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setJoinMessage(
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        "Error joining the plan"
      );
    } finally {
      setJoiningId(null);
      setTimeout(() => setJoinMessage(null), 3000);
    }
  };

  const filteredPlans = fitnessPlans.filter((plan) => {
    if (showJoinedOnly && !joinedPlans.includes(plan.id)) {
      return false;
    }
    const matchPlan = planType === "all" || plan.plan_type === planType;
    const matchDuration = duration === "all" || plan.duration_weeks === parseInt(duration);
    const matchDifficulty = difficulty === "all" || plan.difficulty === difficulty;
    return matchPlan && matchDuration && matchDifficulty;
  });

  return (
    <div className="fitness-container">
      <div className="fitness-content">
        <div className="fitness-section">
          <div className="running-icon">
            <FaRunning style={{ color: 'white' }} />
          </div>
          <h1 className="fitness-header">Fitness Plans</h1>
          <p className="fitness-subheader">
            Browse personalized fitness plans tailored to your goals.
          </p>

          {joinMessage && <div className="join-message">{joinMessage}</div>}

          <div className="filters">
            {joinedPlans.length > 0 && (
              <button
                onClick={() => setShowJoinedOnly(!showJoinedOnly)}
                className={`toggle-joined-button ${showJoinedOnly ? 'active' : ''}`}
              >
                {showJoinedOnly ? 'Show All Plans' : 'Show Only Joined Plans'}
              </button>
            )}

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
                  <h3 className="card-title">
                    {plan.name || plan.title || "Untitled Plan"}
                  </h3>

                  {plan.description && (
                    <p className="card-description">
                      {plan.description.length > 100 
                        ? `${plan.description.substring(0, 100)}...` 
                        : plan.description}
                    </p>
                  )}

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

                <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`join-button ${joinedPlans.includes(plan.id) ? 'joined' : ''}`}
                    onClick={() => {
                      if (!joinedPlans.includes(plan.id)) {
                        handleJoinPlan(plan.id);
                      }
                    }}
                    disabled={joinedPlans.includes(plan.id) || (joinedPlans.length > 0 && !joinedPlans.includes(plan.id)) || joiningId === plan.id}
                    aria-disabled={joinedPlans.includes(plan.id) || (joinedPlans.length > 0 && !joinedPlans.includes(plan.id)) || joiningId === plan.id}
                  >
                    {joinedPlans.includes(plan.id)
                      ? 'Joined'
                      : joiningId === plan.id
                      ? 'Joining...'
                      : joinedPlans.length > 0
                      ? 'Already in a Plan'
                      : 'Join Plan'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-plans-message">
              {showJoinedOnly 
                ? "You haven't joined any plans yet." 
                : "No fitness plans match your filters."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FitnessPlan;