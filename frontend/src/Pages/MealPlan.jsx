import { useState, useEffect } from "react";
import { FaUtensils, FaCalendarAlt, FaFire, FaLeaf, FaHamburger } from "react-icons/fa";
import AxiosInstance from "../components/Axiosinstance";
import { useNavigate } from "react-router-dom";
import "../CSS/MealPlan.css";

const MealPlan = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [joinedPlans, setJoinedPlans] = useState([]);
  const [planType, setPlanType] = useState("all");
  const [duration, setDuration] = useState("all");
  const [showJoinedOnly, setShowJoinedOnly] = useState(false);
  const [joinMessage, setJoinMessage] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/meal-plans/");
        const plansWithDisplay = data.map(plan => ({
          ...plan,
          plan_type_display: plan.plan_type_display || getPlanTypeDisplay(plan.plan_type),
          imageUrl: plan.image_url
        }));
        setMealPlans(plansWithDisplay);
      } catch (error) {
        console.error("Error fetching meal plans:", error);
      }
    };

    const fetchJoinedPlans = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/meal-plan-users/");
        const ids = data.map(item => item.meal_plan);
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

    fetchMealPlans();
    fetchJoinedPlans();
  }, []);

  const getPlanTypeDisplay = (type) => {
    const typeMap = {
      'weight_loss': 'Weight Loss',
      'muscle_gain': 'Muscle Gain',
      'maintenance': 'Weight Maintenance',
      'diabetic': 'Diabetic Diet',
      'keto': 'Keto Diet',
      'vegetarian': 'Vegetarian'
    };
    return typeMap[type] || type;
  };

  const handleJoinPlan = async (planId) => {
    if (joinedPlans.length > 0) {
      setJoinMessage("You can only join one plan at a time.");
      setTimeout(() => setJoinMessage(null), 3000);
      return;
    }

    try {
      setJoiningId(planId);
      const { data } = await AxiosInstance.post("/api/meal-plan-users/", { meal_plan: planId });
      setJoinMessage("Successfully joined the meal plan!");
      setJoinedPlans([planId]);
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

  const filteredPlans = mealPlans.filter((plan) => {
    if (showJoinedOnly && !joinedPlans.includes(plan.id)) {
      return false;
    }
    const matchType = planType === "all" || plan.plan_type === planType;
    const matchDuration = duration === "all" || plan.duration_weeks === parseInt(duration);
    return matchType && matchDuration;
  });

  return (
    <div className="fitness-container">
      <div className="fitness-content">
        <div className="fitness-section">
          <div className="running-icon">
            <FaHamburger style={{ color: 'white' }} />
          </div>
          <h1 className="fitness-header">Meal Plans</h1>
          <p className="fitness-subheader">
            Browse personalized meal plans tailored to your Dietary Goals.
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
              <option value="all">All Types</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="maintenance">Weight Maintenance</option>
              <option value="diabetic">Diabetic Diet</option>
              <option value="keto">Keto Diet</option>
              <option value="vegetarian">Vegetarian</option>
            </select>

            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Durations</option>
              <option value="1">1 Week</option>
              <option value="2">2 Weeks</option>
              <option value="4">4 Weeks</option>
              <option value="8">8 Weeks</option>
            </select>
          </div>
        </div>

        <div className="fitness-grid">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="fitness-card"
                onClick={() => navigate(`/mealplan-detail/${plan.id}`)}
              >
                {plan.imageUrl && (
                  <div className="card-image-container">
                    <img
                      src={plan.imageUrl}
                      alt={plan.name || "Meal plan"}
                      className="fitness-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="card-body">
                  <h3 className="card-title">
                    {plan.name || "Untitled Meal Plan"}
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
                      <FaUtensils className="detail-icon" />
                      <span>{plan.plan_type_display || getPlanTypeDisplay(plan.plan_type)}</span>
                    </div>

                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{plan.duration_weeks} Weeks</span>
                    </div>

                    <div className="detail-item">
                      <FaFire className="detail-icon" />
                      <span>{plan.daily_calorie_target} kcal/day</span>
                    </div>

                    <div className="detail-item">
                      <FaLeaf className="detail-icon" />
                      <span>{plan.meal_foods?.length || 0} Meals</span>
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
                : "No meal plans match your filters."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlan;