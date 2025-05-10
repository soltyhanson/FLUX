import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, UserData } from '../lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserData['role']) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from our users table
  const fetchUserData = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from<UserData>('users')
        .select('id,email,role')
        .eq('id', id)
        .maybeSingle();
      if (fetchError) throw fetchError;
      setUser(data || null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // On mount: get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchUserData(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth changes
    const { subscription } = supabase.auth.onAuthStateChange((_, sess) => {
      setSession(sess);
      if (sess?.user) {
        fetchUserData(sess.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    if (data.session?.user) {
      await fetchUserData(data.session.user.id);
    }
    setLoading(false);
  };

  // Sign up and insert into users table
  const signUp = async (email: string, password: string, role: UserData['role']) => {
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ id: data.user.id, email: data.user.email!, role }]);
      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
      await fetchUserData(data.user.id);
    }
    setLoading(false);
  };

  // Sign out
  const signOut = async () => {
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};