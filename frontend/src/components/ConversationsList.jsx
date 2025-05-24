import React, { useState, useEffect } from 'react';
import AxiosInstance from '../components/Axiosinstance';
import { FaUser, FaComment } from 'react-icons/fa';
import '../CSS/ConversationList.css';

const ConversationsList = ({ onSelectUser, currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get('/api/chat/conversations/');
      setConversations(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-conversations">Loading conversations...</div>;
  }

  if (error) {
    return <div className="error-conversations">{error}</div>;
  }

  return (
    <div className="conversations-list">
      <div className="list-header">
        <h3>Messages</h3>
      </div>
      
      {conversations.length === 0 ? (
        <div className="no-conversations">
          <FaComment size={48} />
          <p>No conversations yet</p>
        </div>
      ) : (
        <ul>
          {conversations.map((user) => (
            <li key={user.id} onClick={() => onSelectUser(user)}>
              <div className="user-avatar">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    <FaUser />
                  </div>
                )}
              </div>
              <div className="user-info">
                <h4>{user.username}</h4>
                <p>{user.specialization || 'Client'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationsList;