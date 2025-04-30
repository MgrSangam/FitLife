import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AxiosInstance from './Axiosinstance';
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaWeight,
  FaRulerVertical,
  FaEdit,
  FaVenusMars,
  FaPhone,
  FaMapMarkerAlt,
  FaHeart,
  FaRunning,
  FaDumbbell
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: '',
    birthday: '',
    weight: '',
    height: '',
    bio: '',
    location: '',
    fitness_goals: '',
    preferred_workouts: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await AxiosInstance.get('/api/user/profile/');
        setUser(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          gender: response.data.gender || '',
          birthday: response.data.birthday || '',
          weight: response.data.weight || '',
          height: response.data.height || '',
          bio: response.data.bio || '',
          location: response.data.location || '',
          fitness_goals: response.data.fitness_goals || '',
          preferred_workouts: response.data.preferred_workouts || ''
        });
      } catch (err) {
        setError('Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await AxiosInstance.patch('/api/user/profile/', formData);
      setUser(response.data);
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            <FaUser size={48} />
          </div>
        </div>
        <div className="profile-info">
          <h1>{user.first_name} {user.last_name}</h1>
          <p className="username">@{user.username}</p>
          {user.bio && !editing && <p className="bio">{user.bio}</p>}
        </div>
        <button 
          className="edit-profile-btn"
          onClick={() => setEditing(!editing)}
        >
          <FaEdit /> {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {editing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Birth Date</label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Fitness Goals</label>
              <textarea
                name="fitness_goals"
                value={formData.fitness_goals}
                onChange={handleInputChange}
                rows="2"
                placeholder="E.g., Lose weight, build muscle, improve endurance"
              />
            </div>

            <div className="form-group">
              <label>Preferred Workouts</label>
              <textarea
                name="preferred_workouts"
                value={formData.preferred_workouts}
                onChange={handleInputChange}
                rows="2"
                placeholder="E.g., Weight lifting, yoga, running"
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
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