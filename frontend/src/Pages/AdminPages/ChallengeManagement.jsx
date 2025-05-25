import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "../../components/Axiosinstance";
import "../../CSS/ChallengeManagement.css";

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    duration: "",
    difficulty: "beginner",
    muscle_group: "chest",
    workout_type: "strength",
    start_date: "",
    end_date: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get("/api/challenges/");
        setChallenges(response.data);
      } catch (err) {
        setError("Failed to fetch challenges");
        console.error(err);
        showNotification("Failed to fetch challenges", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, setter, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setter(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setter(prev => ({ ...prev, image: null }));
      setPreview(null);
    }
  };

  const resetForm = () => {
    setNewChallenge({
      title: "",
      description: "",
      duration: "",
      difficulty: "beginner",
      muscle_group: "chest",
      workout_type: "strength",
      start_date: "",
      end_date: "",
      image: null
    });
    setImagePreview(null);
  };

  const handleAddChallenge = async () => {
    if (!newChallenge.title || !newChallenge.duration || !newChallenge.start_date || !newChallenge.end_date) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(newChallenge).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value);
      });

      const response = await axios.post("/api/challenges/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setChallenges([response.data, ...challenges]);
      resetForm();
      setIsAdding(false);
      showNotification("Challenge added successfully!", "success");
    } catch (err) {
      console.error("Error adding challenge:", err.response?.data || err.message);
      let errorMessage = "Failed to add challenge";
      if (err.response?.data) {
        errorMessage = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n') || err.message;
      }
      showNotification(errorMessage, "error");
    }
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description || "",
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      muscle_group: challenge.muscle_group,
      workout_type: challenge.workout_type,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      image: null
    });
    setImagePreview(challenge.image_url || null);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleUpdateChallenge = async () => {
    if (!editingChallenge.title || !editingChallenge.duration || !editingChallenge.start_date || !editingChallenge.end_date) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(editingChallenge).forEach(([key, value]) => {
        if (key !== 'id' && value !== null) formData.append(key, value);
      });

      const response = await axios.put(`/api/challenges/${editingChallenge.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setChallenges(challenges.map(challenge => challenge.id === editingChallenge.id ? response.data : challenge));
      setEditingChallenge(null);
      setIsEditing(false);
      setImagePreview(null);
      showNotification("Challenge updated successfully!", "success");
    } catch (err) {
      console.error("Error updating challenge:", err.response?.data || err.message);
      let errorMessage = "Failed to update challenge";
      if (err.response?.data) {
        errorMessage = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n') || err.message;
      }
      showNotification(errorMessage, "error");
    }
  };

  const handleDeleteChallenge = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await axios.delete(`/api/challenges/${id}/`);
      setChallenges(challenges.filter(challenge => challenge.id !== id));
      showNotification("Challenge deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting challenge:", err.response?.data || err.message);
      showNotification("Failed to delete challenge", "error");
    }
  };

  if (isLoading) return <div className="loading">Loading challenges...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="challenge-management">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="header">
        <h2>Challenges</h2>
        {!isAdding && !isEditing && (
          <button className="add-button" onClick={() => setIsAdding(true)}>
            <FaPlus /> Add Challenge
          </button>
        )}
      </div>

      {isAdding && (
        <div className="add-form">
          <h3>Add New Challenge</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={newChallenge.title}
                onChange={(e) => handleInputChange(e, setNewChallenge)}
                placeholder="Challenge Title"
                required
              />
            </div>
            <div className="form-group">
              <label>Difficulty*</label>
              <select
                name="difficulty"
                value={newChallenge.difficulty}
                onChange={(e) => handleInputChange(e, setNewChallenge)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advance">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration*</label>
              <input
                type="text"
                name="duration"
                value={newChallenge.duration}
                onChange={(e) => handleInputChange(e, setNewChallenge)}
                placeholder="e.g., 30 days"
                required
              />
            </div>
            <div className="form-group">
              <label>Muscle Group*</label>
              <select
                name="muscle_group"
                value={newChallenge.muscle_group}
                onChange={(e) => handleInputChange(e, setNewChallenge)}
              >
                <option value="chest">Chest</option>
                <option value="core">Core</option>
                <option value="full-body">Full Body</option>
              </select>
            </div>
            <div className="form-group">
              <label>Workout Type*</label>
              <select
                name="workout_type"
                value={newChallenge.workout_type}
                onChange={(e) => handleInputChange(e, setNewChallenge)}
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date*</label>
              <input
                type="date"
                name="start_date"
                value={newChallenge.start_date}
                onChange={(e) => handleInputChange(e, setNewChallenge)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date*</label>
              <input
                type="date"
                name="end_date"
                value={newChallenge.end_date}
                onChange={(e) => handleInputChange(e, setNewChallenge)}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Challenge Image</label>
              <input
                type="file"
                name="image"
                onChange={(e) => handleImageChange(e, setNewChallenge, setImagePreview)}
                accept="image/*"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="preview-image"
                  />
                </div>
              )}
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={newChallenge.description}
                onChange={(e) => handleInputChange(e, setNewChallenge)}
                placeholder="Challenge description and rules"
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="cancel-button" onClick={() => {
              setIsAdding(false);
              resetForm();
            }}>
              Cancel
            </button>
            <button className="submit-button" onClick={handleAddChallenge}>
              Add Challenge
            </button>
          </div>
        </div>
      )}

      {isEditing && editingChallenge && (
        <div className="add-form">
          <h3>Edit Challenge</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={editingChallenge.title}
                onChange={(e) => handleInputChange(e, setEditingChallenge)}
                placeholder="Challenge Title"
                required
              />
            </div>
            <div className="form-group">
              <label>Difficulty*</label>
              <select
                name="difficulty"
                value={editingChallenge.difficulty}
                onChange={(e) => handleInputChange(e, setEditingChallenge)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advance">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration*</label>
              <input
                type="text"
                name="duration"
                value={editingChallenge.duration}
                onChange={(e) => handleInputChange(e, setEditingChallenge)}
                placeholder="e.g., 30 days"
                required
              />
            </div>
            <div className="form-group">
              <label>Muscle Group*</label>
              <select
                name="muscle_group"
                value={editingChallenge.muscle_group}
                onChange={(e) => handleInputChange(e, setEditingChallenge)}
              >
                <option value="chest">Chest</option>
                <option value="core">Core</option>
                <option value="full-body">Full Body</option>
              </select>
            </div>
            <div className="form-group">
              <label>Workout Type*</label>
              <select
                name="workout_type"
                value={editingChallenge.workout_type}
                onChange={(e) => handleInputChange(e, setEditingChallenge)}
              >
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date*</label>
              <input
                type="date"
                name="start_date"
                value={editingChallenge.start_date}
                onChange={(e) => handleInputChange(e, setEditingChallenge)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date*</label>
              <input
                type="date"
                name="end_date"
                value={editingChallenge.end_date}
                onChange={(e) => handleInputChange(e, setEditingChallenge)}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Challenge Image (leave blank to keep existing)</label>
              <input
                type="file"
                name="image"
                onChange={(e) => handleImageChange(e, setEditingChallenge, setImagePreview)}
                accept="image/*"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="preview-image"
                  />
                </div>
              )}
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={editingChallenge.description}
                onChange={(e) => handleInputChange(e, setEditingChallenge)}
                placeholder="Challenge description and rules"
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="cancel-button" onClick={() => {
              setIsEditing(false);
              setEditingChallenge(null);
              setImagePreview(null);
            }}>
              Cancel
            </button>
            <button className="submit-button" onClick={handleUpdateChallenge}>
              Update Challenge
            </button>
          </div>
        </div>
      )}

      <div className="challenges-table-container">
        <table className="challenges-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Duration</th>
              <th>Type</th>
              <th>Muscle Group</th>
              <th>Dates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map(challenge => (
              <tr key={challenge.id}>
                <td>
                  {challenge.image_url && (
                    <img 
                      src={challenge.image_url} 
                      alt={challenge.title} 
                      className="challenge-image"
                    />
                  )}
                </td>
                <td>{challenge.title}</td>
                <td className="capitalize">{challenge.difficulty}</td>
                <td>{challenge.duration}</td>
                <td className="capitalize">{challenge.workout_type}</td>
                <td className="capitalize">{challenge.muscle_group.replace('-', ' ')}</td>
                <td>
                  {new Date(challenge.start_date).toLocaleDateString()} -{" "}
                  {new Date(challenge.end_date).toLocaleDateString()}
                </td>
                <td className="actions">
                  <button 
                    className="edit-button" 
                    title="Edit"
                    onClick={() => handleEditChallenge(challenge)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="delete-button"
                    title="Delete"
                    onClick={() => handleDeleteChallenge(challenge.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChallengeManagement;