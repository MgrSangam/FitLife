import React, { useState, useEffect } from "react";
import AxiosInstance from "../../components/Axiosinstance";
import { FaUsers, FaCalendarAlt, FaTrophy, FaVideo, FaUserPlus } from "react-icons/fa";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_users: 0,
    active_plans: 0,
    ongoing_challenges: 0,
    recent_content: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await AxiosInstance.get("/api/admin/dashboard/");
        console.log("Dashboard data:", response.data);
        setMetrics({
          total_users: response.data.total_users || 0,
          active_plans: response.data.active_plans || 0,
          ongoing_challenges: response.data.ongoing_challenges || 0,
          recent_content: response.data.recent_content || 0,
        });
        setRecentActivities(response.data.recent_activities || []);
      } catch (err) {
        const errorMessage = err.response
          ? `Error ${err.response.status}: ${err.response.data?.detail || "Unknown error"}`
          : `Network error: ${err.message}`;
        console.error("Fetch error:", err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <div className="metrics-grid">
        <div className="metric-card">
          <FaUsers className="metric-icon" />
          <div className="metric-content">
            <h3>Total Users</h3>
            <p>{metrics.total_users}</p>
          </div>
        </div>
        <div className="metric-card">
          <FaCalendarAlt className="metric-icon" />
          <div className="metric-content">
            <h3>Active Plans</h3>
            <p>{metrics.active_plans}</p>
          </div>
        </div>
        <div className="metric-card">
          <FaTrophy className="metric-icon" />
          <div className="metric-content">
            <h3>Ongoing Challenges</h3>
            <p>{metrics.ongoing_challenges}</p>
          </div>
        </div>
        <div className="metric-card">
          <FaVideo className="metric-icon" />
          <div className="metric-content">
            <h3>Recent Content</h3>
            <p>{metrics.recent_content}</p>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h3>Recent Activities</h3>
        <div className="activity-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">{activity.icon || <FaUserPlus />}</span>
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>No recent activities.</p>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-button">
          <FaUserPlus />
          <span>Add New User</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;