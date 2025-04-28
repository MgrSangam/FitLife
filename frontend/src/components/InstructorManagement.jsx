import React, { useState, useEffect } from "react";
import { FaUserPlus, FaEdit, FaTrash } from "react-icons/fa";
import AxiosInstance from './Axiosinstance';  // Import AxiosInstance
import "./InstructorManagement.css";

const InstructorManagement = () => {
  const [instructors, setInstructors] = useState([]);
  const [newInstructor, setNewInstructor] = useState({
    username: "",
    email: "",
    password: "",
    contact: "",
    experience: "",
    bio: "",
    specialization: ""
  });
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await AxiosInstance.get("/instructors/");
      setInstructors(response.data);
    } catch (error) {
      showNotification("Failed to fetch instructors", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstructor(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInstructor = async () => {
    if (!newInstructor.username || !newInstructor.email || !newInstructor.password) {
      showNotification("Username, email, and password are required", "error");
      return;
    }

    try {
      await AxiosInstance.post("/instructors/", newInstructor);
      fetchInstructors();
      setNewInstructor({
        username: "",
        email: "",
        password: "",
        contact: "",
        experience: "",
        bio: "",
        specialization: ""
      });
      setIsAdding(false);
      showNotification("Instructor added successfully!", "success");
    } catch (error) {
      showNotification("Failed to add instructor", "error");
    }
  };

  const handleDeleteInstructor = async (id) => {
    try {
      await AxiosInstance.delete(`/instructors/${id}/`);
      setInstructors(instructors.filter(instructor => instructor.id !== id));
      showNotification("Instructor deleted successfully!", "success");
    } catch (error) {
      showNotification("Failed to delete instructor", "error");
    }
  };

  return (
    <div className="instructor-management">
      {notification.show && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="management-header">
        <h2>Instructors</h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="add-instructor-btn">
            <FaUserPlus className="icon" />
            Add Instructor
          </button>
        )}
      </div>

      {isAdding && (
        <div className="add-instructor-form">
          <h3>Add New Instructor</h3>
          <div className="form-grid">
            <FormField
              id="username"
              label="Username"
              value={newInstructor.username}
              onChange={handleInputChange}
            />
            <FormField
              id="email"
              label="Email"
              type="email"
              value={newInstructor.email}
              onChange={handleInputChange}
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              value={newInstructor.password}
              onChange={handleInputChange}
            />
            <FormField
              id="contact"
              label="Contact"
              value={newInstructor.contact}
              onChange={handleInputChange}
            />
            <FormField
              id="experience"
              label="Experience"
              value={newInstructor.experience}
              onChange={handleInputChange}
            />
            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <select
                id="specialization"
                name="specialization"
                value={newInstructor.specialization}
                onChange={handleInputChange}
              >
                <option value="">Select Specialization</option>
                <option value="trainer">Trainer</option>
                <option value="nutritionist">Nutritionist</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={newInstructor.bio}
                onChange={handleInputChange}
                placeholder="Brief bio (max 500 characters)"
                rows="3"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button className="submit-btn" onClick={handleAddInstructor}>
              Add Instructor
            </button>
          </div>
        </div>
      )}

      <div className="instructors-table-container">
        <table className="instructors-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Specialization</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor.id}>
                <td>{instructor.username}</td>
                <td>{instructor.email}</td>
                <td>{instructor.contact}</td>
                <td>{instructor.specialization === 'trainer' ? 'Trainer' : 'Nutritionist'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn">
                      <FaEdit className="icon" />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteInstructor(instructor.id)}
                    >
                      <FaTrash className="icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FormField = ({ id, label, value, onChange, type = "text" }) => (
  <div className="form-group">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={label}
      required
    />
  </div>
);

export default InstructorManagement;
