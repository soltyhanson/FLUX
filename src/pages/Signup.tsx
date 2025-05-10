import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 text-center">FLUX</h1>
        {formError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {formError}
          </div>
        )}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account type</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as 'client' | 'technician')}
              className="block w-full border-gray-300 rounded-md"
            >
              <option value="client">Client</option>
              <option value="technician">Technician</option>
            </select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Spinner /> : 'Sign Up'}
          </Button>
          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
