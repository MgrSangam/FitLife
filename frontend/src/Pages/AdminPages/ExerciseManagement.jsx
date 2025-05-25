import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../../CSS/ExerciseManagement.css";
import AxiosInstance from "../../components/Axiosinstance";

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
  const [editingExercise, setEditingExercise] = useState(null);
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

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, setter) => {
    setter(prev => ({ ...prev, image: e.target.files[0] }));
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

  const handleEditExercise = (exercise) => {
    setEditingExercise({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description || "",
      calories_burned: exercise.calories_burned || "",
      muscle_group: exercise.muscle_group,
      difficulty: exercise.difficulty,
      equipment: exercise.equipment,
      image: null // Image is not pre-filled; user can upload a new one
    });
    setIsAdding(false); // Ensure add form is hidden
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise.name || !editingExercise.muscle_group) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editingExercise.name);
      formData.append('description', editingExercise.description);
      if (editingExercise.calories_burned) {
        formData.append('calories_burned', editingExercise.calories_burned);
      }
      formData.append('muscle_group', editingExercise.muscle_group);
      formData.append('difficulty', editingExercise.difficulty);
      formData.append('equipment', editingExercise.equipment);
      if (editingExercise.image) {
        formData.append('image', editingExercise.image);
      }

      const response = await AxiosInstance.put(`api/exercises/${editingExercise.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setExercises(exercises.map(ex => ex.id === editingExercise.id ? response.data : ex));
      setEditingExercise(null);
      showNotification("Exercise updated successfully!", "success");
    } catch (error) {
      console.error("Error updating exercise:", error);
      let errorMessage = "Failed to update exercise";
      if (error.response) {
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

  return (
    <div className="exercise-management">
      {notification.show && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="management-header">
        <h2>Exercises</h2>
        {!isAdding && !editingExercise && (
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
                onChange={(e) => handleInputChange(e, setNewExercise)}
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
                onChange={(e) => handleSelectChange(e, setNewExercise)}
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
                onChange={(e) => handleSelectChange(e, setNewExercise)}
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
                onChange={(e) => handleSelectChange(e, setNewExercise)}
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
                onChange={(e) => handleInputChange(e, setNewExercise)}
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
                onChange={(e) => handleImageChange(e, setNewExercise)}
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
                onChange={(e) => handleInputChange(e, setNewExercise)}
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

      {editingExercise && (
        <div className="add-exercise-form">
          <h3>Edit Exercise</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Exercise Name*</label>
              <input 
                id="name"
                name="name"
                value={editingExercise.name}
                onChange={(e) => handleInputChange(e, setEditingExercise)}
                placeholder="Exercise Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="muscle_group">Muscle Group*</label>
              <select
                id="muscle_group"
                name="muscle_group"
                value={editingExercise.muscle_group}
                onChange={(e) => handleSelectChange(e, setEditingExercise)}
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
                value={editingExercise.difficulty}
                onChange={(e) => handleSelectChange(e, setEditingExercise)}
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
                value={editingExercise.equipment}
                onChange={(e) => handleSelectChange(e, setEditingExercise)}
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
                value={editingExercise.calories_burned}
                onChange={(e) => handleInputChange(e, setEditingExercise)}
                placeholder="Estimated calories burned"
                step="0.1"
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="image">Exercise Image (leave blank to keep existing)</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setEditingExercise)}
              />
              {editingExercise.image && (
                <div className="image-preview">
                  <p>Selected: {editingExercise.image.name}</p>
                </div>
              )}
            </div>
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description"
                name="description"
                value={editingExercise.description}
                onChange={(e) => handleInputChange(e, setEditingExercise)}
                placeholder="Exercise description and instructions"
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="button"
              className="cancel-btn"
              onClick={() => setEditingExercise(null)}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="submit-btn"
              onClick={handleUpdateExercise}
            >
              Update Exercise
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
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditExercise(exercise)}
                      >
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