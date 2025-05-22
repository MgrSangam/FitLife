import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AxiosInstance from '../components/Axiosinstance';
import { FaComments, FaUserTie, FaPaperPlane } from 'react-icons/fa';
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
import '../CSS/Profile.css';

const Profile = () => {
  const [assignedInstructors, setAssignedInstructors] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

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
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, instructorsRes] = await Promise.all([
          AxiosInstance.get('/api/user/profile/'),
          AxiosInstance.get('/api/user/assigned-instructors/')
        ]);
        console.log('Profile data:', profileRes.data);
        console.log('Instructors data:', instructorsRes.data);
        setUser(profileRes.data);
        setAssignedInstructors(instructorsRes.data);
        setFormData({
          first_name: profileRes.data.first_name || '',
          last_name: profileRes.data.last_name || '',
          email: profileRes.data.email || '',
          phone: profileRes.data.phone || '',
          gender: profileRes.data.gender || '',
          birthday: profileRes.data.birthday || '',
          weight: profileRes.data.weight || '',
          height: profileRes.data.height || '',
          bio: profileRes.data.bio || '',
          location: profileRes.data.location || '',
          fitness_goals: profileRes.data.fitness_goals || '',
          preferred_workouts: profileRes.data.preferred_workouts || ''
        });
      } catch (err) {
        const errorMessage = err.response
          ? `Error ${err.response.status}: ${err.response.data?.detail || 'Unknown error'}`
          : `Network error: ${err.message}`;
        console.error('Fetch error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const response = await AxiosInstance.get(`/api/chat/${activeChat.id}/`);
          setMessages(response.data);
        } catch (err) {
          console.error('Error fetching messages:', err);
        }
      };
      fetchMessages();
    }
  }, [activeChat]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !activeChat) return;

    setIsSending(true);
    try {
      const response = await AxiosInstance.post(`/api/chat/${activeChat.id}/`, {
        message: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      let errorMessage = 'Failed to send message';
      if (err.response) {
        errorMessage = `Error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || 'Unknown error'}`;
      }
      alert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const openChat = (instructor) => {
    setActiveChat(instructor);
  };

  const closeChat = () => {
    setActiveChat(null);
    setNewMessage('');
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="profile-container">
      {activeChat && (
        <div className="message-overlay">
          <div className="message-form-container">
            <h3>Send Message to {activeChat.username}</h3>
            <div className="profile-chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`profile-chat-message ${
                    message.sender === user.username ? 'sent' : 'received'
                  }`}
                >
                  <p>{message.message}</p>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="message-form">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                rows="3"
                disabled={isSending}
              />
              <div className="form-actions">
                <button type="submit" disabled={!newMessage.trim() || isSending}>
                  {isSending ? 'Sending...' : 'Send'}
                </button>
                <button type="button" onClick={closeChat}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            {assignedInstructors.length > 0 && (
              <div className="assigned-instructors-section">
                <h2>Your Instructors</h2>
                <div className="instructors-grid">
                  {assignedInstructors.map((instructor) => (
                    <div key={instructor.id} className="instructor-card">
                      <div className="instructor-avatar">
                        {instructor.profile_picture ? (
                          <img 
                            src={`data:image/jpeg;base64,${instructor.profile_picture}`} 
                            alt={instructor.username}
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
                        <button
                          className="chat-btn"
                          onClick={() => openChat(instructor)}
                        >
                          <FaComments /> Message
                        </button>
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