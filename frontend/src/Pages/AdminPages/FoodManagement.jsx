import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "../../CSS/FoodManagement.css";
import AxiosInstance from "../../components/Axiosinstance";

const FoodManagement = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [newItem, setNewItem] = useState({ 
    name: "", 
    food_type: "", 
    protein: "", 
    carbs: "", 
    fat: "", 
    image: null
  });
  const [editingItem, setEditingItem] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setIsLoading(true);
      const response = await AxiosInstance.get('api/foods/');
      setFoodItems(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching food items:", error);
      showNotification("Failed to load food items", "error");
      setIsLoading(false);
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

  const handleSelectChange = (e, setter) => {
    setter(prev => ({ ...prev, food_type: e.target.value }));
  };

  const handleImageChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      setter(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddFoodItem = async () => {
    if (!newItem.name || !newItem.food_type) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newItem.name);
      formData.append('food_type', newItem.food_type);
      if (newItem.protein) formData.append('protein', newItem.protein);
      if (newItem.carbs) formData.append('carbs', newItem.carbs);
      if (newItem.fat) formData.append('fat', newItem.fat);
      if (newItem.image) formData.append('image', newItem.image);

      const response = await AxiosInstance.post('api/foods/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFoodItems([...foodItems, response.data]);
      resetForm();
      setIsAdding(false);
      showNotification("Food item added successfully!", "success");
    } catch (error) {
      console.error("Error adding food item:", error);
      let errorMessage = "Failed to add food item";
      if (error.response) {
        if (error.response.data && typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        } else if (error.response.data) {
          errorMessage = error.response.data;
        }
      }
      showNotification(errorMessage, "error");
    }
  };

  const handleEditFoodItem = (item) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      food_type: item.food_type,
      protein: item.protein || "",
      carbs: item.carbs || "",
      fat: item.fat || "",
      image: null // Image is not pre-filled; user can upload a new one
    });
    setImagePreview(item.image ? item.image : null);
    setIsAdding(false); // Ensure add form is hidden
  };

  const handleUpdateFoodItem = async () => {
    if (!editingItem.name || !editingItem.food_type) {
      showNotification("Please fill all required fields", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editingItem.name);
      formData.append('food_type', editingItem.food_type);
      if (editingItem.protein) formData.append('protein', editingItem.protein);
      if (editingItem.carbs) formData.append('carbs', editingItem.carbs);
      if (editingItem.fat) formData.append('fat', editingItem.fat);
      if (editingItem.image) formData.append('image', editingItem.image);

      const response = await AxiosInstance.put(`api/foods/${editingItem.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFoodItems(foodItems.map(item => item.id === editingItem.id ? response.data : item));
      setEditingItem(null);
      setImagePreview(null);
      showNotification("Food item updated successfully!", "success");
    } catch (error) {
      console.error("Error updating food item:", error);
      let errorMessage = "Failed to update food item";
      if (error.response) {
        if (error.response.data && typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        } else if (error.response.data) {
          errorMessage = error.response.data;
        }
      }
      showNotification(errorMessage, "error");
    }
  };

  const handleDeleteFoodItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this food item?")) {
      return;
    }

    try {
      await AxiosInstance.delete(`api/foods/${id}/`);
      setFoodItems(foodItems.filter(item => item.id !== id));
      showNotification("Food item deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting food item:", error);
      showNotification("Failed to delete food item", "error");
    }
  };

  const resetForm = () => {
    setNewItem({ 
      name: "", 
      food_type: "", 
      protein: "", 
      carbs: "", 
      fat: "", 
      image: null 
    });
    setImagePreview(null);
  };

  return (
    <div className="food-management">
      {notification.show && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="management-header">
        <h2>Food Items</h2>
        {!isAdding && !editingItem && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="add-food-btn"
          >
            <FaPlus className="icon" />
            Add Food Item
          </button>
        )}
      </div>

      {isAdding && (
        <div className="add-food-form">
          <h3>Add New Food Item</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Food Name*</label>
              <input 
                id="name"
                name="name"
                value={newItem.name}
                onChange={(e) => handleInputChange(e, setNewItem)}
                placeholder="Food Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="food_type">Food Type*</label>
              <select
                id="food_type"
                name="food_type"
                value={newItem.food_type}
                onChange={(e) => handleSelectChange(e, setNewItem)}
                required
              >
                <option value="">Select Category</option>
                <option value="fruit">Fruit</option>
                <option value="vegetable">Vegetable</option>
                <option value="grain">Grain / Cereal</option>
                <option value="protein">Protein (Meat, Fish, Eggs)</option>
                <option value="dairy">Dairy</option>
                <option value="fat">Fats & Oils</option>
                <option value="snack">Snacks</option>
                <option value="beverage">Beverages</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="protein">Protein (g per 100g)</label>
              <input 
                id="protein"
                name="protein"
                type="number"
                value={newItem.protein}
                onChange={(e) => handleInputChange(e, setNewItem)}
                placeholder="Protein content"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="carbs">Carbs (g per 100g)</label>
              <input 
                id="carbs"
                name="carbs"
                type="number"
                value={newItem.carbs}
                onChange={(e) => handleInputChange(e, setNewItem)}
                placeholder="Carbohydrate content"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fat">Fat (g per 100g)</label>
              <input 
                id="fat"
                name="fat"
                type="number"
                value={newItem.fat}
                onChange={(e) => handleInputChange(e, setNewItem)}
                placeholder="Fat content"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Food Image</label>
              <input 
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setNewItem)}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" style={{ width: "100px", height: "100px", marginTop: "10px", objectFit: "cover" }} />
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button 
              className="cancel-btn"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button 
              className="submit-btn"
              onClick={handleAddFoodItem}
            >
              Add Food Item
            </button>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="add-food-form">
          <h3>Edit Food Item</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Food Name*</label>
              <input 
                id="name"
                name="name"
                value={editingItem.name}
                onChange={(e) => handleInputChange(e, setEditingItem)}
                placeholder="Food Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="food_type">Food Type*</label>
              <select
                id="food_type"
                name="food_type"
                value={editingItem.food_type}
                onChange={(e) => handleSelectChange(e, setEditingItem)}
                required
              >
                <option value="">Select Category</option>
                <option value="fruit">Fruit</option>
                <option value="vegetable">Vegetable</option>
                <option value="grain">Grain / Cereal</option>
                <option value="protein">Protein (Meat, Fish, Eggs)</option>
                <option value="dairy">Dairy</option>
                <option value="fat">Fats & Oils</option>
                <option value="snack">Snacks</option>
                <option value="beverage">Beverages</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="protein">Protein (g per 100g)</label>
              <input 
                id="protein"
                name="protein"
                type="number"
                value={editingItem.protein}
                onChange={(e) => handleInputChange(e, setEditingItem)}
                placeholder="Protein content"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="carbs">Carbs (g per 100g)</label>
              <input 
                id="carbs"
                name="carbs"
                type="number"
                value={editingItem.carbs}
                onChange={(e) => handleInputChange(e, setEditingItem)}
                placeholder="Carbohydrate content"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fat">Fat (g per 100g)</label>
              <input 
                id="fat"
                name="fat"
                type="number"
                value={editingItem.fat}
                onChange={(e) => handleInputChange(e, setEditingItem)}
                placeholder="Fat content"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Food Image (leave blank to keep existing)</label>
              <input 
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, setEditingItem)}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" style={{ width: "100px", height: "100px", marginTop: "10px", objectFit: "cover" }} />
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button 
              className="cancel-btn"
              onClick={() => {
                setEditingItem(null);
                setImagePreview(null);
              }}
            >
              Cancel
            </button>
            <button 
              className="submit-btn"
              onClick={handleUpdateFoodItem}
            >
              Update Food Item
            </button>
          </div>
        </div>
      )}

      <div className="food-table-container">
        {isLoading ? (
          <div className="loading-message">Loading food items...</div>
        ) : foodItems.length === 0 ? (
          <div className="no-data-message">No food items found</div>
        ) : (
          <table className="food-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Calories</th>
                <th>Protein (g)</th>
                <th>Carbs (g)</th>
                <th>Fat (g)</th>
                <th>Image</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {foodItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.food_type}</td>
                  <td>{item.calories}</td>
                  <td>{item.protein || '-'}</td>
                  <td>{item.carbs || '-'}</td>
                  <td>{item.fat || '-'}</td>
                  <td>
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditFoodItem(item)}
                      >
                        <FaEdit className="icon" />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteFoodItem(item.id)}
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

export default FoodManagement;