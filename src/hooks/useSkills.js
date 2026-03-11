import { useState, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useSkills = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all unique skills available
  const getCategories = async () => {
    setLoading(true);
    try {
      const skillsRef = collection(db, 'skills');
      const snapshot = await getDocs(skillsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Search for users teaching a specific skill
  const searchTeachers = async (skillId, category) => {
    setLoading(true);
    try {
      // In a real production app with Algolia this would be easier
      // Here we filter users in memory if we have complex array querying
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const teachers = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Check if user has skillsToTeach
        if (data.skillsToTeach && Array.isArray(data.skillsToTeach)) {
          const matchingSkill = data.skillsToTeach.find(s => 
            (skillId && s.skillId === skillId) || 
            (category && s.category === category)
          );
          
          if (matchingSkill) {
            teachers.push({
              id: doc.id,
              ...data,
              matchedSkill: matchingSkill
            });
          }
        }
      });
      
      return teachers;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Propose a swap
  const createSwapRequest = async (fromUserId, toUserId, skillOffered, skillRequested, message) => {
    setLoading(true);
    try {
      const requestRef = collection(db, 'swapRequests');
      await addDoc(requestRef, {
        fromUserId,
        toUserId,
        skillOffered,
        skillRequested,
        message,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update swap status (accept/decline)
  const updateSwapStatus = async (requestId, newStatus) => {
    setLoading(true);
    try {
      const requestRef = doc(db, 'swapRequests', requestId);
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // If accepted, we might want to automatically create a chat room
      if (newStatus === 'accepted') {
         // Create chat room logic here using useChat
      }

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getCategories,
    searchTeachers,
    createSwapRequest,
    updateSwapStatus,
    loading,
    error
  };
};
