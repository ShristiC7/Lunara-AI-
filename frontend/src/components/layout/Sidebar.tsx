import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Sparkles,
  SlidersHorizontal,
  LogOut,
  Moon,
  MessageSquare,
  Bot,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: MessageSquare, label: 'Community', path: '/community' },
  { icon: Bot, label: 'Ask Lunara', path: '/chat' },
  { icon: Sparkles, label: 'AI Insights', path: '/insights' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: SlidersHorizontal, label: 'Settings', path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border-default h-screen sticky top-0 shrink-0 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-lunara-mist/40 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Brand */}
        <div className="px-6 py-8 flex items-center gap-3 relative z-10 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lunara-core to-lunara-glow flex items-center justify-center shadow-lg shadow-lunara-core/20 soft-glow transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Moon className="text-white" size={20} strokeWidth={1.5} fill="currentColor" />
          </div>
          <span className="text-xl font-heading font-bold tracking-tight text-slate-900">
            Lunara <span className="text-lunara-core font-normal">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1 relative z-10">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-premium-lg text-sm font-heading font-semibold transition-all duration-300 group ${
                  isActive
                    ? 'bg-lunara-mist text-lunara-core soft-glow'
                    : 'text-slate-500 hover:bg-surface-hover hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white/50'}`}>
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  {label}
                  {isActive && (
                    <div className="ml-auto w-1 h-4 rounded-full bg-lunara-core" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-border-default relative z-10">
          <button
            onClick={clearAuth}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-premium-lg text-sm font-heading font-semibold text-slate-400 hover:text-slate-700 hover:bg-surface-hover transition-all duration-200"
          >
            <div className="p-1.5 rounded-lg">
              <LogOut size={18} strokeWidth={1.5} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-border-default flex justify-around items-center py-3 px-4 safe-area-pb shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        {NAV_ITEMS.slice(0, 5).map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-300 min-w-[64px] ${
                isActive ? 'text-lunara-core scale-110' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-lunara-mist soft-glow' : ''}`}>
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <span className={`text-[10px] font-heading font-bold ${isActive ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
