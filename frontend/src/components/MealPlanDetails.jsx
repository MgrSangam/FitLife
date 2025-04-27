import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import AxiosInstance from "./Axiosinstance";
import {
  FaUtensils,
  FaCalendarAlt,
  FaFire,
  FaLeaf,
  FaAppleAlt,
  FaBreadSlice,
  FaDrumstickBite
} from "react-icons/fa";
import "./MealPlanDetails.css";

const MealPlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState("monday");

  // Memoized helper functions
  const getPlanTypeIcon = useMemo(() => (type) => {
    const icons = {
      weight_loss: <FaFire className="icon weight-loss" />,
      muscle_gain: <FaDrumstickBite className="icon muscle-gain" />,
      maintenance: <FaAppleAlt className="icon maintenance" />,
      diabetic: <FaLeaf className="icon diabetic" />,
      keto: <FaBreadSlice className="icon keto" />,
      vegetarian: <FaLeaf className="icon vegetarian" />
    };
    return icons[type] || <FaUtensils className="icon default" />;
  }, []);

  const getDayDisplayName = useMemo(() => (day) => {
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
  }, []);

  const getMealTypeIcon = (type) => {
    const icons = {
      breakfast: <FaAppleAlt />,
      lunch: <FaBreadSlice />,
      dinner: <FaDrumstickBite />,
      snack: <FaLeaf />
    };
    return icons[type] || <FaUtensils />;
  };

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const { data } = await AxiosInstance.get(`/api/meal-plans/${id}/`);
        console.log("Fetched data:", data);  // Check the API response structure
        setPlan(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch meal plan details");
        console.error("API Error:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [id]);

  // Memoized derived data
  const { mealsByDay, daysWithMeals } = useMemo(() => {
    const mealsByDay = plan?.meal_foods?.reduce((acc, meal) => {
      const day = meal.day;
      acc[day] = acc[day] || [];
      acc[day].push(meal);
      return acc;
    }, {}) || {};

    const daysWithMeals = Object.keys(mealsByDay).filter(
      day => mealsByDay[day]?.length > 0
    );

    return { mealsByDay, daysWithMeals };
  }, [plan]);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!plan || !plan.name) return <div className="not-found">Meal plan not found</div>;

  return (
    <div className="meal-plan-container">
      <Link to="/mealsplan" className="back-link">
        &larr; Back to Meal Plans
      </Link>

      <article className="meal-plan-content">
        <header className="plan-header">
          <h1 className="plan-title">{plan.name}</h1>
          <div className="plan-meta">
            <span className="meta-item">
              {getPlanTypeIcon(plan.plan_type)}
              {plan.plan_type_display || plan.plan_type}
            </span>
            <span className="meta-item">
              <FaCalendarAlt /> {plan.duration_weeks} weeks
            </span>
            <span className="meta-item">
              <FaFire /> {plan.daily_calorie_target} kcal/day
            </span>
          </div>
        </header>

        {plan.image_url && (
          <img
            src={plan.image_url}
            alt={`${plan.name} meal plan`}
            className="plan-image"
            loading="lazy"
          />
        )}

        <section className="plan-description">
          <h2>Plan Overview</h2>
          <p>{plan.description || "No description available."}</p>
        </section>

        <section className="meal-schedule">
          <h2>Weekly Meal Plan</h2>
          {daysWithMeals.length > 0 ? (
            <div className="day-selector">
              {daysWithMeals.map(day => (
                <button
                  key={day}
                  className={`day-button ${activeDay === day ? 'active' : ''}`}
                  onClick={() => setActiveDay(day)}
                  aria-label={`Show ${getDayDisplayName(day)} meals`}
                >
                  {getDayDisplayName(day).substring(0, 3)}
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No meals scheduled for this plan yet.</p>
            </div>
          )}

          <div className="meal-day">
            <h3>{getDayDisplayName(activeDay)} Meals</h3>
            <div className="meal-list">
              {mealsByDay[activeDay]?.map(meal => (
                <div key={`${meal.id}-${meal.day}`} className="meal-card">
                  <div className="meal-info">
                    <div className="meal-type">
                      {getMealTypeIcon(meal.meal_type)}
                      <span className="capitalize">{meal.meal_type}</span>
                    </div>
                    <h4>{meal.food?.name || "Unspecified Meal"}</h4>
                    <div className="meal-meta">
                      <span className="meal-stat">
                        <FaFire /> {meal.calories} kcal
                      </span>
                      {meal.protein && <span className="meal-stat">Protein: {meal.protein}g</span>}
                      {meal.carbs && <span className="meal-stat">Carbs: {meal.carbs}g</span>}
                      {meal.fats && <span className="meal-stat">Fats: {meal.fats}g</span>}
                    </div>
                    <p className="meal-instructions">
                      {meal.instructions || "No specific preparation instructions provided."}
                    </p>
                  </div>
                  {meal.food?.image_url && (
                    <img
                      src={meal.food.image_url}
                      alt={meal.food.name}
                      className="meal-image"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};

export default MealPlanDetail;
