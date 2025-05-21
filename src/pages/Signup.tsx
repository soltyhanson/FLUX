import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'technician'>('client');
  const [formError, setFormError] = useState<string | null>(null);
  const { signUp, user, loading, error } = useAuth();
  const navigate = useNavigate();

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
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate password length
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    await signUp(email, password, role);
    if (error) setFormError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-neutral-900 mb-6">Sign up for FLUX</h1>
          
          {formError && (
            <div className="mb-4 p-3 rounded bg-error-50 border border-error-200 text-error-700">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                fullWidth
              />
              <p className="mt-1 text-sm text-neutral-500">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'client' | 'technician')}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 focus:border-primary-500"
              >
                <option value="client">Client</option>
                <option value="technician">Technician</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              fullWidth
            >
              Create Account
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;