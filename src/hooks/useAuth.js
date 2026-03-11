import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Re-export the hook from context so we can import it from 'hooks' later
export const useAuth = () => {
  return useContext(AuthContext);
};
