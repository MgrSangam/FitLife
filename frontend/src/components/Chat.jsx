import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from './Axiosinstance';
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaUserTie, FaUser } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import './Chat.css';

const Chat = () => {
  const { otherUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [messagesRes, userRes] = await Promise.all([
          AxiosInstance.get(`/api/chat/${otherUserId}/`),
          AxiosInstance.get(`/api/users/${otherUserId}/`)
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
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      AxiosInstance.get(`/api/chat/${otherUserId}/`)
        .then(response => {
          setMessages(response.data);
        })
        .catch(err => {
          console.error('Error polling messages:', err);
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [otherUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await AxiosInstance.post(`/api/chat/${otherUserId}/`, {
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
              className={`message ${message.sender === otherUser.id ? 'received' : 'sent'}`}
            >
              <div className="message-content">
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