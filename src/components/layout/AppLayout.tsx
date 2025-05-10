import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings, BarChart, Users, Wrench } from 'lucide-react';
import Button from '../ui/Button';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-primary-600 text-white flex items-center justify-center rounded">
                  <BarChart className="h-5 w-5" />
                </div>
                <span className="ml-2 text-xl font-bold text-primary-900">FLUX</span>
              </Link>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center">
                  <span className="text-sm text-neutral-600 mr-4">
                    {user.email}
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {user.role}
                    </span>
                  </span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-neutral-600"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        {user && (
          <aside className="w-64 bg-white border-r border-neutral-200 hidden md:block">
            <div className="h-full px-3 py-4 overflow-y-auto">
              <div className="space-y-2 font-medium">
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-3 mb-1">
                  Dashboard
                </p>
                
                {user.role === 'admin' && (
                  <Link
                    to="/dashboard/admin"
                    className="flex items-center p-2 text-neutral-900 rounded-lg hover:bg-neutral-100 group transition-colors"
                  >
                    <Users className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 transition-colors" />
                    <span className="ml-3">Admin Dashboard</span>
                  </Link>
                )}
                
                {user.role === 'client' && (
                  <Link
                    to="/dashboard/client"
                    className="flex items-center p-2 text-neutral-900 rounded-lg hover:bg-neutral-100 group transition-colors"
                  >
                    <User className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 transition-colors" />
                    <span className="ml-3">Client Dashboard</span>
                  </Link>
                )}
                
                {user.role === 'technician' && (
                  <Link
                    to="/dashboard/tech"
                    className="flex items-center p-2 text-neutral-900 rounded-lg hover:bg-neutral-100 group transition-colors"
                  >
                    <Wrench className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 transition-colors" />
                    <span className="ml-3">Technician Dashboard</span>
                  </Link>
                )}
                
                <div className="pt-4 mt-4 border-t border-neutral-200">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-3 mb-1">
                    Account
                  </p>
                  <Link
                    to="/settings"
                    className="flex items-center p-2 text-neutral-900 rounded-lg hover:bg-neutral-100 group transition-colors"
                  >
                    <Settings className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 transition-colors" />
                    <span className="ml-3">Settings</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;