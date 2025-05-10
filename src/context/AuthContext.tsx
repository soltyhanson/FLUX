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
    console.log('[Auth] 📡 Calling supabase.from("users")…');
    try {
      const { data, error: fetchError } = await supabase
        .from<UserData>('users')
        .select('id, email, role')
        .eq('id', id)
        .single();

      console.log('[Auth] 🎉 supabase response:', { data, fetchError });
      if (fetchError) throw fetchError;
      setUser(data!);
    } catch (err: any) {
      console.error('[Auth] ❌ fetchUserData error:', err.message);
      setError(err.message);
    } finally {
      console.log('[Auth] ✅ fetchUserData done — setting loading=false');
      setLoading(false);
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    console.log('[Auth] 🔄 Setting up auth state listener');
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] 📊 getSession returned:', session);
      setSession(session);
      if (session?.user) {
        console.log('[Auth] 👤 Existing session detected, fetching user data');
        fetchUserData(session.user.id);
      } else {
        console.log('[Auth] 🚫 No session found — clearing loading');
        setLoading(false);
      }
    });

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth] 🔄 Auth state changed:', _event, session);
      setSession(session);
      if (session?.user) {
        console.log('[Auth] 👤 New session detected, fetching user data');
        fetchUserData(session.user.id);
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
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error('[Auth] ❌ signIn error:', signInError.message);
      setError(signInError.message);
      setLoading(false);
      return;
    }
    if (data.session?.user) {
      console.log('[Auth] 🎉 signIn successful, user:', data.session.user);
      await fetchUserData(data.session.user.id);
    }
  };

  // Sign up new user + insert into 'users' table
  const signUp = async (email: string, password: string, role: UserRole) => {
    console.log('[Auth] 🆕 signUp called');
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      console.error('[Auth] ❌ signUp error:', signUpError.message);
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      console.log('[Auth] 📝 Inserting user profile row');
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email: data.user.email!, role }]);
      if (insertError) {
        console.error('[Auth] ❌ insert user row error:', insertError.message);
        setError(insertError.message);
        setLoading(false);
        return;
      }
      console.log('[Auth] 🎉 User profile inserted, fetching data');
      await fetchUserData(data.user.id);
    }
  };

  // Sign out user
  const signOut = async () => {
    console.log('[Auth] 🚪 signOut called');
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
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
