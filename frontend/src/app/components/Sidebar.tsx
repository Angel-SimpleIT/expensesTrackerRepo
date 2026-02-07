import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Clock, 
  MessageCircle, 
  TrendingUp, 
  Database,
  LogOut,
  Radio,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  // Define menu items based on role
  const userMenuItems = [
    { icon: LayoutDashboard, label: 'Mi Dashboard', path: '/dashboard' },
    { icon: Clock, label: 'Historial', path: '/history' },
    { icon: MessageCircle, label: 'Chat Bot', path: '/chat' },
  ];

  const adminMenuItems = [
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: TrendingUp, label: 'Market Insights', path: '/insights' },
    { icon: Database, label: 'Global Data', path: '/global-data' },
    { icon: Users, label: 'User Management', path: '/users' },
  ];

  const menuItems = profile?.role === 'admin_b2b' ? adminMenuItems : userMenuItems;

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#09090b]">SmartSpend</h1>
            <p className="text-xs text-[#6B7280]">
              {profile?.role === 'admin_b2b' ? 'Admin Panel' : 'Personal'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {profile?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#09090b] truncate">{profile?.name}</p>
            <p className="text-xs text-[#6B7280] truncate">{profile?.email}</p>
          </div>
        </div>
        {profile?.role === 'user' && (
          <div className="mt-3 flex items-center gap-2 px-2 py-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
            <Radio className="w-3 h-3 text-[#10B981]" />
            <span className="text-xs text-[#10B981] font-medium">Bot activo</span>
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse ml-auto" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  active
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#09090b]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - Sign Out */}
      <div className="p-4 border-t border-[#E5E7EB]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#DC2626] hover:bg-[#FEF2F2] font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
