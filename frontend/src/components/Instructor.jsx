import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Instructor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("authToken");

    // Redirect if user is not an instructor or not logged in
    if (!token || !user?.is_instructor) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, Instructor!</h1>
      <p className="text-gray-700">Here you can manage your assigned users, create plans, and track progress.</p>

      {/* Add instructor-specific UI here */}
      <div className="mt-6 space-y-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate("/create-plan")}
        >
          Create Fitness Plan
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => navigate("/create-meal")}
        >
          Create Meal Plan
        </button>
      </div>
    </div>
  );
};

export default Instructor;
