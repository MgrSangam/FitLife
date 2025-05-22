import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import AxiosInstance from "../../components/Axiosinstance";
import "../../CSS/MealManagement.css";

const MealManagement = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [foods, setFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newMealPlan, setNewMealPlan] = useState({
    name: "",
    plan_type: "",
    daily_calorie_target: "",
    duration_weeks: "",
    description: "",
    image: null,
    meal_foods: [{ food_id: "", meal_time: "", quantity_grams: "", day: "", order: 0 }],
  });

  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Choices from Django models
  const mealPlanTypes = [
    { value: "weight_loss", label: "Weight Loss" },
    { value: "muscle_gain", label: "Muscle Gain" },
    { value: "maintenance", label: "Weight Maintenance" },
    { value: "diabetic", label: "Diabetic Diet" },
    { value: "keto", label: "Keto Diet" },
    { value: "vegetarian", label: "Vegetarian" },
  ];

  const mealTimes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "morning_snack", label: "Morning Snack" },
    { value: "lunch", label: "Lunch" },
    { value: "afternoon_snack", label: "Afternoon Snack" },
    { value: "dinner", label: "Dinner" },
    { value: "evening_snack", label: "Evening Snack" },
  ];

  const daysOfWeek = [
    { value: 1, label: "Day 1" },
    { value: 2, label: "Day 2" },
    { value: 3, label: "Day 3" },
    { value: 4, label: "Day 4" },
    { value: 5, label: "Day 5" },
    { value: 6, label: "Day 6" },
    { value: 7, label: "Day 7" },
  ];

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch data
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
    fetchMealPlans();
    fetchFoods();
  }, []);

  // Handle input changes
  const handleMealInputChange = (e) => {
    const { name, value } = e.target;
    setNewMealPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMealPlan((prev) => ({ ...prev, image: file }));
    }
  };

  const handleMealFoodChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMealFoods = [...newMealPlan.meal_foods];
    updatedMealFoods[index] = { ...updatedMealFoods[index], [name]: value };
    setNewMealPlan((prev) => ({ ...prev, meal_foods: updatedMealFoods }));
  };

  const addMealFood = () => {
    setNewMealPlan((prev) => ({
      ...prev,
      meal_foods: [
        ...prev.meal_foods,
        { food_id: "", meal_time: "", quantity_grams: "", day: "", order: prev.meal_foods.length },
      ],
    }));
  };

  const removeMealFood = (index) => {
    setNewMealPlan((prev) => ({
      ...prev,
      meal_foods: prev.meal_foods.filter((_, i) => i !== index).map((mf, i) => ({ ...mf, order: i })),
    }));
  };

  // Add new meal plan
  const handleAddMealPlan = async () => {
    if (!newMealPlan.name || !newMealPlan.plan_type || !newMealPlan.daily_calorie_target || !newMealPlan.duration_weeks) {
      showNotification("Please fill all required meal plan fields", "error");
      return;
    }
  
    for (const mf of newMealPlan.meal_foods) {
      if (!mf.food_id || !mf.meal_time || !mf.quantity_grams || !mf.day) {
        showNotification("Please fill all required meal food fields", "error");
        return;
      }
    }
  
    try {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('name', newMealPlan.name);
      formData.append('plan_type', newMealPlan.plan_type);
      formData.append('daily_calorie_target', Number(newMealPlan.daily_calorie_target));
      formData.append('duration_weeks', Number(newMealPlan.duration_weeks));
      if (newMealPlan.description) {
        formData.append('description', newMealPlan.description);
      }
      
      // Append image if exists
      if (newMealPlan.image) {
        formData.append('image', newMealPlan.image);
      }
      
      // Append meal_foods as JSON string
      const mealFoodsData = newMealPlan.meal_foods.map(mf => ({
        food: Number(mf.food_id),
        meal_time: mf.meal_time,
        quantity_grams: Number(mf.quantity_grams),
        day: Number(mf.day),
        order: mf.order || 0
      }));
      formData.append('meal_foods', JSON.stringify(mealFoodsData));
  
      const response = await AxiosInstance.post("api/meal-plans/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setMealPlans([...mealPlans, response.data]);
      setNewMealPlan({
        name: "",
        plan_type: "",
        daily_calorie_target: "",
        duration_weeks: "",
        description: "",
        image: null,
        meal_foods: [{ food_id: "", meal_time: "", quantity_grams: "", day: "", order: 0 }],
      });
      setIsAddingMeal(false);
      showNotification("Meal plan added successfully!", "success");
      fetchMealPlans();
    } catch (err) {
      console.error("Error details:", err.response?.data);
      showNotification(`Failed to add meal plan: ${JSON.stringify(err.response?.data) || err.message}`, "error");
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
  const handleEditPlan = (plan) => {
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

      <div className="main-content">
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
                  <label>Daily Calorie Target *</label>
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
                  <label>Plan Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {newMealPlan.image && (
                    <div className="image-preview">
                      <img 
                        src={URL.createObjectURL(newMealPlan.image)} 
                        alt="Preview" 
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </div>
                  )}
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

              <h4>Meal Foods</h4>
              {newMealPlan.meal_foods.map((mealFood, index) => (
                <div key={index} className="meal-food-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Food *</label>
                      <select
                        name="food_id"
                        value={mealFood.food_id}
                        onChange={(e) => handleMealFoodChange(index, e)}
                        required
                      >
                        <option value="">Select Food</option>
                        {foods.map((food) => (
                          <option key={food.id} value={food.id}>
                            {food.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Meal Time *</label>
                      <select
                        name="meal_time"
                        value={mealFood.meal_time}
                        onChange={(e) => handleMealFoodChange(index, e)}
                        required
                      >
                        <option value="">Select Meal Time</option>
                        {mealTimes.map((time) => (
                          <option key={time.value} value={time.value}>
                            {time.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity (grams) *</label>
                      <input
                        type="number"
                        name="quantity_grams"
                        value={mealFood.quantity_grams}
                        onChange={(e) => handleMealFoodChange(index, e)}
                        min="1"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Day *</label>
                      <select
                        name="day"
                        value={mealFood.day}
                        onChange={(e) => handleMealFoodChange(index, e)}
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
                  </div>
                  {newMealPlan.meal_foods.length > 1 && (
                    <button
                      className="remove-button"
                      onClick={() => removeMealFood(index)}
                    >
                      <FaMinus /> Remove
                    </button>
                  )}
                </div>
              ))}
              <button className="add-sub-button" onClick={addMealFood}>
                <FaPlus /> Add Meal Food
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
                  <th>Image</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Daily Calories</th>
                  <th>Duration (Weeks)</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mealPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      {plan.image_url && (
                        <img 
                          src={plan.image_url} 
                          alt={plan.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                    </td>
                    <td>{plan.name}</td>
                    <td>{plan.plan_type_display}</td>
                    <td>{plan.daily_calorie_target}</td>
                    <td>{plan.duration_weeks}</td>
                    <td className="description-cell">{plan.description}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() => handleEditPlan(plan)}
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
      </div>
    </div>
  );
};

export default MealManagement;