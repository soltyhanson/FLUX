import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="flex items-center space-x-6">
          <Link to="/">
            <h1 className="text-2xl font-bold text-blue-600">FLUX</h1>
          </Link>
          {user && (
            <nav className="space-x-4">
              <Link to="/dashboard/admin" className="hover:underline">
                Dashboard
              </Link>
              <Link to="/jobs" className="hover:underline">
                Jobs
              </Link>
            </nav>
          )}
        </div>
        <div>
          {user && (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} FLUX Platform
      </footer>
    </div>
  );
}