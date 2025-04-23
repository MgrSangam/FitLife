import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaClock, FaEye, FaArrowLeft } from "react-icons/fa";
import ReactPlayer from "react-player";
import AxiosInstance from "./Axiosinstance";
import "./EducationDetail.css";

const EducationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await AxiosInstance.get(`/education/${id}/`);
        setContent(response.data);
        
        // Track view when content is loaded
        await AxiosInstance.post(`/education/${id}/increment_views/`);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  const handleRating = async (rating) => {
    try {
      await AxiosInstance.post(`/education/${id}/rate_content/`, { rating });
      setUserRating(rating);
      // Update local content with new rating
      setContent(prev => ({
        ...prev,
        rating: ((prev.rating * (prev.views - 1)) + rating) / prev.views
      }));
    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading content...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Go Back
      </button>
    </div>
  );

  if (!content) return null;

  return (
    <div className="education-detail-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Back to Library
      </button>

      <div className="content-header">
        <h1>{content.title}</h1>
        <div className="meta-info">
          <span className="content-type">
            {content.content_type === "video" ? "Video" : "Article"}
          </span>
          <span className="views">
            <FaEye /> {content.views} views
          </span>
          {content.duration && (
            <span className="duration">
              <FaClock /> {formatDuration(content.duration)}
            </span>
          )}
        </div>
      </div>

      <div className="content-body">
        {content.content_type === "video" ? (
          <div className="video-container">
            <ReactPlayer
              url={content.video_url}
              controls
              width="100%"
              height="500px"
              onPlay={handlePlay}
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload"
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="article-content">
            {content.thumbnail_url && (
              <img 
                src={content.thumbnail_url} 
                alt={content.title} 
                className="article-image"
              />
            )}
            <div dangerouslySetInnerHTML={{ __html: content.blog_content }} />
          </div>
        )}

        <div className="rating-section">
          <h3>Rate this content</h3>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="star"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRating(star)}
              >
                {(hoverRating || userRating || content.user_rating) >= star ? (
                  <FaStar className="filled" />
                ) : (
                  <FaRegStar />
                )}
              </span>
            ))}
          </div>
          <p className="average-rating">
            Average rating: {content.rating?.toFixed(1) || "Not rated yet"}
          </p>
        </div>

        <div className="description-section">
          <h3>Description</h3>
          <p>{content.description}</p>
        </div>
      </div>
    </div>
  );
};

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default EducationDetail;