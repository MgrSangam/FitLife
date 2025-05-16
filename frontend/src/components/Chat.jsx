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
  const [currentUserUsername, setCurrentUserUsername] = useState(null);

  // Fetch current user's username
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // First, try to get from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.username) {
          setCurrentUserUsername(storedUser.username);
          console.log('Current username from localStorage:', storedUser.username);
        } else {
          // Fallback: Fetch from API if localStorage is missing or invalid
          const response = await AxiosInstance.get('/api/user/profile/');
          const username = response.data.username;
          setCurrentUserUsername(username);
          console.log('Current username from API:', username);
          // Optionally update localStorage for future use
          localStorage.setItem('user', JSON.stringify({ username, ...response.data }));
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
        setError('Failed to load current user data');
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [messagesRes, userRes] = await Promise.all([
          AxiosInstance.get(`/api/chat/${userId}/`),
          AxiosInstance.get(`/api/users/${userId}/`)
        ]);
        
        if (isMounted) {
          setMessages(messagesRes.data);
          setOtherUser(userRes.data);
        }
      } catch (err) {
        if (isMounted) {
          let errorMessage = 'Failed to load chat';
          if (err.response) {
            errorMessage = `Error ${err.response.status}: ${err.response.data?.detail || err.response.data?.error || 'Unknown error'}`;
          } else if (err.request) {
            errorMessage = 'No response received from server';
          } else {
            errorMessage = `Request error: ${err.message}`;
          }
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      AxiosInstance.get(`/api/chat/${userId}/`)
        .then(response => {
          setMessages(response.data);
        })
        .catch(err => {
          console.error('Error polling messages:', err);
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !currentUserUsername) return;

    setIsSending(true);
    try {
      const response = await AxiosInstance.post(`/api/chat/${userId}/`, {
        message: newMessage
      });
      setMessages(prev => [...prev, response.data]);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  if (loading || !currentUserUsername) {
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

  if (!otherUser) {
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

  console.log('Messages:', messages.map(m => ({ sender: m.sender, message: m.message })));
  console.log('Current User:', currentUserUsername);
  console.log('Other User:', otherUser.username);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft />
        </button>
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
        <button className="menu-button">
          <FaEllipsisV />
        </button>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Start your conversation with {otherUser.username}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === currentUserUsername ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <span className="sender-name">
                  {message.sender === currentUserUsername ? 'Me' : otherUser.username}
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
      
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
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
    </div>
  );
};

export default Chat;