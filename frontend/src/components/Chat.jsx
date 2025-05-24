import React, { useState, useEffect, useRef } from 'react';
import AxiosInstance from '../components/Axiosinstance';
import { FaPaperPlane, FaUser, FaCheckDouble } from 'react-icons/fa';
import '../CSS/Chat.css';

const Chat = ({ selectedUser, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get(`/api/chat/messages/?other_user=${selectedUser.id}`);
      setMessages(response.data);
      markMessagesAsRead();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(
      msg => msg.recipient.id === currentUser.id && !msg.is_read
    );
    
    for (const msg of unreadMessages) {
      try {
        await AxiosInstance.patch(`/api/chat/messages/${msg.id}/read/`);
      } catch (err) {
        console.error('Failed to mark message as read:', err);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await AxiosInstance.post('/api/chat/messages/', {
        recipient_id: selectedUser.id,
        message: newMessage
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="chat-container empty">
        <div className="empty-chat">
          <h3>Select a conversation</h3>
          <p>Choose an instructor or client to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="user-info">
          {selectedUser.profile_picture ? (
            <img 
              src={selectedUser.profile_picture} 
              alt={selectedUser.username} 
              className="avatar"
            />
          ) : (
            <div className="avatar-placeholder">
              <FaUser />
            </div>
          )}
          <h3>{selectedUser.username}</h3>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message-wrapper ${message.sender.id === currentUser.id ? 'sent' : 'received'}`}
            >
              <div className="message-sender">
                {message.sender.id === currentUser.id ? 'You' : message.sender.username}
              </div>
              <div className="message-bubble">
                <div className="message-content">
                  <p>{message.message}</p>
                  <div className="message-meta">
                    <span className="time">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender.id === currentUser.id && (
                      <span className="read-status">
                        {message.is_read ? <FaCheckDouble color="#4fc3f7" /> : <FaCheckDouble color="#ccc" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit" disabled={!newMessage.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default Chat;