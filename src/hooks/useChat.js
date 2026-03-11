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
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useChat = (chatId = null) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to messages in a specific chat room
  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    const messagesRef = collection(db, 'messages', chatId, 'chatMessages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error("Chat subscription error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  // Send a message to a specific chat room
  const sendMessage = async (chatId, senderId, text) => {
    try {
      const messagesRef = collection(db, 'messages', chatId, 'chatMessages');
      await addDoc(messagesRef, {
        senderId,
        text,
        timestamp: serverTimestamp(),
        read: false
      });

      // Update the main chat document with the last message
      const chatDocRef = doc(db, 'messages', chatId);
      await updateDoc(chatDocRef, {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message);
      throw err;
    }
  };

  // Get all chat rooms for a user
  const getUserChats = (userId, onChatsLoaded) => {
    const chatsRef = collection(db, 'messages');
    const q = query(chatsRef, where('participants', 'array-contains', userId), orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onChatsLoaded(chats);
    }, (err) => {
      console.error("Error loading chats:", err);
      setError(err.message);
    });
  };

  return { 
    messages, 
    sendMessage, 
    getUserChats,
    loading, 
    error 
  };
};
