import { useState, useCallback, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  setDoc,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useChat = (chatId = null) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to messages in a specific chat room
  useEffect(() => {
    if (!chatId) {
      console.log('No chatId provided, skipping message subscription');
      setMessages([]);
      return;
    }

    console.log('Setting up message subscription for chat:', chatId);
    setLoading(true);
    
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('Received message snapshot:', snapshot.docs.length, 'messages');
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Parsed messages:', msgs);
        setMessages(msgs);
        setLoading(false);
      }, (err) => {
        console.error("Chat subscription error:", err);
        setError(err.message);
        setLoading(false);
      });

      return () => {
        console.log('Cleaning up message subscription for chat:', chatId);
        unsubscribe();
      };
    } catch (err) {
      console.error("Error setting up message subscription:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [chatId]);

  // Create or get existing chat room between two users
  const getOrCreateChat = async (user1Id, user2Id, user1Data, user2Data) => {
    try {
      // Sort IDs to ensure consistent chat ID regardless of who initiates
      const sortedIds = [user1Id, user2Id].sort();
      const chatId = `${sortedIds[0]}_${sortedIds[1]}`;
      
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        // Create new chat room
        await setDoc(chatRef, {
          participants: [user1Id, user2Id],
          participantData: {
            [user1Id]: {
              displayName: user1Data.displayName,
              photoURL: user1Data.photoURL || null
            },
            [user2Id]: {
              displayName: user2Data.displayName,
              photoURL: user2Data.photoURL || null
            }
          },
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }

      return chatId;
    } catch (err) {
      console.error("Error creating/getting chat:", err);
      setError(err.message);
      throw err;
    }
  };

  // Send a message to a specific chat room
  const sendMessage = async (chatId, senderId, text) => {
    if (!text.trim()) {
      console.log('Empty message, not sending');
      return;
    }
    
    console.log('sendMessage called with:', { chatId, senderId, text: text.trim() });
    
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      console.log('Adding message to:', `chats/${chatId}/messages`);
      
      const messageDoc = await addDoc(messagesRef, {
        senderId,
        text: text.trim(),
        timestamp: serverTimestamp(),
        read: false
      });
      
      console.log('Message added with ID:', messageDoc.id);

      // Update the main chat document with the last message
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: text.trim(),
        lastMessageTime: serverTimestamp()
      });
      
      console.log('Chat document updated');

      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message);
      throw err;
    }
  };

  // Get all chat rooms for a user
  const getUserChats = (userId, onChatsLoaded) => {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', userId));
      
      return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by lastMessageTime in JavaScript instead of Firestore
        chats.sort((a, b) => {
          const timeA = a.lastMessageTime?.toMillis?.() || 0;
          const timeB = b.lastMessageTime?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        onChatsLoaded(chats);
      }, (err) => {
        console.error("Error loading chats:", err);
        onChatsLoaded([]); // Return empty array on error
      });
    } catch (err) {
      console.error("Error setting up chat listener:", err);
      return () => {}; // Return empty cleanup function
    }
  };

  return { 
    messages, 
    sendMessage, 
    getUserChats,
    getOrCreateChat,
    loading, 
    error 
  };
};
