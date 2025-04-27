import { useState, useEffect } from "react";
import { FaUtensils, FaCalendarAlt, FaFire, FaLeaf } from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import { useNavigate } from "react-router-dom";
import "./MealPlan.css"; // You can create this CSS file with similar styles

const MealPlan = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [planType, setPlanType] = useState("all");
  const [duration, setDuration] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const { data } = await AxiosInstance.get("/api/meal-plans/");
        setMealPlans(data);
      } catch (error) {
        console.error("Error fetching meal plans:", error);
      }
    };
    fetchMealPlans();
  }, []);

  const filteredPlans = mealPlans.filter((plan) => {
    const matchType = planType === "all" || plan.plan_type === planType;
    const matchDuration = duration === "all" || plan.duration_weeks === parseInt(duration);
    return matchType && matchDuration;
  });

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

  return (
    <div className="meal-container">
      <div className="meal-content">
        <h1 className="meal-header">Meal Plans</h1>

        <div className="filters">
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

        <div className="meal-grid">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="meal-card"
              onClick={() => navigate(`/mealplan-detail/${plan.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-header">
                <div className="card-title">
                  <span>{plan.name}</span>
                </div>
                {plan.image_url && (
                  <img
                    src={plan.image_url}
                    alt={plan.name}
                    className="meal-image"
                  />
                )}
                <p className="card-description">
                  {plan.description || "No description available"}
                </p>
              </div>

              <div className="card-content">
                <div className="details-container">
                  <div className="detail-item">
                    <FaUtensils className="detail-icon" />
                    <span>{getPlanTypeDisplay(plan.plan_type)}</span>
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

export default MealPlan;