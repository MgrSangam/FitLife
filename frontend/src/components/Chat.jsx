import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from './Axiosinstance';
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaUserTie, FaUser } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import './Chat.css';

const Chat = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user and chat data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user from localStorage or API
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setCurrentUser(storedUser);
        } else {
          const userRes = await AxiosInstance.get('/api/user/profile/');
          setCurrentUser(userRes.data);
          localStorage.setItem('user', JSON.stringify(userRes.data));
        }

        if (userId) {
          const [messagesRes, userRes] = await Promise.all([
            AxiosInstance.get(`/api/chat/${userId}/`),
            AxiosInstance.get(`/api/users/${userId}/`)
          ]);
          setMessages(messagesRes.data);
          setOtherUser(userRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load chat');
        if (err.response?.status === 403) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling for new messages
    const pollInterval = setInterval(() => {
      if (userId) {
        AxiosInstance.get(`/api/chat/${userId}/`)
          .then(res => setMessages(res.data))
          .catch(console.error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [userId, navigate]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !userId) return;

    setIsSending(true);
    try {
      const response = await AxiosInstance.post(`/api/chat/${userId}/`, {
        message: newMessage
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>Loading chat...</h2>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>Error</h2>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!otherUser && userId) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>User not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft />
        </button>
        {otherUser && (
          <div className="header-info">
            <h2>{otherUser.username}</h2>
            <p>
              {otherUser.is_instructor ? (
                <>
                  {otherUser.specialization === 'trainer' ? 'Personal Trainer' : 'Nutritionist'}
                  <FaUserTie style={{ marginLeft: '8px' }} />
                </>
              ) : (
                <>
                  Client
                  <FaUser style={{ marginLeft: '8px' }} />
                </>
              )}
            </p>
          </div>
        )}
        <button className="menu-button">
          <FaEllipsisV />
        </button>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Start your conversation with {otherUser?.username || 'this user'}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === currentUser?.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <span className="sender-name">
                  {message.sender === currentUser?.id ? 'Me' : otherUser?.username}
                </span>
                <p>{message.message}</p>
                <span className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {userId && (
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={isSending}
          />
          <button type="submit" disabled={!newMessage.trim() || isSending}>
            {isSending ? (
              <div className="sending-spinner"></div>
            ) : (
              <IoMdSend className="send-icon" />
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default Chat;