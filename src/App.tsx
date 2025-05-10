import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import TechDashboard from './pages/dashboard/TechDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { User } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes with proper layouts */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/dashboard/client" replace />} />
          
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard/client" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <AppLayout>
                  <ClientDashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard/tech" 
            element={
              <ProtectedRoute allowedRoles={['technician']}>
                <AppLayout>
                  <TechDashboard />
                </AppLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;