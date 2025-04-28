import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import "./PlanManagement.css";

const PlanManagement = () => {
  const [activeTab, setActiveTab] = useState("fitness");
  const [fitnessPlans, setFitnessPlans] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newFitnessPlan, setNewFitnessPlan] = useState({
    name: "",
    plan_type: "",
    duration_weeks: "",
    difficulty: "",
    description: "",
    exercises: [{ exercise_id: "", day: "", sets: "", reps: "", duration_minutes: "", order: 0 }],
  });
  const [newMealPlan, setNewMealPlan] = useState({
    name: "",
    plan_type: "",
    daily_calorie_target: "",
    duration_weeks: "",
    description: "",
    meal_foods: [{ food_id: "", meal_time: "", quantity_grams: "", day: "", order: 0 }],
  });

  const [isAddingFitness, setIsAddingFitness] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Choices from Django models
  const fitnessPlanTypes = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "endurance", label: "Endurance Training" },
    { value: "maintain", label: "Maintain Weight" },
  ];

  const fitnessDifficultyLevels = [
    { value: "sedentary", label: "Very Easy (Sedentary: little to no exercise)" },
    { value: "light", label: "Easy (Light: 1-3 times/week)" },
    { value: "moderate", label: "Normal (Moderate: 3-5 times/week)" },
    { value: "active", label: "Hard (Active: 6-7 times/week)" },
    { value: "very_active", label: "Very Hard (Very Active: 2x/day)" },
  ];

  const mealPlanTypes = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "maintenance", label: "Weight Maintenance" },
    { value: "diabetic", label: "Diabetic Diet" },
    { value: "keto", label: "Keto Diet" },
    { value: "vegetarian", label: "Vegetarian" },
  ];

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  const mealTimeChoices = [
    { value: "breakfast", label: "Breakfast" },
    { value: "morning_snack", label: "Morning Snack" },
    { value: "lunch", label: "Lunch" },
    { value: "afternoon_snack", label: "Afternoon Snack" },
    { value: "dinner", label: "Dinner" },
    { value: "evening_snack", label: "Evening Snack" },
  ];

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch data
  const fetchFitnessPlans = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosInstance.get("api/fitness-plans/");
      setFitnessPlans(response.data);
    } catch (err) {
      setError("Failed to fetch fitness plans.");
      showNotification("Failed to fetch fitness plans.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMealPlans = async () => {
    setIsLoading(true);
    try {
      const response = await AxiosInstance.get("api/meal-plans/");
      setMealPlans(response.data);
    } catch (err) {
      setError("Failed to fetch meal plans.");
      showNotification("Failed to fetch meal plans.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await AxiosInstance.get("api/exercises/");
      setExercises(response.data);
    } catch (err) {
      setError("Failed to fetch exercises.");
      showNotification("Failed to fetch exercises.", "error");
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await AxiosInstance.get("api/foods/");
      setFoods(response.data);
    } catch (err) {
      setError("Failed to fetch foods.");
      showNotification("Failed to fetch foods.", "error");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFitnessPlans();
    fetchMealPlans();
    fetchExercises();
    fetchFoods();
  }, []);

  // Handle input changes
  const handleFitnessInputChange = (e) => {
    const { name, value } = e.target;
    setNewFitnessPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleMealInputChange = (e) => {
    const { name, value } = e.target;
    setNewMealPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleExerciseChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExercises = [...newFitnessPlan.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [name]: value };
    setNewFitnessPlan((prev) => ({ ...prev, exercises: updatedExercises }));
  };

  const handleFoodChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFoods = [...newMealPlan.meal_foods];
    updatedFoods[index] = { ...updatedFoods[index], [name]: value };
    setNewMealPlan((prev) => ({ ...prev, meal_foods: updatedFoods }));
  };

  const addExercise = () => {
    setNewFitnessPlan((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { exercise_id: "", day: "", sets: "", reps: "", duration_minutes: "", order: prev.exercises.length },
      ],
    }));
  };

  const removeExercise = (index) => {
    setNewFitnessPlan((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, order: i })),
    }));
  };

  const addFood = () => {
    setNewMealPlan((prev) => ({
      ...prev,
      meal_foods: [
        ...prev.meal_foods,
        { food_id: "", meal_time: "", quantity_grams: "", day: "", order: prev.meal_foods.length },
      ],
    }));
  };

  const removeFood = (index) => {
    setNewMealPlan((prev) => ({
      ...prev,
      meal_foods: prev.meal_foods.filter((_, i) => i !== index).map((food, i) => ({ ...food, order: i })),
    }));
  };

  // Add new fitness plan
  const handleAddFitnessPlan = async () => {
    if (!newFitnessPlan.name || !newFitnessPlan.plan_type || !newFitnessPlan.duration_weeks || !newFitnessPlan.difficulty) {
      showNotification("Please fill all required fitness plan fields", "error");
      return;
    }

    for (const ex of newFitnessPlan.exercises) {
      if (!ex.exercise_id || !ex.day || !ex.sets || !ex.reps) {
        showNotification("Please fill all required exercise fields", "error");
        return;
      }
    }

    try {
      const response = await AxiosInstance.post("api/fitness-plans/", {
        ...newFitnessPlan,
        duration_weeks: Number(newFitnessPlan.duration_weeks),
        exercises: newFitnessPlan.exercises.map((ex) => ({
          exercise_id: Number(ex.exercise_id),
          day: ex.day,
          sets: Number(ex.sets),
          reps: Number(ex.reps),
          duration_minutes: ex.duration_minutes ? Number(ex.duration_minutes) : null,
          order: ex.order,
        })),
      });
      setFitnessPlans([...fitnessPlans, response.data]);
      setNewFitnessPlan({
        name: "",
        plan_type: "",
        duration_weeks: "",
        difficulty: "",
        description: "",
        exercises: [{ exercise_id: "", day: "", sets: "", reps: "", duration_minutes: "", order: 0 }],
      });
      setIsAddingFitness(false);
      showNotification("Fitness plan added successfully!", "success");
    } catch (err) {
      showNotification("Failed to add fitness plan.", "error");
    }
  };

  // Add new meal plan
  const handleAddMealPlan = async () => {
    if (
      !newMealPlan.name ||
      !newMealPlan.plan_type ||
      !newMealPlan.daily_calorie_target ||
      !newMealPlan.duration_weeks
    ) {
      showNotification("Please fill all required meal plan fields", "error");
      return;
    }

    for (const food of newMealPlan.meal_foods) {
      if (!food.food_id || !food.meal_time || !food.quantity_grams || !food.day) {
        showNotification("Please fill all required food fields", "error");
        return;
      }
    }

    try {
      const response = await AxiosInstance.post("api/meal-plans/", {
        ...newMealPlan,
        daily_calorie_target: Number(newMealPlan.daily_calorie_target),
        duration_weeks: Number(newMealPlan.duration_weeks),
        meal_foods: newMealPlan.meal_foods.map((food) => ({
          food_id: Number(food.food_id),
          meal_time: food.meal_time,
          quantity_grams: Number(food.quantity_grams),
          day: Number(food.day),
          order: food.order,
        })),
      });
      setMealPlans([...mealPlans, response.data]);
      setNewMealPlan({
        name: "",
        plan_type: "",
        daily_calorie_target: "",
        duration_weeks: "",
        description: "",
        meal_foods: [{ food_id: "", meal_time: "", quantity_grams: "", day: "", order: 0 }],
      });
      setIsAddingMeal(false);
      showNotification("Meal plan added successfully!", "success");
    } catch (err) {
      showNotification("Failed to add meal plan.", "error");
    }
  };

  // Delete fitness plan
  const handleDeleteFitnessPlan = async (id) => {
    try {
      await AxiosInstance.delete(`api/fitness-plans/${id}/`);
      setFitnessPlans(fitnessPlans.filter((plan) => plan.id !== id));
      showNotification("Fitness plan deleted successfully!", "success");
    } catch (err) {
      showNotification("Failed to delete fitness plan.", "error");
    }
  };

  // Delete meal plan
  const handleDeleteMealPlan = async (id) => {
    try {
      await AxiosInstance.delete(`api/meal-plans/${id}/`);
      setMealPlans(mealPlans.filter((plan) => plan.id !== id));
      showNotification("Meal plan deleted successfully!", "success");
    } catch (err) {
      showNotification("Failed to delete meal plan.", "error");
    }
  };

  // Handle edit (placeholder)
  const handleEditPlan = (plan, type) => {
    showNotification("Edit functionality coming soon!", "info");
  };

  return (
    <div className="plan-management">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {/* Sidebar for navigation */}
      <div className="sidebar">
        <button
          className={`tab ${activeTab === "fitness" ? "active" : ""}`}
          onClick={() => setActiveTab("fitness")}
        >
          Fitness Plans
        </button>
        <button
          className={`tab ${activeTab === "meal" ? "active" : ""}`}
          onClick={() => setActiveTab("meal")}
        >
          Meal Plans
        </button>
      </div>

      {/* Main content area */}
      <div className="main-content">
        {/* Fitness Plans Tab */}
        {activeTab === "fitness" && (
          <div className="tab-content active">
            <div className="header">
              <h2>Fitness Plans</h2>
              {!isAddingFitness && (
                <button
                  className="add-button"
                  onClick={() => setIsAddingFitness(true)}
                >
                  <FaPlus className="icon" />
                  Add Fitness Plan
                </button>
              )}
            </div>

            {isAddingFitness && (
              <div className="form-container">
                <h3>Add New Fitness Plan</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newFitnessPlan.name}
                      onChange={handleFitnessInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      name="plan_type"
                      value={newFitnessPlan.plan_type}
                      onChange={handleFitnessInputChange}
                      required
                    >
                      <option value="">Select Type</option>
                      {fitnessPlanTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration (Weeks) *</label>
                    <input
                      type="number"
                      name="duration_weeks"
                      value={newFitnessPlan.duration_weeks}
                      onChange={handleFitnessInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Difficulty *</label>
                    <select
                      name="difficulty"
                      value={newFitnessPlan.difficulty}
                      onChange={handleFitnessInputChange}
                      required
                    >
                      <option value="">Select Difficulty</option>
                      {fitnessDifficultyLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newFitnessPlan.description}
                      onChange={handleFitnessInputChange}
                      maxLength="500"
                    />
                  </div>
                </div>

                <h4>Exercises</h4>
                {newFitnessPlan.exercises.map((exercise, index) => (
                  <div key={index} className="exercise-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Exercise *</label>
                        <select
                          name="exercise_id"
                          value={exercise.exercise_id}
                          onChange={(e) => handleExerciseChange(index, e)}
                          required
                        >
                          <option value="">Select Exercise</option>
                          {exercises.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Day *</label>
                        <select
                          name="day"
                          value={exercise.day}
                          onChange={(e) => handleExerciseChange(index, e)}
                          required
                        >
                          <option value="">Select Day</option>
                          {daysOfWeek.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Sets *</label>
                        <input
                          type="number"
                          name="sets"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, e)}
                          min="1"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Reps *</label>
                        <input
                          type="number"
                          name="reps"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, e)}
                          min="1"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration (Minutes)</label>
                        <input
                          type="number"
                          name="duration_minutes"
                          value={exercise.duration_minutes}
                          onChange={(e) => handleExerciseChange(index, e)}
                          min="0"
                        />
                      </div>
                    </div>
                    {newFitnessPlan.exercises.length > 1 && (
                      <button
                        className="remove-button"
                        onClick={() => removeExercise(index)}
                      >
                        <FaMinus /> Remove
                      </button>
                    )}
                  </div>
                ))}
                <button className="add-sub-button" onClick={addExercise}>
                  <FaPlus /> Add Exercise
                </button>

                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={() => setIsAddingFitness(false)}
                  >
                    Cancel
                  </button>
                  <button className="submit-button" onClick={handleAddFitnessPlan}>
                    Add Plan
                  </button>
                </div>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Duration (Weeks)</th>
                    <th>Difficulty</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fitnessPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.name}</td>
                      <td>{plan.plan_type_display}</td>
                      <td>{plan.duration_weeks}</td>
                      <td>{plan.difficulty_display}</td>
                      <td className="description-cell">{plan.description}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEditPlan(plan, "fitness")}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteFitnessPlan(plan.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Meal Plans Tab */}
        {activeTab === "meal" && (
          <div className="tab-content active">
            <div className="header">
              <h2>Meal Plans</h2>
              {!isAddingMeal && (
                <button
                  className="add-button"
                  onClick={() => setIsAddingMeal(true)}
                >
                  <FaPlus className="icon" />
                  Add Meal Plan
                </button>
              )}
            </div>

            {isAddingMeal && (
              <div className="form-container">
                <h3>Add New Meal Plan</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newMealPlan.name}
                      onChange={handleMealInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      name="plan_type"
                      value={newMealPlan.plan_type}
                      onChange={handleMealInputChange}
                      required
                    >
                      <option value="">Select Type</option>
                      {mealPlanTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Daily Calories *</label>
                    <input
                      type="number"
                      name="daily_calorie_target"
                      value={newMealPlan.daily_calorie_target}
                      onChange={handleMealInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Duration (Weeks) *</label>
                    <input
                      type="number"
                      name="duration_weeks"
                      value={newMealPlan.duration_weeks}
                      onChange={handleMealInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newMealPlan.description}
                      onChange={handleMealInputChange}
                      maxLength="500"
                    />
                  </div>
                </div>

                <h4>Foods</h4>
                {newMealPlan.meal_foods.map((food, index) => (
                  <div key={index} className="food-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Food *</label>
                        <select
                          name="food_id"
                          value={food.food_id}
                          onChange={(e) => handleFoodChange(index, e)}
                          required
                        >
                          <option value="">Select Food</option>
                          {foods.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Meal Time *</label>
                        <select
                          name="meal_time"
                          value={food.meal_time}
                          onChange={(e) => handleFoodChange(index, e)}
                          required
                        >
                          <option value="">Select Meal Time</option>
                          {mealTimeChoices.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Quantity (Grams) *</label>
                        <input
                          type="number"
                          name="quantity_grams"
                          value={food.quantity_grams}
                          onChange={(e) => handleFoodChange(index, e)}
                          min="1"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Day (1-7) *</label>
                        <input
                          type="number"
                          name="day"
                          value={food.day}
                          onChange={(e) => handleFoodChange(index, e)}
                          min="1"
                          max="7"
                          required
                        />
                      </div>
                    </div>
                    {newMealPlan.meal_foods.length > 1 && (
                      <button
                        className="remove-button"
                        onClick={() => removeFood(index)}
                      >
                        <FaMinus /> Remove
                      </button>
                    )}
                  </div>
                ))}
                <button className="add-sub-button" onClick={addFood}>
                  <FaPlus /> Add Food
                </button>

                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={() => setIsAddingMeal(false)}
                  >
                    Cancel
                  </button>
                  <button className="submit-button" onClick={handleAddMealPlan}>
                    Add Plan
                  </button>
                </div>
              </div>
            )}

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Duration (Weeks)</th>
                    <th>Calories/Day</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mealPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.name}</td>
                      <td>{plan.plan_type_display}</td>
                      <td>{plan.duration_weeks}</td>
                      <td>{plan.daily_calorie_target}</td>
                      <td className="description-cell">{plan.description}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => handleEditPlan(plan, "meal")}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteMealPlan(plan.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanManagement;