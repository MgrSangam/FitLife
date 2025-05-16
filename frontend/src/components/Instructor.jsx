import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaDumbbell, 
  FaUtensils, 
  FaUsers, 
  FaPhone, 
  FaBirthdayCake,
  FaCalendarAlt,
  FaUserTie,
  FaComments
} from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import "./Instructor.css";

const Instructor = () => {
  const navigate = useNavigate();
  const [instructorData, setInstructorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user?.is_instructor) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await AxiosInstance.get('/api/instructor/dashboard/');
        
        const clients = response.data.clients || [];
        
        setInstructorData({
          ...response.data,
          clients: clients.map(client => ({
            ...client,
            username: client.username || '',
            email: client.email || '',
            age: client.age || null
          }))
        });
      } catch (err) {
        const errorMessage = err.response?.data?.error || 
                           err.message || 
                           "Failed to fetch instructor data";
        setError(errorMessage);
        console.error("Error details:", err.response?.data);
        
        if (err.response?.status === 403) {
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [navigate]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await AxiosInstance.get('/api/chat/');
        setClients(response.data);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchClients();
  }, []);

  const handleClientClick = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <strong>Error: </strong>
          <span>{error}</span>
        </div>
 Focal point: Instructor dashboard
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!instructorData) return null;

  return (
    <div className="instructor-dashboard">
      <section className="instructor-profile">
        <div className="profile-card">
          <header className="profile-header">
            <div className="profile-icon">
              {instructorData.specialization === "trainer" ? (
                <FaDumbbell />
              ) : (
                <FaUtensils />
              )}
            </div>
            <div className="profile-info">
              <h2>{instructorData.username || instructorData.email}</h2>
              <p className="specialization">
                {instructorData.specialization} • {instructorData.experience}
              </p>
            </div>
          </header>

          {instructorData.bio && (
            <div className="bio-section">
              <h3>About Me</h3>
              <p>{instructorData.bio}</p>
            </div>
          )}

          <div className="stats-container">
            <div className="stats-grid">
              {instructorData.contact && (
                <div className="stat-card">
                  <FaPhone className="stat-icon" />
                  <div>
                    <label>Contact</label>
                    <p>{instructorData.contact}</p>
                  </div>
                </div>
              )}
              
              {instructorData.birthday && (
                <div className="stat-card">
                  <FaBirthdayCake className="stat-icon" />
                  <div>
                    <label>Birthday</label>
                    <p>{new Date(instructorData.birthday).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              
              {instructorData.age && (
                <div className="stat-card">
                  <FaUserTie className="stat-icon" />
                  <div>
                    <label>Age</label>
                    <p>{instructorData.age}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="quick-stats-card">
          <h3>Quick Stats</h3>
          <div className="stats-list">
            <div className="stat-item">
              <FaUsers className="stat-icon" />
              <div>
                <label>Assigned Clients</label>
                <p>{instructorData.assigned_clients_count || 0}</p>
              </div>
            </div>
            <div className="stat-item">
              <FaCalendarAlt className="stat-icon" />
              <div>
                <label>Experience</label>
                <p>{instructorData.experience || "Not specified"}</p>
              </div>
            </div>
            <div className="stat-item">
              {instructorData.specialization === "trainer" ? (
                <FaDumbbell className="stat-icon" />
              ) : (
                <FaUtensils className="stat-icon" />
              )}
              <div>
                <label>Specialization</label>
                <p>{instructorData.specialization || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="action-buttons">
        {instructorData.specialization?.toLowerCase() === "trainer" && (
          <button
            onClick={() => navigate("/create-plan")}
            className="btn btn-primary"
          >
            <FaDumbbell />
            <span>Create Fitness Plan</span>
          </button>
        )}
        {instructorData.specialization?.toLowerCase() === "nutritionist" && (
          <button
            onClick={() => navigate("/create-meal")}
            className="btn btn-success"
          >
            <FaUtensils />
            <span>Create Meal Plan</span>
          </button>
        )}
      </div>

      {clients.length > 0 && (
        <div className="clients-section">
          <h3>Your Clients</h3>
          <div className="clients-list">
            {clients.map((client) => (
              <div key={client.id} className="client-card">
                <div className="client-info">
                  <h4>{client.username}</h4>
                  <p>{client.email}</p>
                </div>
                <button 
                  className="chat-btn"
                  onClick={() => navigate(`/chat/${client.id}`)}
                >
                  <FaComments /> Message
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Instructor;