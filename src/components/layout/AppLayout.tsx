// src/components/Layout.tsx
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link to="/">
          <h1 className="text-2xl font-bold text-blue-600">FLUX</h1>
        </Link>
        <nav>
          {user ? (
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          ) : null}
        </nav>
      </header>
      <main className="flex-1 p-8 bg-gray-50"> {children} </main>
      <footer className="text-center py-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} FLUX Platform
      <//footer>
    </div>
  );
}

// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import TechDashboard from './pages/dashboard/TechDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/client"
              element={
                <ProtectedRoute role="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/technician"
              element={
                <ProtectedRoute role="technician">
                  <TechDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
