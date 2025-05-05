import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from './Axiosinstance';
import { FaPaperPlane, FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';
import './Chat.css';

const Chat = () => {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [messagesRes, instructorRes] = await Promise.all([
          AxiosInstance.get(`/api/chat/${instructorId}/`),
          AxiosInstance.get(`/api/users/${instructorId}/`)
        ]);
        
        if (isMounted) {
          setMessages(messagesRes.data);
          setInstructor(instructorRes.data);
        }
      } catch (err) {
        if (isMounted) {
          let errorMessage = 'Failed to load chat';
          if (err.response) {
            errorMessage = `Error ${err.response.status}: ${err.response.data?.detail || 'Unknown error'}`;
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
  }, [instructorId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages (simple implementation - consider WebSockets for production)
  useEffect(() => {
    const interval = setInterval(() => {
      AxiosInstance.get(`/api/chat/${instructorId}/`)
        .then(response => {
          setMessages(response.data);
        })
        .catch(err => {
          console.error('Error polling messages:', err);
        });
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [instructorId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await AxiosInstance.post(`/api/chat/${instructorId}/`, {
        message: newMessage
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      let errorMessage = 'Failed to send message';
      if (err.response) {
        errorMessage = `Error ${err.response.status}: ${err.response.data?.message || 'Unknown error'}`;
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

  if (!instructor) {
    return (
      <div className="chat-container">
        <div className="chat-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <h2>Instructor not found</h2>
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
          <h2>{instructor.username}</h2>
          <p>{instructor.specialization === 'trainer' ? 'Personal Trainer' : 'Nutritionist'}</p>
        </div>
        <button className="menu-button">
          <FaEllipsisV />
        </button>
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Start your conversation with {instructor.username}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === instructor.id ? 'received' : 'sent'}`}
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