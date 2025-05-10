import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Define the shape of user data
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

  // Fetch user profile from 'users' table
  const fetchUserData = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('[Auth] ❌ fetchUserData error:', fetchError.message);
        setUser(null);
        setError('Failed to fetch user profile');
        return;
      }

      if (!data) {
        console.warn('[Auth] ⚠️ No user profile found');
        setUser(null);
        setError('User profile not found');
        return;
      }

      setUser(data);
      setError(null);
    } catch (err: any) {
      console.error('[Auth] ❌ fetchUserData error:', err.message);
      setUser(null);
      setError('Failed to fetch user profile');
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          await fetchUserData(session.user.id);
        }
      } catch (err) {
        console.error('[Auth] ❌ Error initializing auth:', err);
      } finally {
        // Always set loading to false after initialization
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
      }
      // Ensure loading is false after auth state change
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) {
        throw new Error('Invalid email or password');
      }
      
      if (!data.session?.user) {
        throw new Error('Sign in failed - no session returned');
      }

      await fetchUserData(data.session.user.id);
    } catch (err: any) {
      setError(err.message);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up new user + insert into 'users' table
  const signUp = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password 
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (!data.user) {
        throw new Error('Sign up failed - no user returned');
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          id: data.user.id, 
          email: data.user.email!, 
          role 
        }]);

      if (insertError) {
        throw new Error('Failed to create user profile');
      }

      await fetchUserData(data.user.id);
    } catch (err: any) {
      setError(err.message);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setError(null);
    } catch (err: any) {
      setError('Failed to sign out');
    } finally {
      setLoading(false);
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