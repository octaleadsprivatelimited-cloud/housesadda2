import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from './firebase-auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    signIn: authService.signIn,
    signUp: authService.signUp,
    signOut: authService.signOut,
    resetPassword: authService.resetPassword,
    updatePassword: authService.updatePassword,
    reauthenticate: authService.reauthenticate,
  };
}
