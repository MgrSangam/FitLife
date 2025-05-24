import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../components/Axiosinstance';
import { FaUserTie, FaUser, FaEdit, FaCamera, FaComments } from 'react-icons/fa';
import {
  FaEnvelope,
  FaCalendarAlt,
  FaWeight,
  FaRulerVertical,
  FaVenusMars,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart,
  FaRunning,
} from 'react-icons/fa';
import UserForm from '../components/UserForm';
import '../CSS/Profile.css';

const Profile = () => {
  const [assignedInstructors, setAssignedInstructors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, instructorsRes] = await Promise.all([
          AxiosInstance.get('/api/user/profile/'),
          AxiosInstance.get('/api/user/assigned-instructors/')
        ]);
        setUser({
          ...profileRes.data,
          profile_picture: profileRes.data.profile_picture
            ? profileRes.data.profile_picture.startsWith('http')
              ? profileRes.data.profile_picture
              : `${BASE_URL}${profileRes.data.profile_picture}`
            : null
        });
        setAssignedInstructors(
          instructorsRes.data.map(instructor => ({
            ...instructor,
            profile_picture: instructor.profile_picture
              ? instructor.profile_picture.startsWith('http')
                ? instructor.profile_picture
                : `${BASE_URL}${instructor.profile_picture}`
              : null
          }))
        );
      } catch (err) {
        const errorMessage = err.response
          ? `Error ${err.response.status}: ${err.response.data?.detail || 'Unknown error'}`
          : `Network error: ${err.message}`;
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      try {
        const formData = new FormData();
        formData.append('profile_picture', file);
        const response = await AxiosInstance.patch('/api/user/profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setUser(prev => ({
          ...prev,
          profile_picture: response.data.profile_picture
            ? response.data.profile_picture.startsWith('http')
              ? response.data.profile_picture
              : `${BASE_URL}${response.data.profile_picture}`
            : null
        }));
      } catch (err) {
        console.error('Error uploading profile picture:', err);
        const errorMessage = err.response
          ? `Error ${err.response.status}: ${err.response.data?.detail || 'Unknown error'}`
          : `Network error: ${err.message}`;
        alert(`Failed to upload profile picture: ${errorMessage}`);
      }
    }
  };

  const handleImageError = (e) => {
    console.error('Failed to load image:', e.target.src);
    e.target.style.display = 'none';
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profile_picture ? (
            typeof user.profile_picture === 'string' ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="avatar-image"
                onError={handleImageError}
              />
            ) : (
              <img
                src={URL.createObjectURL(user.profile_picture)}
                alt="Profile Preview"
                className="avatar-image"
              />
            )
          ) : (
            <div className="avatar-placeholder">
              <FaUser size={48} />
            </div>
          )}
          <label className="upload-picture-btn">
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div className="profile-info">
          <h1>{user.first_name} {user.last_name}</h1>
          <p className="username">@{user.username}</p>
          {user.bio && !editing && <p className="bio">{user.bio}</p>}
        </div>
        <div className="profile-actions">
          <button
            className="edit-profile-btn"
            onClick={() => setEditing(!editing)}
          >
            <FaEdit /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
          <button 
            className="chat-btn"
            onClick={() => navigate('/chat')}
          >
            <FaComments /> Messages
          </button>
        </div>
      </div>

      <div className="profile-content">
        {editing ? (
          <UserForm user={user} setUser={setUser} setEditing={setEditing} />
        ) : (
          <div className="profile-details">
            {assignedInstructors.length > 0 && (
              <div className="assigned-instructors-section">
                <h2>Your Instructors</h2>
                <div className="instructors-grid">
                  {assignedInstructors.map((instructor) => (
                    <div key={instructor.id} className="instructor-card">
                      <div className="instructor-avatar">
                        {instructor.profile_picture ? (
                          <img
                            src={instructor.profile_picture}
                            alt={instructor.username}
                            onError={handleImageError}
                          />
                        ) : (
                          <FaUserTie size={24} />
                        )}
                      </div>
                      <div className="instructor-info">
                        <h4>{instructor.username}</h4>
                        <p className="instructor-specialization">
                          {instructor.specialization === 'trainer'
                            ? 'Personal Trainer'
                            : 'Nutritionist'}
                        </p>
                        <p className="instructor-bio">{instructor.bio || 'No bio provided'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="info-grid">
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email || 'Not specified'}</span>
                </div>
              </div>

              {user.phone && (
                <div className="info-item">
                  <FaPhone className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{user.phone}</span>
                  </div>
                </div>
              )}

              {user.gender && (
                <div className="info-item">
                  <FaVenusMars className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{user.gender}</span>
                  </div>
                </div>
              )}

              {user.birthday && (
                <div className="info-item">
                  <FaCalendarAlt className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Birth Date</span>
                    <span className="info-value">
                      {new Date(user.birthday).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              {user.weight && (
                <div className="info-item">
                  <FaWeight className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Weight</span>
                    <span className="info-value">{user.weight} kg</span>
                  </div>
                </div>
              )}

              {user.height && (
                <div className="info-item">
                  <FaRulerVertical className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Height</span>
                    <span className="info-value">{user.height} cm</span>
                  </div>
                </div>
              )}

              {user.location && (
                <div className="info-item">
                  <FaMapMarkerAlt className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Location</span>
                    <span className="info-value">{user.location}</span>
                  </div>
                </div>
              )}

              {user.fitness_goals && (
                <div className="info-item">
                  <FaHeart className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Fitness Goals</span>
                    <span className="info-value">{user.fitness_goals}</span>
                  </div>
                </div>
              )}

              {user.preferred_workouts && (
                <div className="info-item">
                  <FaRunning className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Preferred Workouts</span>
                    <span className="info-value">{user.preferred_workouts}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;