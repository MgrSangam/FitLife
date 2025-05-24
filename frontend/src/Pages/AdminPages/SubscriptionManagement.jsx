import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../../CSS/SubscriptionManagement.css";
import AxiosInstance from "../../components/Axiosinstance";

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [newSubscription, setNewSubscription] = useState({
    user: "",
    plan: "premium",
    is_active: false,
    start_date: "",
    end_date: "",
    trainer: "",
    nutritionist: ""
  });
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);

  useEffect(() => {
    fetchSubscriptions();
    fetchUsers();
    fetchInstructors();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await AxiosInstance.get('subscriptions/');
      setSubscriptions(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      showNotification("Failed to load subscriptions. Please try again.", "error");
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await AxiosInstance.get('api/users/');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Failed to load users. Please try again.", "error");
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await AxiosInstance.get('instructors/');
      const instructors = response.data;
      setTrainers(instructors.filter(i => i.specialization === 'trainer'));
      setNutritionists(instructors.filter(i => i.specialization === 'nutritionist'));
    } catch (error) {
      console.error("Error fetching instructors:", error);
      showNotification("Failed to load instructors. Please try again.", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubscription(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubscription = async () => {
    if (!newSubscription.user || !newSubscription.plan) {
      showNotification("Please select a user and plan", "error");
      return;
    }

    try {
      const response = await AxiosInstance.post('subscriptions/', {
        user: newSubscription.user,
        plan: newSubscription.plan,
        trainer: newSubscription.trainer || null,
        nutritionist: newSubscription.nutritionist || null
      });

      setSubscriptions([...subscriptions, response.data]);
      resetForm();
      setIsAdding(false);
      showNotification("Subscription added successfully!", "success");
    } catch (error) {
      console.error("Error adding subscription:", error);
      let errorMessage = "Failed to add subscription";
      if (error.response?.data) {
        errorMessage = typeof error.response.data === 'object'
          ? Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')
          : error.response.data;
      }
      showNotification(errorMessage, "error");
    }
  };

  const handleDeleteSubscription = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription?")) {
      return;
    }

    try {
      await AxiosInstance.delete(`subscriptions/${id}/`);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      showNotification("Subscription deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting subscription:", error);
      showNotification("Failed to delete subscription. Please try again.", "error");
    }
  };

  const resetForm = () => {
    setNewSubscription({
      user: "",
      plan: "premium",
      is_active: false,
      start_date: "",
      end_date: "",
      trainer: "",
      nutritionist: ""
    });
  };

  return (
    <div className="subscription-management">
      {notification.show && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="management-header">
        <h2>Subscriptions</h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="add-subscription-btn"
          >
            <FaPlus className="icon" />
            Add Subscription
          </button>
        )}
      </div>

      {isAdding && (
        <div className="add-subscription-form">
          <h3>Add New Subscription</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="user">User*</label>
              <select
                id="user"
                name="user"
                value={newSubscription.user}
                onChange={handleInputChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.email}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="plan">Plan*</label>
              <select
                id="plan"
                name="plan"
                value={newSubscription.plan}
                onChange={handleInputChange}
                required
              >
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="trainer">Trainer</label>
              <select
                id="trainer"
                name="trainer"
                value={newSubscription.trainer}
                onChange={handleInputChange}
              >
                <option value="">Select Trainer</option>
                {trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>{trainer.email}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="nutritionist">Nutritionist</label>
              <select
                id="nutritionist"
                name="nutritionist"
                value={newSubscription.nutritionist}
                onChange={handleInputChange}
              >
                <option value="">Select Nutritionist</option>
                {nutritionists.map(nutritionist => (
                  <option key={nutritionist.id} value={nutritionist.id}>{nutritionist.email}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="submit-btn"
              onClick={handleAddSubscription}
            >
              Add Subscription
            </button>
          </div>
        </div>
      )}

      <div className="subscriptions-table-container">
        {isLoading ? (
          <div className="loading-message">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="no-data-message">No subscriptions found</div>
        ) : (
          <table className="subscriptions-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Trainer</th>
                <th>Nutritionist</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <tr key={sub.id}>
                  <td>{sub.user?.email || 'N/A'}</td>
                  <td>{sub.plan}</td>
                  <td>{sub.is_active ? 'Active' : 'Inactive'}</td>
                  <td>{new Date(sub.start_date).toLocaleDateString()}</td>
                  <td>{new Date(sub.end_date).toLocaleDateString()}</td>
                  <td>{sub.trainer?.email || 'None'}</td>
                  <td>{sub.nutritionist?.email || 'None'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn">
                        <FaEdit className="icon" />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteSubscription(sub.id)}
                      >
                        <FaTrash className="icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;