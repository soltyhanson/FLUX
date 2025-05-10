import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { signIn, user, loading, error } = useAuth();
  const navigate = useNavigate();

  // once we have user, redirect
  useEffect(() => {
    if (user) {
      const dest =
        user.role === 'admin'
          ? '/dashboard/admin'
          : user.role === 'client'
          ? '/dashboard/client'
          : '/dashboard/technician';
      navigate(dest, { replace: true });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    await signIn(email, password);
    if (error) setFormError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 border rounded">
        <h1 className="text-2xl mb-4">Sign in to FLUX</h1>
        {formError && <div className="mb-2 text-red-600">{formError}</div>}
        <div className="mb-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 bg-blue-500 text-white ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Loading…' : 'Sign in'}
        </button>
        <p className="mt-4 text-sm">
          Don’t have an account? <Link to="/signup" className="text-blue-600">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
