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
import { useNavigate } from "react-router-dom";
import "./Education.css";

const CONTENT_TYPES = {
  VIDEO: "video",
  ARTICLE: "article"
};

const CONTENT_CATEGORIES = {
  ALL: "all",
  NUTRITION: "nutrition",
  WORKOUTS: "workouts",
  MINDFULNESS: "mindfulness"
};

const TAB_TYPES = {
  ALL: "all",
  VIDEOS: "videos",
  ARTICLES: "articles"
};

const sampleContent = [
  {
    id: "1",
    title: "Beginner's Guide to Strength Training",
    description: "Learn the fundamentals of strength training with proper form and technique.",
    type: CONTENT_TYPES.VIDEO,
    category: CONTENT_CATEGORIES.WORKOUTS,
    duration: "15 min",
    author: "Coach Sarah",
    rating: 4.8,
    featured: true,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop",
    link: "#",
  }
];

const Education = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(CONTENT_CATEGORIES.ALL);
  const [activeTab, setActiveTab] = useState(TAB_TYPES.ALL);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await AxiosInstance.get("/education/");
        setContent(response.data);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("Failed to load educational content. Showing sample data.");
        setContent(sampleContent);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const filteredContent = selectedCategory === CONTENT_CATEGORIES.ALL
    ? content
    : content.filter(item => item.category === selectedCategory);

  const featuredContent = content.filter(item => item.featured);

  const displayedContent = activeTab === TAB_TYPES.ALL
    ? filteredContent
    : activeTab === TAB_TYPES.VIDEOS
      ? filteredContent.filter(item => (item.content_type || item.type) === CONTENT_TYPES.VIDEO)
      : filteredContent.filter(item => (item.content_type || item.type) === CONTENT_TYPES.ARTICLE);

  const formatDuration = (duration) => {
    if (!duration) return "";
    if (typeof duration === "string") return duration;
    const seconds = Math.floor(duration % 60);
    const minutes = Math.floor((duration / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const goToDetailPage = (id) => {
    navigate(`/education/${id}`);
  };

  const ContentCard = ({ item }) => (
    <div className="content-card">
      <div className="card-image">
        {item.thumbnail_url || item.image ? (
          <img src={item.thumbnail_url || item.image} alt={item.title} />
        ) : (
          <div className="placeholder-image">
            {(item.content_type || item.type) === CONTENT_TYPES.VIDEO ? <FaVideo /> : <FaBookOpen />}
          </div>
        )}
        {(item.content_type || item.type) === CONTENT_TYPES.VIDEO && (
          <div className="play-overlay">
            <div className="play-button">
              <FaPlay />
              <span className="content-type video"><FaVideo /> Video</span>
            </div>
          </div>
        )}
      </div>

      <div className="card-header">
        <span className="category">{item.category}</span>
        <span className="rating">
          <FaStar />
          <span>{item.rating || "4.5"}</span>
        </span>
      </div>

      <div className="card-body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="meta">
          {(item.content_type || item.type) === CONTENT_TYPES.VIDEO && (
            <span className="duration"><FaClock /> {formatDuration(item.duration)}</span>
          )}
          {item.author && <span>By {item.author}</span>}
        </div>
      </div>

      <button className="action-button" onClick={() => goToDetailPage(item.id)}>
        {(item.content_type || item.type) === CONTENT_TYPES.VIDEO ? "Watch Now" : "Read Article"}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading educational content...</p>
      </div>
    );
  }

  return (
    <div className="education-container">
      {error && <p className="error-message">{error}</p>}

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
          <h2 className="browse-title">
            <FaBookOpen className="book-icon" /> Browse Library
          </h2>
        </div>

        <div className="filter-controls-below">
          <label htmlFor="filterSelect">
            <FaFilter />
          </label>
          <select id="filterSelect" onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value={CONTENT_CATEGORIES.ALL}>All Categories</option>
            <option value={CONTENT_CATEGORIES.WORKOUTS}>Workout</option>
            <option value={CONTENT_CATEGORIES.NUTRITION}>Nutrition</option>
            <option value={CONTENT_CATEGORIES.MINDFULNESS}>Mindfulness</option>
          </select>
        </div>

        <div className="controls">
          <div className="tabs">
            <button
              className={activeTab === TAB_TYPES.ALL ? "active" : ""}
              onClick={() => setActiveTab(TAB_TYPES.ALL)}
            >
              All
            </button>
            <button
              className={activeTab === TAB_TYPES.VIDEOS ? "active" : ""}
              onClick={() => setActiveTab(TAB_TYPES.VIDEOS)}
            >
              Videos
            </button>
            <button
              className={activeTab === TAB_TYPES.ARTICLES ? "active" : ""}
              onClick={() => setActiveTab(TAB_TYPES.ARTICLES)}
            >
              Articles
            </button>
          </div>
        </div>

        <div className="content-grid">
          {displayedContent.length > 0 ? (
            displayedContent.map(item => (
              <ContentCard key={item.id} item={item} />
            ))
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