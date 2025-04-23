import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "./AxiosInstance";
import {
  FaCalendarAlt,
  FaWeight,
  FaRunning,
  FaBullseye,
  FaDumbbell,
  FaArrowDown,
  FaArrowUp,
  FaCircle
} from "react-icons/fa";
import "./GoalSetup.css";

const GoalsPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    age: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    activityLevel: "",
    goalType: "",
    startDate: "",
    targetDate: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const goalOptions = [
    { 
      id: "lose", 
      label: "Lose Weight", 
      description: "Burn fat and reduce overall body weight",
      icon: <FaArrowDown className="icon lose" /> 
    },
    { 
      id: "gain", 
      label: "Gain Muscle", 
      description: "Build strength and increase muscle mass",
      icon: <FaDumbbell className="icon gain" /> 
    },
    { 
      id: "maintain", 
      label: "Maintain Weight", 
      description: "Keep your current fitness level",
      icon: <FaCircle className="icon maintain" /> 
    }
  ];

  const activityLevels = [
    { value: "sedentary",   label: "Sedentary (little to no exercise)" },
    { value: "light",       label: "Light (exercise 1-3 times/week)" },
    { value: "moderate",    label: "Moderate (exercise 3-5 times/week)" },
    { value: "active",      label: "Active (exercise 6-7 times/week)" },
    { value: "very_active", label: "Very Active (exercise 2x/day)" },
  ];
  

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.age) newErrors.age = "Age is required";
    else if (form.age < 13 || form.age > 120) newErrors.age = "Please enter a valid age";
    if (!form.height) newErrors.height = "Height is required";
    else if (form.height < 100 || form.height > 250) newErrors.height = "Please enter a valid height (100-250cm)";
    if (!form.currentWeight) newErrors.currentWeight = "Current weight is required";
    else if (form.currentWeight < 30 || form.currentWeight > 300) newErrors.currentWeight = "Please enter a valid weight";
    if (!form.targetWeight) newErrors.targetWeight = "Target weight is required";
    else if (form.targetWeight < 30 || form.targetWeight > 300) newErrors.targetWeight = "Please enter a valid weight";
    if (!form.goalType) newErrors.goalType = "Please select a goal";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.targetDate) newErrors.targetDate = "Target date is required";
    if (!form.activityLevel) newErrors.activityLevel = "Activity level is required";

    if (form.startDate && form.targetDate) {
      const start = new Date(form.startDate);
      const target = new Date(form.targetDate);
      if (target <= start) newErrors.targetDate = "Target date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        goal_type: form.goalType,
        start_date: form.startDate,
        target_date: form.targetDate,
        target_weight: form.targetWeight,
        activity_level: form.activityLevel,
        age: form.age,
        height: form.height,
        current_weight: form.currentWeight
      };

      await AxiosInstance.post("/api/goals/", payload, {
        headers: { Authorization: `Token ${token}` },
      });
      
      setSuccessMessage("Goal saved successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err.response?.data || err.message || "Unknown error");
      setSuccessMessage(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="goals-container">
      <div className="goals-content">
        <h1 className="goals-header">Set Your Fitness Goals</h1>
        <p className="goals-subheader">Track your progress and achieve your fitness ambitions</p>

        {successMessage && (
          <div className={`success-message ${successMessage.includes("Failed") ? "error" : ""}`}>
            {successMessage}
          </div>
        )}

        <div className="goals-card">
          <div className="card-header">
            <div className="card-title">
              <FaDumbbell className="icon purple" />
              <span>My Fitness Profile</span>
            </div>
            <p className="card-description">Enter your current stats and what you aim to achieve</p>
          </div>

          <form onSubmit={handleSubmit} className="goals-form">
            <div className="form-grid">
              <div className="form-group">
                <label><FaCalendarAlt className="icon" /> Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={form.age} 
                  onChange={handleChange} 
                  placeholder="Enter your age"
                  className={errors.age ? "error" : ""} 
                />
                {errors.age && <span className="error-message">{errors.age}</span>}
              </div>

              <div className="form-group">
                <label><FaArrowUp className="icon" /> Height (cm)</label>
                <input 
                  type="number" 
                  name="height" 
                  value={form.height} 
                  onChange={handleChange} 
                  placeholder="Enter your height"
                  className={errors.height ? "error" : ""} 
                />
                {errors.height && <span className="error-message">{errors.height}</span>}
              </div>

              <div className="form-group">
                <label><FaWeight className="icon" /> Current Weight (kg)</label>
                <input 
                  type="number" 
                  name="currentWeight" 
                  value={form.currentWeight} 
                  onChange={handleChange} 
                  placeholder="Enter current weight"
                  className={errors.currentWeight ? "error" : ""} 
                />
                {errors.currentWeight && <span className="error-message">{errors.currentWeight}</span>}
              </div>

              <div className="form-group">
                <label><FaBullseye className="icon" /> Target Weight (kg)</label>
                <input 
                  type="number" 
                  name="targetWeight" 
                  value={form.targetWeight} 
                  onChange={handleChange} 
                  placeholder="Enter target weight"
                  className={errors.targetWeight ? "error" : ""} 
                />
                {errors.targetWeight && <span className="error-message">{errors.targetWeight}</span>}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label><FaCalendarAlt className="icon" /> Start Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={form.startDate} 
                  onChange={handleChange} 
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.startDate ? "error" : ""} 
                />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label><FaCalendarAlt className="icon" /> Target Date</label>
                <input 
                  type="date" 
                  name="targetDate" 
                  value={form.targetDate} 
                  onChange={handleChange} 
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  className={errors.targetDate ? "error" : ""} 
                />
                {errors.targetDate && <span className="error-message">{errors.targetDate}</span>}
              </div>
            </div>

            <div className="form-group">
              <label><FaRunning className="icon" /> Activity Level</label>
              <select
  name="activityLevel"
  value={form.activityLevel}
  onChange={handleChange}
  className={errors.activityLevel ? "error" : ""}
>
  <option value="">Select your activity level</option>
  {activityLevels.map(({ value, label }) => (
    <option key={value} value={value}>
      {label}
    </option>
  ))}
</select>

              {errors.activityLevel && <span className="error-message">{errors.activityLevel}</span>}
              <p className="hint-text">This helps us calculate your calorie needs accurately</p>
            </div>

            <div className="form-group">
              <label><FaDumbbell className="icon" /> Goal Type</label>
              <div className="goal-options">
                {goalOptions.map(goal => (
                  <div
                    key={goal.id}
                    className={`goal-option ${form.goalType === goal.id ? "selected" : ""}`}
                    onClick={() => setForm(prev => ({ ...prev, goalType: goal.id }))}
                  >
                    <div className="goal-icon">{goal.icon}</div>
                    <div className="goal-info">
                      <h4>{goal.label}</h4>
                      <p>{goal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.goalType && <span className="error-message">{errors.goalType}</span>}
            </div>

            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> 
                  Saving...
                </>
              ) : "Save My Goals"}
            </button>
          </form>

          <div className="card-footer">
            <p className="footer-text">
              Your information helps us provide personalized workout and nutrition recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;