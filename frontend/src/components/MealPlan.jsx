import { useState, useEffect } from "react";
import { FaUtensils, FaCalendarAlt, FaFire, FaLeaf, FaHamburger } from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import { useNavigate } from "react-router-dom";
import "./MealPlan.css";

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
    <div className="fitness-container">
      <div className="fitness-content">
        {/* Combined header with icon and filters */}
        <div className="fitness-header-container">
          <div className="header-icon-title">
            <FaHamburger className="fitness-plan-icon" />
            <h1 className="fitness-header">Meal Plans</h1>


            <p className="meals-subheader">
                Browse personalized meal plans tailored to your Dietery Goals.
            </p>

          </div>
          
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
        </div>

        <div className="fitness-grid">
          {filteredPlans.length > 0 ? (
            filteredPlans.map((plan) => (
              <div
                key={plan.id}
                className="fitness-card"
                onClick={() => navigate(`/mealplan-detail/${plan.id}`)}
              >
                {/* Image at the top */}
                {plan.image_url && (
                  <div className="card-image-container">
                    <img
                      src={plan.image_url}
                      alt={plan.name || "Meal plan"}
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
                    {plan.name || "Untitled Meal Plan"}
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

                <div className="card-footer">
                  <button 
                    className="view-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/mealplan-detail/${plan.id}`);
                    }}
                  >
                    View Plan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-plans-message">
              No meal plans match your selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlan;