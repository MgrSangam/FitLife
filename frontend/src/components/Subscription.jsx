import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import axiosInstance from "./Axiosinstance"; 
import "./Subscription.css";

const Subscription = () => {
  
  const handleSubscription = async (plan) => {
    try {
      const response = await axiosInstance.post("/subscriptions/", { plan });
      // Redirect to payment page (mock for now)
      window.location.href = "/payment"; 
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Failed to start subscription. Please try again!");
    }
  };

  return (
    <div className="subscription-container">
      <div className="subscription-content">
        <h1 className="subscription-heading">Take Your Fitness Journey to the Next Level!</h1>
        <h2 className="subscription-heading-sub">Choose the perfect plan for your needs.</h2>

        <div className="subscription-grid">
          {/* Basic Plan */}
          <div className="plan-card basic-card">
            <h2 className="subscription-type">Basic Plan</h2>
            <h3 className="subscription-pricing">
              <span className="money">Rs. 0</span> /month
            </h3>
            <div className="feature-list">
              <span className="list-item"><FaCheckCircle /> Create Fitness Plans</span>
              <span className="list-item"><FaCheckCircle /> Create Meal Plans</span>
            </div>
            <button 
              className="action-button basic-button"
              onClick={() => handleSubscription("basic")}
            >
              Start Free
            </button>
          </div>

          {/* Premium Plan */}
          <div className="plan-card premium-card">
            <h2 className="subscription-type">Premium Plan</h2>
            <h3 className="subscription-pricing">
              <span className="money">Rs. 500</span> /month
            </h3>
            <div className="feature-list">
              <span className="list-item"><FaCheckCircle /> Create Fitness Plans</span>
              <span className="list-item"><FaCheckCircle /> Create Meal Plans</span>
              <span className="list-item"><FaCheckCircle /> Assigned Trainer & Nutritionist</span>
            </div>
            <button 
              className="action-button premium-button"
              onClick={() => handleSubscription("premium")}
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
