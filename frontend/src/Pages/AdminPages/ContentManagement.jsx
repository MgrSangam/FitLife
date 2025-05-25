import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaVideo, FaFileAlt } from "react-icons/fa";
import AxiosInstance from "../../components/Axiosinstance";
import "../../CSS/ContentManagement.css";

const ContentManagement = () => {
  const [contents, setContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
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
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await AxiosInstance.get("/education/");
        setContents(response.data);
      } catch (err) {
        setError("Failed to fetch content");
        console.error("Error fetching contents:", err.response?.data || err.message);
        showNotification("Failed to fetch content", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContents();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e, setter, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setter(prev => ({ ...prev, thumbnail: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setter(prev => ({ ...prev, thumbnail: null }));
      setPreview(null);
    }
  };

  const resetForm = () => {
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
  };

  const handleAddContent = async () => {
    if (!newContent.title || !newContent.description) {
      showNotification("Please fill all required fields", "error");
      return;
    }
    if (newContent.content_type === "video" && !newContent.video_url) {
      showNotification("Video URL is required for video content", "error");
      return;
    }
    if (newContent.content_type === "blog" && !newContent.blog_content) {
      showNotification("Blog content is required for blog posts", "error");
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
      resetForm();
      setIsAdding(false);
      showNotification("Content added successfully!", "success");
    } catch (err) {
      console.error("Error adding content:", err.response?.data || err.message);
      let errorMessage = "Failed to add content";
      if (err.response?.data) {
        errorMessage = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n') || err.response.data.detail || err.message;
      }
      showNotification(errorMessage, "error");
    }
  };

  const handleEditContent = (content) => {
    setEditingContent({
      id: content.id,
      title: content.title,
      description: content.description,
      content_type: content.content_type,
      category: content.category,
      video_url: content.video_url || "",
      blog_content: content.blog_content || "",
      thumbnail: null
    });
    setThumbnailPreview(content.thumbnail_url || null);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleUpdateContent = async () => {
    if (!editingContent.title || !editingContent.description) {
      showNotification("Please fill all required fields", "error");
      return;
    }
    if (editingContent.content_type === "video" && !editingContent.video_url) {
      showNotification("Video URL is required for video content", "error");
      return;
    }
    if (editingContent.content_type === "blog" && !editingContent.blog_content) {
      showNotification("Blog content is required for blog posts", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", editingContent.title);
      formData.append("description", editingContent.description);
      formData.append("content_type", editingContent.content_type);
      formData.append("category", editingContent.category);
      if (editingContent.content_type === "video") {
        formData.append("video_url", editingContent.video_url);
      } else {
        formData.append("blog_content", editingContent.blog_content);
      }
      if (editingContent.thumbnail) {
        formData.append("thumbnail", editingContent.thumbnail);
      }

      const response = await AxiosInstance.put(`/education/${editingContent.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setContents(contents.map(content => content.id === editingContent.id ? response.data : content));
      setEditingContent(null);
      setIsEditing(false);
      setThumbnailPreview(null);
      showNotification("Content updated successfully!", "success");
    } catch (err) {
      console.error("Error updating content:", err.response?.data || err.message);
      let errorMessage = "Failed to update content";
      if (err.response?.data) {
        errorMessage = Object.entries(err.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n') || err.response.data.detail || err.message;
      }
      showNotification(errorMessage, "error");
    }
  };

  const handleDeleteContent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;

    try {
      await AxiosInstance.delete(`/education/${id}/`);
      setContents(contents.filter(content => content.id !== id));
      showNotification("Content deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting content:", err.response?.data || err.message);
      showNotification("Failed to delete content", "error");
    }
  };

  if (isLoading) return <div className="loading">Loading content...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="content-management">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="header">
        <h2>Educational Content</h2>
        {!isAdding && !isEditing && (
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
                value={newContent.content_type}
                onChange={(e) => handleInputChange(e, setNewContent)}
              >
                <option value="video">Video</option>
                <option value="blog">Blog</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category*</label>
              <select
                name="category"
                value={newContent.category}
                onChange={(e) => handleInputChange(e, setNewContent)}
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
                value={newContent.title}
                onChange={(e) => handleInputChange(e, setNewContent)}
                placeholder="Content Title"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Description*</label>
              <textarea
                name="description"
                value={newContent.description}
                onChange={(e) => handleInputChange(e, setNewContent)}
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
                  value={newContent.video_url}
                  onChange={(e) => handleInputChange(e, setNewContent)}
                  placeholder="Video URL"
                  required
                />
              </div>
            ) : (
              <div className="form-group full-width">
                <label>Blog Content*</label>
                <textarea
                  name="blog_content"
                  value={newContent.blog_content}
                  onChange={(e) => handleInputChange(e, setNewContent)}
                  placeholder="Blog content"
                  rows={6}
                  required
                />
              </div>
            )}
            <div className="form-group full-width">
              <label>Thumbnail</label>
              <input
                type="file"
                name="thumbnail"
                onChange={(e) => handleThumbnailChange(e, setNewContent, setThumbnailPreview)}
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
            <button
              className="cancel-button"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button className="submit-button" onClick={handleAddContent}>
              Add Content
            </button>
          </div>
        </div>
      )}

      {isEditing && editingContent && (
        <div className="add-form">
          <h3>Edit Content</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Content Type*</label>
              <select
                name="content_type"
                value={editingContent.content_type}
                onChange={(e) => handleInputChange(e, setEditingContent)}
              >
                <option value="video">Video</option>
                <option value="blog">Blog</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category*</label>
              <select
                name="category"
                value={editingContent.category}
                onChange={(e) => handleInputChange(e, setEditingContent)}
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
                value={editingContent.title}
                onChange={(e) => handleInputChange(e, setEditingContent)}
                placeholder="Content Title"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Description*</label>
              <textarea
                name="description"
                value={editingContent.description}
                onChange={(e) => handleInputChange(e, setEditingContent)}
                placeholder="Content description"
                rows={3}
                required
              />
            </div>
            {editingContent.content_type === "video" ? (
              <div className="form-group full-width">
                <label>Video URL*</label>
                <input
                  type="text"
                  name="video_url"
                  value={editingContent.video_url}
                  onChange={(e) => handleInputChange(e, setEditingContent)}
                  placeholder="Video URL"
                  required
                />
              </div>
            ) : (
              <div className="form-group full-width">
                <label>Blog Content*</label>
                <textarea
                  name="blog_content"
                  value={editingContent.blog_content}
                  onChange={(e) => handleInputChange(e, setEditingContent)}
                  placeholder="Blog content"
                  rows={6}
                  required
                />
              </div>
            )}
            <div className="form-group full-width">
              <label>Thumbnail (leave blank to keep existing)</label>
              <input
                type="file"
                name="thumbnail"
                onChange={(e) => handleThumbnailChange(e, setEditingContent, setThumbnailPreview)}
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
            <button
              className="cancel-button"
              onClick={() => {
                setIsEditing(false);
                setEditingContent(null);
                setThumbnailPreview(null);
              }}
            >
              Cancel
            </button>
            <button className="submit-button" onClick={handleUpdateContent}>
              Update Content
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
                    {content.thumbnail_url && (
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
                  <td>{content.rating?.toFixed(1) || "N/A"}</td>
                  <td className="actions">
                    <button 
                      className="edit-button" 
                      title="Edit"
                      onClick={() => handleEditContent(content)}
                    >
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