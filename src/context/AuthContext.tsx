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
    console.log('[Auth] 🔍 fetchUserData start for ID:', id);
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', id)
        .maybeSingle();

      console.log('[Auth] 🎉 supabase response:', { data, fetchError });
      
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
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    console.log('[Auth] 🔄 Setting up auth state listener');
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Auth] 📊 getSession returned:', session);
        setSession(session);
        
        if (session?.user) {
          console.log('[Auth] 👤 Existing session detected, fetching user data');
          await fetchUserData(session.user.id);
        } else {
          console.log('[Auth] 🚫 No session found — clearing loading');
          setLoading(false);
        }
      } catch (err) {
        console.error('[Auth] ❌ Error initializing auth:', err);
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Auth] 🔄 Auth state changed:', _event, session);
      setSession(session);
      
      if (session?.user) {
        console.log('[Auth] 👤 New session detected, fetching user data');
        await fetchUserData(session.user.id);
      } else {
        console.log('[Auth] 🚪 Signed out — clearing user & loading');
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('[Auth] 🧹 Cleaning up auth state listener');
      listener.subscription.unsubscribe();
    };
  }, []);

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    console.log('[Auth] 🔑 signIn called');
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

      console.log('[Auth] 🎉 signIn successful, user:', data.session.user);
      await fetchUserData(data.session.user.id);
    } catch (err: any) {
      console.error('[Auth] ❌ signIn error:', err.message);
      setError(err.message);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up new user + insert into 'users' table
  const signUp = async (email: string, password: string, role: UserRole) => {
    console.log('[Auth] 🆕 signUp called');
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

      console.log('[Auth] 📝 Inserting user profile row');
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ 
          id: data.user.id, 
          email: data.user.email!, 
          role 
        }]);

      if (insertError) {
        console.error('[Auth] ❌ insert user row error:', insertError.message);
        throw new Error('Failed to create user profile');
      }

      console.log('[Auth] 🎉 User profile inserted, fetching data');
      await fetchUserData(data.user.id);
    } catch (err: any) {
      console.error('[Auth] ❌ signUp error:', err.message);
      setError(err.message);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const signOut = async () => {
    console.log('[Auth] 🚪 signOut called');
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setError(null);
    } catch (err: any) {
      console.error('[Auth] ❌ signOut error:', err.message);
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