import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function RootRedirect() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        navigate('/login', { replace: true });
      } else if (profile.role === 'admin_b2b') {
        navigate('/analytics', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, user, profile, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#6B7280]">Cargando...</p>
      </div>
    </div>
  );
}
