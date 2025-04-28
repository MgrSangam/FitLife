import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "./Axiosinstance";
import "./ChallengeManagement.css";

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
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

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await axios.get("/api/challenges/");
        setChallenges(response.data);
      } catch (err) {
        setError("Failed to fetch challenges");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChallenge(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewChallenge(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleAddChallenge = async () => {
    if (!newChallenge.title || !newChallenge.duration || !newChallenge.start_date || !newChallenge.end_date) {
      alert("Please fill all required fields");
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
      setIsAdding(false);
      alert("Challenge added successfully!");
    } catch (err) {
      alert("Failed to add challenge");
      console.error(err);
    }
  };

  const handleDeleteChallenge = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await axios.delete(`/api/challenges/${id}/`);
      setChallenges(challenges.filter(challenge => challenge.id !== id));
      alert("Challenge deleted successfully!");
    } catch (err) {
      alert("Failed to delete challenge");
      console.error(err);
    }
  };

  if (isLoading) return <div className="loading">Loading challenges...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="challenge-management">
      <div className="header">
        <h2>Challenges</h2>
        {!isAdding && (
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
                value={newChallenge.title || ""}
                onChange={handleInputChange}
                placeholder="Challenge Title"
                required
              />
            </div>
            <div className="form-group">
              <label>Difficulty*</label>
              <select
                name="difficulty"
                value={newChallenge.difficulty || "beginner"}
                onChange={handleInputChange}
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
                value={newChallenge.duration || ""}
                onChange={handleInputChange}
                placeholder="e.g., 30 days"
                required
              />
            </div>
            <div className="form-group">
              <label>Muscle Group*</label>
              <select
                name="muscle_group"
                value={newChallenge.muscle_group || "chest"}
                onChange={handleInputChange}
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
                value={newChallenge.workout_type || "strength"}
                onChange={handleInputChange}
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
                value={newChallenge.start_date || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date*</label>
              <input
                type="date"
                name="end_date"
                value={newChallenge.end_date || ""}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Challenge Image</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
             {newChallenge.image && (
  <div className="image-preview">
    <img 
      src={URL.createObjectURL(newChallenge.image)} 
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
                value={newChallenge.description || ""}
                onChange={handleInputChange}
                placeholder="Challenge description and rules"
                rows={3}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="cancel-button" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button className="submit-button" onClick={handleAddChallenge}>
              Add Challenge
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
                  <button className="edit-button" title="Edit">
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