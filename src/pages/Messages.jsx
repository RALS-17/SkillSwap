import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../hooks/useChat';
import { MessageSquare, Send, User, ArrowLeft } from 'lucide-react';

const Messages = () => {
  const { currentUser, userData } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const messagesEndRef = useRef(null);
  
  // Initialize chat hook with selected chat ID
  const { messages, sendMessage, getUserChats } = useChat(selectedChat?.id);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load user's chats
  useEffect(() => {
    if (!currentUser) return;
    
    try {
      const unsubscribe = getUserChats(currentUser.uid, (loadedChats) => {
        console.log('Loaded chats:', loadedChats);
        setChats(loadedChats);
        
        // Auto-select first chat if none selected and chats exist (desktop only)
        if (!selectedChat && loadedChats.length > 0 && !isMobileView) {
          console.log('Auto-selecting first chat:', loadedChats[0]);
          setSelectedChat(loadedChats[0]);
        }
      });

      return () => unsubscribe?.();
    } catch (error) {
      console.error('Error loading chats:', error);
      // Continue even if there's an error - user might not have chats yet
    }
  }, [currentUser, isMobileView]);

  // Debug: Log when messages change
  useEffect(() => {
    console.log('Messages updated:', messages.length, 'messages for chat:', selectedChat?.id);
  }, [messages, selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedChat || loading) return;

    console.log('Sending message:', {
      chatId: selectedChat.id,
      senderId: currentUser.uid,
      text: messageText
    });

    setLoading(true);
    try {
      await sendMessage(selectedChat.id, currentUser.uid, messageText);
      console.log('Message sent successfully');
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUserData = (chat) => {
    const otherUserId = chat.participants.find(id => id !== currentUser.uid);
    return chat.participantData?.[otherUserId] || { displayName: 'Unknown User', photoURL: null };
  };

  const avatarFor = (user) => {
    return user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=7c3aed&color=fff`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  return (
    <div className="page-main animate-fade-up">
      <h1 style={{ marginBottom: '.5rem' }}>Messages</h1>
      <p style={{ marginBottom: '2rem' }}>Chat with your skill-swap partners</p>

      <div className={`messages-layout ${selectedChat && isMobileView ? 'chat-active' : ''}`}>
        {/* Sidebar - Chat List */}
        <div className="msg-sidebar">
          <div className="msg-sidebar-header">
            <h3>Conversations</h3>
          </div>
          <div className="msg-list">
            {chats.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--clr-muted)' }}>
                <MessageSquare size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p style={{ fontSize: '.85rem' }}>No conversations yet</p>
                <p style={{ fontSize: '.75rem', marginTop: '.5rem' }}>Start chatting after accepting a swap request</p>
              </div>
            ) : (
              chats.map(chat => {
                const otherUser = getOtherUserData(chat);
                return (
                  <div
                    key={chat.id}
                    className={`msg-chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <img 
                      src={avatarFor(otherUser)} 
                      alt={otherUser.displayName}
                      className="msg-chat-avatar"
                    />
                    <div className="msg-chat-info">
                      <div className="msg-chat-name">{otherUser.displayName}</div>
                      <div className="msg-chat-preview">{chat.lastMessage || 'No messages yet'}</div>
                    </div>
                    {chat.lastMessageTime && (
                      <div className="msg-chat-time">{formatTime(chat.lastMessageTime)}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`msg-chat-area ${selectedChat ? 'active' : ''}`}>
          {!selectedChat ? (
            <div className="msg-empty-chat">
              <MessageSquare size={48} style={{ opacity: 0.3 }} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="msg-chat-header">
                {isMobileView && (
                  <button 
                    onClick={handleBackToList}
                    className="btn btn-icon"
                    style={{ marginRight: '.5rem' }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <img 
                  src={avatarFor(getOtherUserData(selectedChat))} 
                  alt={getOtherUserData(selectedChat).displayName}
                  className="msg-chat-header-avatar"
                />
                <div>
                  <div className="msg-chat-header-name">{getOtherUserData(selectedChat).displayName}</div>
                  <div className="msg-chat-header-status">Active</div>
                </div>
              </div>

              {/* Messages */}
              <div className="msg-messages-container">
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-muted)' }}>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn = msg.senderId === currentUser.uid;
                    const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                    
                    return (
                      <div key={msg.id} className={`msg-bubble-wrap ${isOwn ? 'own' : ''}`}>
                        {!isOwn && showAvatar && (
                          <img 
                            src={avatarFor(getOtherUserData(selectedChat))} 
                            alt="avatar"
                            className="msg-bubble-avatar"
                          />
                        )}
                        {!isOwn && !showAvatar && <div className="msg-bubble-avatar-spacer" />}
                        <div className="msg-bubble">
                          <div className="msg-bubble-text">{msg.text}</div>
                          {msg.timestamp && (
                            <div className="msg-bubble-time">{formatTime(msg.timestamp)}</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSendMessage} className="msg-input-bar">
                <input
                  type="text"
                  className="input"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={!messageText.trim() || loading}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
