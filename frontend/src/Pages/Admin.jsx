import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaUsers, FaDumbbell, FaUtensils, FaCalendarAlt, FaTrophy, 
  FaVideo, FaFileAlt, FaUserPlus, FaSignOutAlt, FaTachometerAlt,
  FaUserCog, FaClipboardList
} from "react-icons/fa";
import "../CSS/Admin.css"; // Import CSS file

// Import admin panel components
import Dashboard from "./AdminPages/Dashboard";
import InstructorManagement from "./AdminPages/InstructorManagement";
import ExerciseManagement from "./AdminPages/ExerciseManagement";
import FoodManagement from "./AdminPages/FoodManagement";
import PlanManagement from "./AdminPages/PlanManagement";
import ChallengeManagement from "./AdminPages/ChallengeManagement";
import ContentManagement from "./AdminPages/ContentManagement";
import UserList from "./AdminPages/UserList";
import MealManagement from "./AdminPages/MealManagement";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt />, component: <Dashboard /> },
    { id: "instructors", label: "Instructors", icon: <FaUserCog />, component: <InstructorManagement /> },
    { id: "exercises", label: "Exercises", icon: <FaDumbbell />, component: <ExerciseManagement /> },
    { id: "food", label: "Food Items", icon: <FaUtensils />, component: <FoodManagement /> },
    { id: "plans", label: "Plans", icon: <FaCalendarAlt />, component: <PlanManagement /> },
    { id: "meals", label: "Meals", icon: <FaClipboardList />, component: <MealManagement /> },
    { id: "challenges", label: "Challenges", icon: <FaTrophy />, component: <ChallengeManagement /> },
    { id: "content", label: "Content", icon: <FaVideo />, component: <ContentManagement /> },
    { id: "users", label: "Users", icon: <FaUsers />, component: <UserList /> }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <div className="header-buttons">
          <Link to="/dashboard" className="dashboard-button">
            <FaTachometerAlt />
            <span>Dashboard</span>
          </Link>
          <Link to="/" className="logout-button">
            <FaSignOutAlt />
            <span>Logout</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <main className="admin-main">
          <div className="content-card">
            <div className="content-header">
              <h2 className="content-title">
                {activeTabData?.icon}
                {activeTabData?.label}
              </h2>
            </div>
            <div className="content-body">
              {activeTabData?.component}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;