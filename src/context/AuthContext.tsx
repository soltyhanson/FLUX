import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, User, UserRole } from '../lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch a single user row
  async function fetchUserData(id: string) {
    console.log('🔍 Fetching user data for ID:', id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', id)
        .single();

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Error fetching user data:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      console.log('✅ User data retrieved:', data);
      setUser(data);
    } catch (err: any) {
      console.error('❌ Exception in fetchUserData:', err);
      setError(err.message);
    } finally {
      console.log('🏁 Finished fetching user data');
      setLoading(false);
    }
  }

  // Sign up, then insert into users table
  async function signUp(email: string, password: string, role: string) {
    console.log('📝 Starting sign up process for:', email);
    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('🔑 Sign up response:', { signUpData, signUpError });

      if (signUpError) {
        console.error('❌ Sign up error:', signUpError);
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const user = signUpData.user;
      if (!user) {
        console.error('❌ No user returned from sign up');
        setError('Sign up failed - no user returned');
        setLoading(false);
        return;
      }

      console.log('👤 Inserting user data into users table');
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: user.id, email: user.email, role }]);

      if (insertError) {
        console.error('❌ Error inserting user data:', insertError);
        setError(insertError.message);
        setLoading(false);
        return;
      }

      console.log('✅ User data inserted successfully');
      await fetchUserData(user.id);
    } catch (err: any) {
      console.error('❌ Exception in signUp:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    console.log('🔐 Starting sign in process for:', email);
    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔑 Sign in response:', { data, signInError });

      if (signInError) {
        console.error('❌ Sign in error:', signInError);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.session?.user) {
        console.log('✅ Sign in successful, fetching user data');
        await fetchUserData(data.session.user.id);
      } else {
        console.error('❌ No session or user after sign in');
        setError('Sign in failed - no session');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('❌ Exception in signIn:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function signOut() {
    console.log('🚪 Starting sign out process');
    try {
      await supabase.auth.signOut();
      console.log('✅ Sign out successful');
      setUser(null);
      setSession(null);
    } catch (err: any) {
      console.error('❌ Error during sign out:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log('🔄 Setting up auth state listener');
    
    // Fetch the current session
    const fetchSession = async () => {
      console.log('📡 Fetching current session');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📊 Current session:', session);
      setSession(session);
      
      if (session?.user?.id) {
        console.log('👤 Session found, fetching user data');
        await fetchUserData(session.user.id);
      } else {
        console.log('ℹ️ No session found');
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      console.log('📊 New session:', session);
      
      setSession(session);
      
      if (session?.user?.id) {
        console.log('👤 New session detected, fetching user data');
        await fetchUserData(session.user.id);
      } else {
        console.log('ℹ️ No session in auth change');
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};