import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'technician'>('client');
  const [formError, setFormError] = useState<string | null>(null);

  const { signUp, user, loading, error } = useAuth();
  const navigate = useNavigate();

  // Redirect on successful signup
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/dashboard/admin');
      if (user.role === 'client') navigate('/dashboard/client');
      if (user.role === 'technician') navigate('/dashboard/tech');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    await signUp(email.trim(), password, role);
    if (error) {
      setFormError(error);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: 360, padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
        <h1 style={{ textAlign: 'center' }}>FLUX Signup</h1>
        {formError && <div style={{ color: 'red', marginBottom: 16 }}>{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Account type</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'client' | 'technician')}
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
            >
              <option value="client">Client</option>
              <option value="technician">Technician</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 12, backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;


