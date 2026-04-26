import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Sparkles, 
  BarChart3, 
  Settings,
  LogOut,
  Moon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ClipboardList, label: 'Daily Log', path: '/logger' },
  { icon: Sparkles, label: 'AI Insights', path: '/insights' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border-premium h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-pink rounded-lg flex items-center justify-center text-white">
            <Moon size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-accent-pink to-lavender bg-clip-text text-transparent">
            Lunara AI
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-premium transition-all duration-200
                ${isActive 
                  ? 'bg-lavender text-accent-pink font-semibold shadow-sm' 
                  : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border-premium">
          <button 
            onClick={clearAuth}
            className="flex items-center gap-3 px-4 py-3 w-full text-text-secondary hover:text-accent-pink hover:bg-peach/10 rounded-premium transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-premium px-2 py-3 flex justify-around items-center z-50 shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-3 py-1 rounded-premium transition-all
              ${isActive ? 'text-accent-pink' : 'text-text-secondary'}
            `}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
