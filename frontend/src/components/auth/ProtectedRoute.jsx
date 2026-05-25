import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

/**
 * Wraps a route and enforces authentication + optional role check.
 * Usage:
 *   <ProtectedRoute allowedRoles={['admin']}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Wrong role — send them to their correct dashboard
    const roleHome = {
      admin: '/admin/dashboard',
      reviewer: '/reviewer/dashboard',
      staff: '/applicant/dashboard',
    };
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }

  return children;
}