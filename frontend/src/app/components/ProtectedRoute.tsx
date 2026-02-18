import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../../utils/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  // If we have a user but no profile yet, we wait as long as loading is true
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B7280]">Cargando...</p>
        </div>
      </div>
    );
  }

  // If no user or no profile after loading is done, go to login
  if (!user || !profile) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect based on user's actual role
    if (profile.role === 'user') {
      return <Navigate to="/dashboard" replace />;
    } else if (profile.role === 'admin_b2b') {
      return <Navigate to="/analytics" replace />;
    }
  }

  return <>{children}</>;
}