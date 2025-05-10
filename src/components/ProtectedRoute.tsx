import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: string[];
}) {
  const { session, user, loading } = useAuth();
  if (loading) return null;      // or <div>Loading…</div>
  if (!session || !user || !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
