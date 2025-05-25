import React, { useState, useEffect } from "react";
import { FaUserPlus, FaEdit, FaTrash } from "react-icons/fa";
import AxiosInstance from '../../components/Axiosinstance';
import "../../CSS/InstructorManagement.css";

const InstructorManagement = () => {
  const [instructors, setInstructors] = useState([]);
  const [newInstructor, setNewInstructor] = useState({
    username: "",
    email: "",
    password: "",
    contact: "",
    experience: "",
    bio: "",
    specialization: "",
    is_instructor: true
  });
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await AxiosInstance.get("/instructors/");
      console.log("Fetched instructors:", response.data);
      setInstructors(response.data);
    } catch (error) {
      console.error("Error fetching instructors:", error.response?.data || error.message);
      showNotification("Failed to fetch instructors", "error");
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

  const handleAddInstructor = async () => {
    if (
      !newInstructor.username ||
      !newInstructor.email ||
      !newInstructor.password ||
      !["trainer", "nutritionist"].includes(newInstructor.specialization)
    ) {
      showNotification("Username, email, password, and a valid specialization are required", "error");
      return;
    }

    const payload = {
      ...newInstructor,
      is_instructor: true,
      specialization: newInstructor.specialization || null,
    };

    try {
      console.log("Instructor to add:", payload);
      await AxiosInstance.post("/instructors/", payload);
      fetchInstructors();
      setNewInstructor({
        username: "",
        email: "",
        password: "",
        contact: "",
        experience: "",
        bio: "",
        specialization: "",
        is_instructor: true
      });
      setIsAdding(false);
      showNotification("Instructor added successfully!", "success");
    } catch (error) {
      console.error("Error adding instructor:", error.response?.data);
      showNotification(`Failed to add instructor: ${JSON.stringify(error.response?.data)}`, "error");
    }
  };

  const handleEditInstructor = (instructor) => {
    setEditingInstructor({
      id: instructor.id,
      username: instructor.username,
      email: instructor.email,
      password: "", // Password is not fetched; leave empty for security
      contact: instructor.contact || "",
      experience: instructor.experience || "",
      bio: instructor.bio || "",
      specialization: instructor.specialization || "",
      is_instructor: true
    });
    setIsAdding(false); // Ensure add form is hidden
  };

  const handleUpdateInstructor = async () => {
    if (
      !editingInstructor.username ||
      !editingInstructor.email ||
      !["trainer", "nutritionist"].includes(editingInstructor.specialization)
    ) {
      showNotification("Username, email, and a valid specialization are required", "error");
      return;
    }

    const payload = {
      ...editingInstructor,
      is_instructor: true,
      specialization: editingInstructor.specialization || null,
      // Only include password if provided
      ...(editingInstructor.password && { password: editingInstructor.password }),
    };

    try {
      console.log("Instructor to update:", payload);
      await AxiosInstance.put(`/instructors/${editingInstructor.id}/`, payload);
      fetchInstructors();
      setEditingInstructor(null);
      showNotification("Instructor updated successfully!", "success");
    } catch (error) {
      console.error("Error updating instructor:", error.response?.data);
      showNotification(`Failed to update instructor: ${JSON.stringify(error.response?.data)}`, "error");
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
        {!isAdding && !editingInstructor && (
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
              onChange={(e) => handleInputChange(e, setNewInstructor)}
            />
            <FormField
              id="email"
              label="Email"
              type="email"
              value={newInstructor.email}
              onChange={(e) => handleInputChange(e, setNewInstructor)}
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              value={newInstructor.password}
              onChange={(e) => handleInputChange(e, setNewInstructor)}
            />
            <FormField
              id="contact"
              label="Contact"
              value={newInstructor.contact}
              onChange={(e) => handleInputChange(e, setNewInstructor)}
            />
            <FormField
              id="experience"
              label="Experience"
              value={newInstructor.experience}
              onChange={(e) => handleInputChange(e, setNewInstructor)}
            />
            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <select
                id="specialization"
                name="specialization"
                value={newInstructor.specialization}
                onChange={(e) => handleInputChange(e, setNewInstructor)}
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
                onChange={(e) => handleInputChange(e, setNewInstructor)}
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

      {editingInstructor && (
        <div className="add-instructor-form">
          <h3>Edit Instructor</h3>
          <div className="form-grid">
            <FormField
              id="username"
              label="Username"
              value={editingInstructor.username}
              onChange={(e) => handleInputChange(e, setEditingInstructor)}
            />
            <FormField
              id="email"
              label="Email"
              type="email"
              value={editingInstructor.email}
              onChange={(e) => handleInputChange(e, setEditingInstructor)}
            />
            <FormField
              id="password"
              label="Password (leave blank to keep unchanged)"
              type="password"
              value={editingInstructor.password}
              onChange={(e) => handleInputChange(e, setEditingInstructor)}
            />
            <FormField
              id="contact"
              label="Contact"
              value={editingInstructor.contact}
              onChange={(e) => handleInputChange(e, setEditingInstructor)}
            />
            <FormField
              id="experience"
              label="Experience"
              value={editingInstructor.experience}
              onChange={(e) => handleInputChange(e, setEditingInstructor)}
            />
            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <select
                id="specialization"
                name="specialization"
                value={editingInstructor.specialization}
                onChange={(e) => handleInputChange(e, setEditingInstructor)}
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
                value={editingInstructor.bio}
                onChange={(e) => handleInputChange(e, setEditingInstructor)}
                placeholder="Brief bio (max 500 characters)"
                rows="3"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setEditingInstructor(null)}>
              Cancel
            </button>
            <button className="submit-btn" onClick={handleUpdateInstructor}>
              Update Instructor
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
                    <button
                      className="edit-btn"
                      onClick={() => handleEditInstructor(instructor)}
                    >
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
      required={type !== "password"} // Password not required for edit
    />
  </div>
);

export default InstructorManagement;