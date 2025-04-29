import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import "./PlanManagement.css";

const PlanManagement = () => {
  const [fitnessPlans, setFitnessPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newFitnessPlan, setNewFitnessPlan] = useState({
    name: "",
    plan_type: "",
    duration_weeks: "",
    difficulty: "",
    description: "",
    picture: null,
    exercises: [{ exercise_id: "", day: "", sets: "", reps: "", duration_minutes: "", order: 0 }],
  });

  const [isAddingFitness, setIsAddingFitness] = useState(false);
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

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
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

  const fetchExercises = async () => {
    try {
      const response = await AxiosInstance.get("api/exercises/");
      setExercises(response.data);
    } catch (err) {
      setError("Failed to fetch exercises.");
      showNotification("Failed to fetch exercises.", "error");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFitnessPlans();
    fetchExercises();
  }, []);

  // Handle input changes
  const handleFitnessInputChange = (e) => {
    const { name, value } = e.target;
    setNewFitnessPlan((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFitnessPlan((prev) => ({ ...prev, picture: file }));
    }
  };

  const handleExerciseChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExercises = [...newFitnessPlan.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [name]: value };
    setNewFitnessPlan((prev) => ({ ...prev, exercises: updatedExercises }));
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
      const formData = new FormData();
      
      // Append basic fields
      formData.append('name', newFitnessPlan.name);
      formData.append('plan_type', newFitnessPlan.plan_type);
      formData.append('duration_weeks', Number(newFitnessPlan.duration_weeks));
      formData.append('difficulty', newFitnessPlan.difficulty);
      if (newFitnessPlan.description) {
        formData.append('description', newFitnessPlan.description);
      }
      
      // Append image if exists
      if (newFitnessPlan.picture) {
        formData.append('picture', newFitnessPlan.picture);
      }
      
      // Append exercises as JSON string
      const exercisesData = newFitnessPlan.exercises.map(ex => ({
        exercise: Number(ex.exercise_id),
        day: ex.day,
        sets: ex.sets === "" ? 0 : Number(ex.sets),
        reps: ex.reps === "" ? 0 : Number(ex.reps),
        duration_minutes: ex.duration_minutes ? Number(ex.duration_minutes) : null,
        order: ex.order || 0
    }));
    formData.append('exercises', JSON.stringify(exercisesData));
  
      const response = await AxiosInstance.post("api/fitness-plans/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFitnessPlans([...fitnessPlans, response.data]);
      setNewFitnessPlan({
        name: "",
        plan_type: "",
        duration_weeks: "",
        difficulty: "",
        description: "",
        picture: null,
        exercises: [{ exercise_id: "", day: "", sets: "", reps: "", duration_minutes: "", order: 0 }],
      });
      setIsAddingFitness(false);
      showNotification("Fitness plan added successfully!", "success");
      fetchFitnessPlans();
    } catch (err) {
      console.error("Error details:", err.response?.data);
      showNotification(`Failed to add fitness plan: ${JSON.stringify(err.response?.data) || err.message}`, "error");
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
                  <label>Plan Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {newFitnessPlan.picture && (
                    <div className="image-preview">
                      <img 
                        src={URL.createObjectURL(newFitnessPlan.picture)} 
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
                  <th>Image</th>
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
                    <td>
                      {plan.picture_url && (
                        <img 
                          src={plan.picture_url} 
                          alt={plan.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                    </td>
                    <td>{plan.name}</td>
                    <td>{plan.plan_type_display}</td>
                    <td>{plan.duration_weeks}</td>
                    <td>{plan.difficulty_display}</td>
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
      </div>
    </div>
  );
};

export default PlanManagement;