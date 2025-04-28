import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./ExerciseManagement.css";
import AxiosInstance from "./Axiosinstance";

const ExerciseManagement = () => {
  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState({ 
    name: "", 
    description: "",
    calories_burned: "",
    muscle_group: "fullbody",
    difficulty: "intermediate",
    equipment: "none",
    image: null
  });
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      const response = await AxiosInstance.get('api/exercises/');
      setExercises(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      showNotification("Failed to load exercises. Please try again.", "error");
      setIsLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExercise(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setNewExercise(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewExercise(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleAddExercise = async () => {
    if (!newExercise.name || !newExercise.muscle_group) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newExercise.name);
      formData.append('description', newExercise.description);
      if (newExercise.calories_burned) {
        formData.append('calories_burned', newExercise.calories_burned);
      }
      formData.append('muscle_group', newExercise.muscle_group);
      formData.append('difficulty', newExercise.difficulty);
      formData.append('equipment', newExercise.equipment);
      if (newExercise.image) {
        formData.append('image', newExercise.image);
      }

      const response = await AxiosInstance.post('api/exercises/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setExercises([...exercises, response.data]);
      resetForm();
      setIsAdding(false);
      showNotification("Exercise added successfully!", "success");
    } catch (error) {
      console.error("Error adding exercise:", error);
      let errorMessage = "Failed to add exercise";
      if (error.response) {
        // Handle different types of error responses
        if (error.response.data && typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        } else if (error.response.data) {
          errorMessage = error.response.data;
        }
      }
      showNotification(errorMessage, "error");
    }
  };

  const resetForm = () => {
    setNewExercise({ 
      name: "", 
      description: "",
      calories_burned: "",
      muscle_group: "fullbody",
      difficulty: "intermediate",
      equipment: "none",
      image: null
    });
  };

  const handleDeleteExercise = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exercise?")) {
      return;
    }

    try {
      await AxiosInstance.delete(`api/exercises/${id}/`);
      setExercises(exercises.filter(exercise => exercise.id !== id));
      showNotification("Exercise deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting exercise:", error);
      showNotification("Failed to delete exercise. Please try again.", "error");
    }
  };

  return (
    <div className="exercise-management">
      {/* Notification Banner */}
      {notification.show && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="management-header">
        <h2>Exercises</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="add-exercise-btn"
          >
            <FaPlus className="icon" />
            Add Exercise
          </button>
        )}
      </div>

      {isAdding && (
        <div className="add-exercise-form">
          <h3>Add New Exercise</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Exercise Name*</label>
              <input 
                id="name"
                name="name"
                value={newExercise.name}
                onChange={handleInputChange}
                placeholder="Exercise Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="muscle_group">Muscle Group*</label>
              <select
                id="muscle_group"
                name="muscle_group"
                value={newExercise.muscle_group}
                onChange={handleSelectChange}
                required
              >
                <option value="fullbody">Full Body</option>
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="legs">Legs</option>
                <option value="shoulders">Shoulders</option>
                <option value="arms">Arms</option>
                <option value="core">Core</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                name="difficulty"
                value={newExercise.difficulty}
                onChange={handleSelectChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advance">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="equipment">Equipment Required</label>
              <select
                id="equipment"
                name="equipment"
                value={newExercise.equipment}
                onChange={handleSelectChange}
              >
                <option value="none">No Equipment Needed</option>
                <option value="dumbells">Dumbells</option>
                <option value="pull_up">Pull Up Bar</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="calories_burned">Calories Burned (per minute)</label>
              <input 
                type="number"
                id="calories_burned"
                name="calories_burned"
                value={newExercise.calories_burned}
                onChange={handleInputChange}
                placeholder="Estimated calories burned"
                step="0.1"
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="image">Exercise Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {newExercise.image && (
                <div className="image-preview">
                  <p>Selected: {newExercise.image.name}</p>
                </div>
              )}
            </div>
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description"
                name="description"
                value={newExercise.description}
                onChange={handleInputChange}
                placeholder="Exercise description and instructions"
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="submit-btn"
              onClick={handleAddExercise}
            >
              Add Exercise
            </button>
          </div>
        </div>
      )}

      <div className="exercises-table-container">
        {isLoading ? (
          <div className="loading-message">Loading exercises...</div>
        ) : exercises.length === 0 ? (
          <div className="no-data-message">No exercises found</div>
        ) : (
          <table className="exercises-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Muscle Group</th>
                <th>Difficulty</th>
                <th>Equipment</th>
                <th>Calories</th>
                <th>Image</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map(exercise => (
                <tr key={exercise.id}>
                  <td>{exercise.name}</td>
                  <td>{exercise.muscle_group}</td>
                  <td>{exercise.difficulty}</td>
                  <td>{exercise.equipment}</td>
                  <td>{exercise.calories_burned || '-'}</td>
                  <td>
                    {exercise.image && (
                      <img 
                        src={exercise.image} 
                        alt={exercise.name} 
                        className="exercise-thumbnail"
                      />
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn">
                        <FaEdit className="icon" />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteExercise(exercise.id)}
                      >
                        <FaTrash className="icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExerciseManagement;