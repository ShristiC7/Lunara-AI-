import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { Shield, LogOut, Download, Trash2, ChevronRight, Moon } from 'lucide-react';

const Toggle: React.FC<{ checked: boolean; onChange: () => void; id: string }> = ({ checked, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lunara-core/20 focus:ring-offset-2 ${checked ? 'bg-lunara-core' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
  </button>
);

export default function Settings() {
  const { user, clearAuth } = useAuthStore();
  const [notifs, setNotifs] = useState({ period: true, daily: true, digest: false, alerts: true });

  return (
    <div className="space-y-10 max-w-2xl animate-in fade-in duration-500">
      <header>
        <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your account and preferences.</p>
      </header>

      {/* Profile */}
      <section className="space-y-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Profile</p>
        <div className="flex items-center gap-5 p-5 bg-white border border-border-default rounded-premium-lg">
          <div className="w-16 h-16 rounded-full bg-lunara-mist flex items-center justify-center text-2xl font-bold text-lunara-core">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">Free Account · End-to-end encrypted</p>
          </div>
          <ChevronRight size={16} strokeWidth={1.5} className="text-slate-300" />
        </div>
      </section>

      {/* Cycle Baseline */}
      <section className="space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cycle Baseline</p>
        <Card>
          {[
            { label: 'Average Cycle Length', default: 28, unit: 'days' },
            { label: 'Average Period Length', default: 5, unit: 'days' },
          ].map(({ label, default: def, unit }) => {
            const [val, setVal] = useState(def);
            return (
              <div key={label} className="flex items-center justify-between py-3.5 border-b border-border-default last:border-0">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setVal(v => Math.max(1, v - 1))}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-slate-500 hover:bg-surface-hover font-bold">−</button>
                  <span className="font-mono text-sm font-semibold text-slate-900 w-10 text-center">{val} {unit}</span>
                  <button onClick={() => setVal(v => v + 1)}
                    className="w-8 h-8 rounded-full border border-border-default flex items-center justify-center text-slate-500 hover:bg-surface-hover font-bold">+</button>
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      {/* Notifications */}
      <section className="space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Notifications</p>
        <Card>
          {[
            { key: 'period', label: 'Period reminder', desc: '3 days before' },
            { key: 'daily', label: 'Daily log reminder', desc: '8:00 PM' },
            { key: 'digest', label: 'Weekly insight digest', desc: 'Every Monday' },
            { key: 'alerts', label: 'Irregularity alerts', desc: 'When detected' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3.5 border-b border-border-default last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <Toggle
                id={`notif-${key}`}
                checked={notifs[key as keyof typeof notifs]}
                onChange={() => setNotifs(n => ({ ...n, [key]: !n[key as keyof typeof notifs] }))}
              />
            </div>
          ))}
        </Card>
      </section>

      {/* Privacy & Data */}
      <section className="space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Privacy &amp; Data</p>
        <Card>
          <div className="flex items-start gap-3 mb-5 pb-5 border-b border-border-default">
            <Shield size={18} strokeWidth={1.5} className="text-lunara-core shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Your health data is encrypted at rest and in transit. We never share or sell your data.
            </p>
          </div>
          <div className="space-y-1">
            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-lunara-core py-2 w-full transition-colors">
              <Download size={15} strokeWidth={1.5} /> Export my data
            </button>
            <a href="#" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-600 py-2 transition-colors">
              View privacy policy
            </a>
            <button className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-phase-menstrual py-2 w-full transition-colors">
              <Trash2 size={15} strokeWidth={1.5} /> Delete my account
            </button>
          </div>
        </Card>
      </section>

      {/* Sign Out */}
      <div>
        <button
          onClick={clearAuth}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} /> Sign out
        </button>
      </div>

      {/* Footer */}
      <footer className="flex items-center gap-2 text-[10px] font-bold text-slate-200 uppercase tracking-widest pb-8">
        <Moon size={10} /> Lunara AI · v1.1.0 · For informational use only. Not a medical diagnosis.
      </footer>
    </div>
  );
}
