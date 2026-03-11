import { useState, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs,
  query
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Hook for standard CRUD operations
export const useFirestore = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCollectionRef = useCallback(() => {
    return collection(db, collectionName);
  }, [collectionName]);

  // Read single document
  const getDocument = async (id) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Run a query and return results
  const getDocuments = async (q) => {
     setLoading(true);
     try {
       const querySnapshot = await getDocs(q);
       return querySnapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data()
       }));
     } catch (err) {
         setError(err.message);
         throw err;
     } finally {
         setLoading(false);
     }
  }

  // Create
  const addDocument = async (data) => {
    setLoading(true);
    try {
      const docRef = await addDoc(getCollectionRef(), data);
      return { id: docRef.id, ...data };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update
  const updateDocument = async (id, data) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteDocument = async (id) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getDocument, getDocuments, addDocument, updateDocument, deleteDocument, loading, error };
};
