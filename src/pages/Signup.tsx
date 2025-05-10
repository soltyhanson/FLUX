import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'technician'>('client');
  const [formError, setFormError] = useState<string | null>(null);
  const { signUp, user, loading, error } = useAuth();
  const navigate = useNavigate();

  // redirect when profile appears
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
    await signUp(email, password, role);
    if (error) setFormError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 border rounded">
        <h1 className="text-2xl mb-4">Sign up for FLUX</h1>
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
        <div className="mb-2">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border"
            required
          />
        </div>
        <div className="mb-4">
          <select
            value={role}
            onChange={e => setRole(e.target.value as any)}
            className="w-full p-2 border"
          >
            <option value="client">Client</option>
            <option value="technician">Technician</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 bg-green-500 text-white ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Loading…' : 'Sign Up'}
        </button>
        <p className="mt-4 text-sm">
          Have an account? <Link to="/login" className="text-blue-600">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
