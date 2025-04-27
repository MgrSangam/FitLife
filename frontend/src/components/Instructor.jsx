import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDumbbell, FaUtensils, FaUsers, FaPhone, FaBirthdayCake } from "react-icons/fa";
import axiosInstance from "./Axiosinstance";
import "./Instructor.css";

const Instructor = () => {
  const navigate = useNavigate();
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user?.is_instructor) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await axiosInstance.get('/instructor');
        console.log("API Response:", response.data);  
        setInstructorData(response.data);
      } catch (err) {
        setError("Failed to fetch instructor data");
        console.error("Error fetching instructor data:", err);
        if (err.response?.status === 403) {
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <strong>Error: </strong>
        <span>{error}</span>
      </div>
    );
  }

  if (!instructorData) {
    return null;
  }

  return (
    <div className="instructor-container">
      <div className="profile-section">
        <div className="card">
          <div className="card-header">
            {instructorData.specialization === "trainer" ? (
              <FaDumbbell className="card-icon" />
            ) : (
              <FaUtensils className="card-icon" />
            )}
            <div>
              <h2 className="card-title">{instructorData.username || instructorData.email}</h2>
              <p className="card-subtitle">
                {instructorData.specialization} - {instructorData.experience}
              </p>
            </div>
          </div>
          
          {instructorData.bio && (
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">About Me</h3>
              <p className="text-gray-600">{instructorData.bio}</p>
            </div>
          )}

          <div className="stats-grid">
            {instructorData.contact && (
              <div className="stat-item">
                <FaPhone className="stat-icon" />
                <div>
                  <p className="stat-label">Contact</p>
                  <p className="stat-value">{instructorData.contact}</p>
                </div>
              </div>
            )}
            {instructorData.birthday && (
              <div className="stat-item">
                <FaBirthdayCake className="stat-icon" />
                <div>
                  <p className="stat-label">Birthday</p>
                  <p className="stat-value">{new Date(instructorData.birthday).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {instructorData.age && (
              <div className="stat-item">
                <div>
                  <p className="stat-label">Age</p>
                  <p className="stat-value">{instructorData.age}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <div>
                <p className="stat-label">Assigned Clients</p>
                <p className="stat-value">
                  {instructorData.assigned_clients_count || 0}
                </p>
              </div>
            </div>
            <div className="stat-item">
              <div>
                <p className="stat-label">Experience</p>
                <p className="stat-value">
                  {instructorData.experience || "Not specified"}
                </p>
              </div>
            </div>
            <div className="stat-item">
              <div>
                <p className="stat-label">Specialization</p>
                <p className="stat-value">
                  {instructorData.specialization || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        {instructorData.specialization?.toLowerCase() === "trainer" && (
          <button
            onClick={() => navigate("/create-plan")}
            className="action-button purple"
          >
            <FaDumbbell />
            Create Fitness Plan
          </button>
        )}
        {instructorData.specialization?.toLowerCase() === "nutritionist" && (
          <button
            onClick={() => navigate("/create-meal")}
            className="action-button green"
          >
            <FaUtensils />
            Create Meal Plan
          </button>
        )}
      </div>

      <div className="card">
        <h3 className="card-title mb-4">Your Clients</h3>
        {instructorData.clients && instructorData.clients.length > 0 ? (
          <div className="clients-grid">
            {instructorData.clients.map((client) => (
              <div key={client.id} className="client-card">
                <h4 className="client-name">{client.username || client.email}</h4>
                <p className="client-email">{client.email}</p>
                {client.age && <p className="client-age">Age: {client.age}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You don't have any assigned clients yet.</p>
        )}
      </div>
    </div>
  );
};

export default Instructor;