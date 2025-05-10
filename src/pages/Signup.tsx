import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, BarChart, User, Users, Wrench } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { UserRole } from '../lib/supabaseClient';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const { error, user } = await signUp(email, password, role);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (user) {
        navigate('/');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-primary-600 text-white flex items-center justify-center rounded-lg">
            <BarChart className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Join FLUX and start managing your workflow
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-error-50 border border-error-300 text-error-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <Input 
                label="Email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                fullWidth
                required
              />
              
              <Input 
                label="Password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                fullWidth
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 border rounded-md transition-colors ${
                      role === 'client'
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                    onClick={() => setRole('client')}
                  >
                    <User className="h-5 w-5 mb-1" />
                    <span className="text-sm font-medium">Client</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 border rounded-md transition-colors ${
                      role === 'technician'
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                    onClick={() => setRole('technician')}
                  >
                    <Wrench className="h-5 w-5 mb-1" />
                    <span className="text-sm font-medium">Technician</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`flex flex-col items-center justify-center p-3 border rounded-md transition-colors ${
                      role === 'admin'
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                    }`}
                    onClick={() => setRole('admin')}
                  >
                    <Users className="h-5 w-5 mb-1" />
                    <span className="text-sm font-medium">Admin</span>
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                fullWidth 
                isLoading={loading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create account
              </Button>
              
              <p className="text-center text-sm text-neutral-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;