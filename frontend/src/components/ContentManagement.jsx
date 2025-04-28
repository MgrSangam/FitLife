import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaVideo, FaFileAlt } from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import "./ContentManagement.css";

const ContentManagement = () => {
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState({
    title: "",
    description: "",
    content_type: "video",
    category: "workouts",
    video_url: "",
    blog_content: "",
    thumbnail: null
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("video");

  // In ContentManagement.js, change the fetch endpoint
useEffect(() => {
  const fetchContents = async () => {
    try {
      const response = await AxiosInstance.get("/education/"); // Changed from "/api/education/"
      setContents(response.data);
    } catch (err) {
      setError("Failed to fetch content");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchContents();
}, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContent(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewContent(prev => ({ ...prev, thumbnail: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddContent = async () => {
    if (!newContent.title || !newContent.description) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newContent.title);
      formData.append("description", newContent.description);
      formData.append("content_type", newContent.content_type);
      formData.append("category", newContent.category);
      
      if (newContent.content_type === "video") {
        formData.append("video_url", newContent.video_url);
      } else {
        formData.append("blog_content", newContent.blog_content);
      }
      
      if (newContent.thumbnail) {
        formData.append("thumbnail", newContent.thumbnail);
      }

      const response = await AxiosInstance.post("/education/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setContents([response.data, ...contents]);
      setNewContent({
        title: "",
        description: "",
        content_type: "video",
        category: "workouts",
        video_url: "",
        blog_content: "",
        thumbnail: null
      });
      setThumbnailPreview(null);
      setIsAdding(false);
      alert("Content added successfully!");
    } catch (err) {
      alert("Failed to add content");
      console.error(err);
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;

    try {
      await AxiosInstance.delete(`/education/${id}/`);
      setContents(contents.filter(content => content.id !== id));
      alert("Content deleted successfully!");
    } catch (err) {
      alert("Failed to delete content");
      console.error(err);
    }
  };

  if (isLoading) return <div className="loading">Loading content...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="content-management">
      <div className="header">
        <h2>Educational Content</h2>
        {!isAdding && (
          <button className="add-button" onClick={() => setIsAdding(true)}>
            <FaPlus /> Add Content
          </button>
        )}
      </div>

      <div className="tabs">
        <button 
          className={activeTab === "video" ? "active" : ""} 
          onClick={() => setActiveTab("video")}
        >
          <FaVideo /> Videos
        </button>
        <button 
          className={activeTab === "blog" ? "active" : ""} 
          onClick={() => setActiveTab("blog")}
        >
          <FaFileAlt /> Blogs
        </button>
      </div>

      {isAdding && (
        <div className="add-form">
          <h3>Add New Content</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Content Type*</label>
              <select
                name="content_type"
                value={newContent.content_type || "video"}
                onChange={handleInputChange}
              >
                <option value="video">Video</option>
                <option value="blog">Blog</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category*</label>
              <select
                name="category"
                value={newContent.category || "workouts"}
                onChange={handleInputChange}
              >
                <option value="workouts">Workouts</option>
                <option value="nutrition">Nutrition</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label>Title*</label>
              <input
                type="text"
                name="title"
                value={newContent.title || ""}
                onChange={handleInputChange}
                placeholder="Content Title"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Description*</label>
              <textarea
                name="description"
                value={newContent.description || ""}
                onChange={handleInputChange}
                placeholder="Content description"
                rows={3}
                required
              />
            </div>
            
            {newContent.content_type === "video" ? (
              <div className="form-group full-width">
                <label>Video URL*</label>
                <input
                  type="text"
                  name="video_url"
                  value={newContent.video_url || ""}
                  onChange={handleInputChange}
                  placeholder="Video URL"
                  required={newContent.content_type === "video"}
                />
              </div>
            ) : (
              <div className="form-group full-width">
                <label>Blog Content*</label>
                <textarea
                  name="blog_content"
                  value={newContent.blog_content || ""}
                  onChange={handleInputChange}
                  placeholder="Blog content"
                  rows={6}
                  required={newContent.content_type === "blog"}
                />
              </div>
            )}
            
            <div className="form-group full-width">
              <label>Thumbnail</label>
              <input
                type="file"
                name="thumbnail"
                onChange={handleThumbnailChange}
                accept="image/*"
              />
              {thumbnailPreview && (
                <div className="image-preview">
                  <img 
                    src={thumbnailPreview} 
                    alt="Preview" 
                    className="preview-image"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button className="cancel-button" onClick={() => {
              setIsAdding(false);
              setThumbnailPreview(null);
            }}>
              Cancel
            </button>
            <button className="submit-button" onClick={handleAddContent}>
              Add Content
            </button>
          </div>
        </div>
      )}

      <div className="content-table-container">
        <table className="content-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Views</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contents
              .filter(content => content.content_type === activeTab)
              .map(content => (
                <tr key={content.id}>
                  <td>
                    {content.thumbnail && (
                      <img 
                      src={content.thumbnail_url} 
                      alt={content.title} 
                      className="content-image"
                    />
                    
                    )}
                  </td>
                  <td>{content.title}</td>
                  <td className="capitalize">{content.content_type}</td>
                  <td className="capitalize">{content.category}</td>
                  <td>{content.views}</td>
                  <td>{content.rating?.toFixed(1) || 'N/A'}</td>
                  <td className="actions">
                    <button className="edit-button" title="Edit">
                      <FaEdit />
                    </button>
                    <button
                      className="delete-button"
                      title="Delete"
                      onClick={() => handleDeleteContent(content.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentManagement;