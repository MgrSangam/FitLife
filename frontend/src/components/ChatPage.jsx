import React, { useState, useEffect } from 'react';
import ConversationsList from '../components/ConversationsList';
import Chat from '../components/Chat';
import '../CSS/ChatPage.css';
import AxiosInstance from '../components/Axiosinstance';
import { FaUserTie } from 'react-icons/fa';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignedInstructors, setAssignedInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAssignedInstructors = async () => {
      try {
        const response = await AxiosInstance.get('/api/user/assigned-instructors/');
        setAssignedInstructors(response.data);
      } catch (error) {
        console.error('Error fetching assigned instructors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedInstructors();
  }, []);

  if (loading) {
    return <div className="loading">Loading conversations...</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="assigned-instructors-section">
          <h3>Your Instructors</h3>
          <div className="instructors-grid">
            {assignedInstructors.map((instructor) => (
              <div 
                key={instructor.id} 
                className={`instructor-card ${selectedUser?.id === instructor.id ? 'active' : ''}`}
                onClick={() => setSelectedUser(instructor)}
              >
                <div className="instructor-avatar">
                  {instructor.profile_picture ? (
                    <img
                      src={instructor.profile_picture}
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
                </div>
              </div>
            ))}
          </div>
        </div>
        <ConversationsList 
          onSelectUser={setSelectedUser} 
          currentUser={currentUser} 
        />
      </div>
      <div className="chat-main">
        <Chat selectedUser={selectedUser} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ChatPage;