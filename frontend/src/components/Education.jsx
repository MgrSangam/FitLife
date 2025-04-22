import React, { useState, useEffect } from "react";
import { 
  FaBookOpen,  
  FaPlay, 
  FaVideo,
  FaClock, 
  FaStar, 
  FaAward,
  FaFilter,
  FaSpinner
} from "react-icons/fa";
import AxiosInstance from "./Axiosinstance";
import "./Education.css";

const CONTENT_TYPES = {
  VIDEO: "video",
  BLOG: "blog"
};

const Education = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await AxiosInstance.get("/education/");
        setContent(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const filteredContent = selectedCategory === "all" 
    ? content 
    : content.filter(item => item.category === selectedCategory);

  const featuredContent = content.filter(item => item.featured);

  const displayedContent = activeTab === "all" 
    ? filteredContent 
    : activeTab === "videos" 
      ? filteredContent.filter(item => item.content_type === CONTENT_TYPES.VIDEO) 
      : filteredContent.filter(item => item.content_type === CONTENT_TYPES.BLOG);

  const ContentCard = ({ item }) => (
    <div className="content-card">
      <div className="card-image">
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} loading="lazy" />
        ) : (
          <div className="placeholder-image">
            {item.content_type === CONTENT_TYPES.VIDEO ? <FaVideo /> : <FaBookOpen />}
          </div>
        )}
        {item.content_type === CONTENT_TYPES.VIDEO && (
          <div className="play-overlay">
            <FaPlay className="play-icon" />
          </div>
        )}
      </div>

      <div className="card-content">
        <span className="content-type">
          {item.content_type === CONTENT_TYPES.VIDEO ? "Video" : "Article"}
        </span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="card-footer">
          {item.content_type === CONTENT_TYPES.VIDEO && item.duration && (
            <span className="duration">
              <FaClock /> {formatDuration(item.duration)}
            </span>
          )}
          <button className="action-button">
            {item.content_type === CONTENT_TYPES.VIDEO ? "Watch Now" : "Read Article"}
          </button>
        </div>
      </div>
    </div>
  );

  const formatDuration = (duration) => {
    if (!duration) return "";
    const seconds = Math.floor(duration % 60);
    const minutes = Math.floor((duration / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="loading-container">
      <FaSpinner className="spinner" />
      <p>Loading educational content...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error-message">Error: {error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Try Again
      </button>
    </div>
  );

  return (
    <div className="education-container">
      {featuredContent.length > 0 && (
        <section className="featured-section">
          <h2><FaAward /> Featured Content</h2>
          <div className="featured-grid">
            {featuredContent.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="browse-section">
        <div className="section-header">
          <h2><FaBookOpen /> Browse Library</h2>
          <div className="controls">
            <div className="filter">
              <FaFilter />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Topics</option>
                <option value="workouts">Workouts</option>
                <option value="nutrition">Nutrition</option>
              </select>
            </div>
            <div className="tabs">
              <button
                className={activeTab === "all" ? "active" : ""}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={activeTab === "videos" ? "active" : ""}
                onClick={() => setActiveTab("videos")}
              >
                Videos
              </button>
              <button
                className={activeTab === "articles" ? "active" : ""}
                onClick={() => setActiveTab("articles")}
              >
                Articles
              </button>
            </div>
          </div>
        </div>

        <div className="content-grid">
          {displayedContent.length > 0 ? (
            displayedContent.map(item => <ContentCard key={item.id} item={item} />)
          ) : (
            <div className="empty-state">
              <p>No content found matching your criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Education;