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
  Users,
  Settings,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../assets/logo.png';
import simpleItLogo from '../../assets/simple_it_logo.png';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
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
    { icon: Settings, label: 'Configuración', path: '/settings' },
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
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-[#E5E7EB] flex flex-col h-screen sticky top-0 transition-all duration-300 z-50`}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-[#E5E7EB] rounded-full p-1 shadow-sm hover:bg-[#F9FAFB] text-[#6B7280] hidden lg:flex"
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4 rotate-180" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className={`p-6 border-b border-[#E5E7EB] ${isCollapsed ? 'flex justify-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-xl font-black tracking-tighter text-[#111827]">S</span>
            <span className="text-xl font-light tracking-tighter text-[#025864]">IT</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-[#025864] leading-tight">SmartSpend</h1>
              <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold">
                by Simple IT
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className={`px-4 py-4 border-b border-[#E5E7EB] ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#025864] to-[#00D47E] flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
            {profile?.name.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#09090b] truncate">{profile?.name}</p>
              <p className="text-xs text-[#6B7280] truncate">{profile?.email}</p>
            </div>
          )}
        </div>
        {!isCollapsed && profile?.role === 'user' && (
          <div className="mt-3 flex items-center gap-2 px-2 py-1.5 bg-[#E5FAF2] border border-[#00D47E]/20 rounded-lg">
            <Radio className="w-3 h-3 text-[#00D47E]" />
            <span className="text-xs text-[#00D47E] font-medium">
              {profile?.bot_user_id ? 'WhatsApp conectado' : 'Bot disponible'}
            </span>
            <span className="w-1.5 h-1.5 bg-[#00D47E] rounded-full animate-pulse ml-auto" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${active
                  ? 'bg-[#025864] text-white shadow-sm'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#025864]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - Sign Out */}
      <div className={`p-4 border-t border-[#E5E7EB] ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleSignOut}
          title={isCollapsed ? "Cerrar sesión" : undefined}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#DC2626] hover:bg-[#FEF2F2] font-medium transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Cerrar sesión</span>}
        </button>
      </div>
      {/* Attribution Footer */}
      {!isCollapsed && (
        <div className="p-4 mt-auto border-t border-[#E5E7EB] bg-[#F9FAFB]/50">
          <p className="text-[10px] text-[#9CA3AF] font-medium text-center">
            Diseñado y desarrollado por
          </p>
          <p className="text-xs text-[#025864] font-bold text-center">
            Simple IT
          </p>
        </div>
      )}
    </aside>
  );
}