// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import TechDashboard from './pages/dashboard/TechDashboard';
import JobsList from './components/JobsList';
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
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/client"
              element={
                <ProtectedRoute roles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/technician"
              element={
                <ProtectedRoute roles={['technician']}>
                  <TechDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedRoute roles={['admin', 'client', 'technician']}>
                  <JobsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute roles={['admin', 'technician']}>
                  <div>Job Form Create (to be implemented)</div>
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