import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface UserData {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'technician';
}

type UserRole = UserData['role'];

interface AuthContextType {
  session: Session | null;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error('User profile not found');

      setUser(data);
      setError(null);
      return data;
    } catch (err: any) {
      console.error('Error fetching user data:', err.message);
      setUser(null);
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          if (session?.user) {
            await fetchUserData(session.user.id);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        if (session?.user) {
          await fetchUserData(session.user.id);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      
      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.session?.user) {
        await fetchUserData(data.session.user.id);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No user after sign up');

      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: data.user.email!,
          role
        }]);

      if (insertError) throw insertError;

      if (data.session) {
        await fetchUserData(data.user.id);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};