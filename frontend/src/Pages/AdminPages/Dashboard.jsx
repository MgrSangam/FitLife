import React, { useState, useEffect } from "react";
import AxiosInstance from "../../components/Axiosinstance";
import { FaUsers, FaCalendarAlt, FaTrophy, FaVideo, FaUtensils } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../CSS/Dashboard.css";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total_users: 0,
    total_meal_plans: 0,
    total_fitness_plans: 0,
    total_challenges: 0,
    total_contents: 0,
    most_joined_fitness_plans: [],
    most_joined_meal_plans: [],
    most_joined_challenges: [],
    most_viewed_contents: [],
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
          total_meal_plans: response.data.total_meal_plans || 0,
          total_fitness_plans: response.data.total_fitness_plans || 0,
          total_challenges: response.data.total_challenges || 0,
          total_contents: response.data.total_contents || 0,
          most_joined_fitness_plans: response.data.most_joined_fitness_plans || [],
          most_joined_meal_plans: response.data.most_joined_meal_plans || [],
          most_joined_challenges: response.data.most_joined_challenges || [],
          most_viewed_contents: response.data.most_viewed_contents || [],
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
          <FaUtensils className="metric-icon" />
          <div className="metric-content">
            <h3>Total Meal Plans</h3>
            <p>{metrics.total_meal_plans}</p>
          </div>
        </div>
        <div className="metric-card">
          <FaCalendarAlt className="metric-icon" />
          <div className="metric-content">
            <h3>Total Fitness Plans</h3>
            <p>{metrics.total_fitness_plans}</p>
          </div>
        </div>
        <div className="metric-card">
          <FaTrophy className="metric-icon" />
          <div className="metric-content">
            <h3>Total Challenges</h3>
            <p>{metrics.total_challenges}</p>
          </div>
        </div>
        <div className="metric-card">
          <FaVideo className="metric-icon" />
          <div className="metric-content">
            <h3>Total Contents</h3>
            <p>{metrics.total_contents}</p>
          </div>
        </div>
      </div>

      <div className="top-items-section">
        <div className="top-item">
          <h3>Most Joined Fitness Plans</h3>
          <ul className="top-item-list">
            {metrics.most_joined_fitness_plans.length > 0 ? (
              metrics.most_joined_fitness_plans.map((plan, index) => (
                <li key={index}>
                  {plan.name}: {plan.user_count} users
                </li>
              ))
            ) : (
              <p>No data available.</p>
            )}
          </ul>
        </div>
        <div className="top-item">
          <h3>Most Joined Meal Plans</h3>
          <ul className="top-item-list">
            {metrics.most_joined_meal_plans.length > 0 ? (
              metrics.most_joined_meal_plans.map((plan, index) => (
                <li key={index}>
                  {plan.name}: {plan.user_count} users
                </li>
              ))
            ) : (
              <p>No data available.</p>
            )}
          </ul>
        </div>
        <div className="top-item">
          <h3>Most Joined Challenges</h3>
          <ul className="top-item-list">
            {metrics.most_joined_challenges.length > 0 ? (
              metrics.most_joined_challenges.map((challenge, index) => (
                <li key={index}>
                  {challenge.title}: {challenge.participant_count} participants
                </li>
              ))
            ) : (
              <p>No data available.</p>
            )}
          </ul>
        </div>
        <div className="top-item">
          <h3>Most Viewed Contents</h3>
          <ul className="top-item-list">
            {metrics.most_viewed_contents.length > 0 ? (
              metrics.most_viewed_contents.map((content, index) => (
                <li key={index}>
                  {content.title}: {content.views} views
                </li>
              ))
            ) : (
              <p>No data available.</p>
            )}
          </ul>
        </div>
      </div>

      <div className="activity-section">
        <h3>Recent Activities</h3>
        <div className="activity-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
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
    </div>
  );
};

export default Dashboard;