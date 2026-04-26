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
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border-default h-screen sticky top-0 shrink-0">
        {/* Brand */}
        <div className="px-6 py-6 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-lunara-core flex items-center justify-center">
            <Moon className="text-white" size={16} strokeWidth={1.5} fill="currentColor" />
          </div>
          <span className="text-[18px] font-semibold tracking-tight text-slate-900" style={{ letterSpacing: '-0.02em' }}>
            Lunara <span className="font-normal opacity-50">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-premium-md text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-lunara-mist text-lunara-core'
                    : 'text-slate-500 hover:bg-surface-hover hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={1.5} />
                  {label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--phase-color)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-border-default">
          <button
            onClick={clearAuth}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-premium-md text-sm font-semibold text-slate-400 hover:text-slate-700 hover:bg-surface-hover transition-all duration-150"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border-default flex justify-around items-center py-2 px-2 safe-area-pb">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-premium-md transition-all duration-150 min-w-[56px] ${
                isActive ? 'text-lunara-core' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-semibold">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
