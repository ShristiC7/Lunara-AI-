import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { User, Shield, Bell, Database, LogOut, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { user, clearAuth } = useAuthStore();

  const settingsSections = [
    { 
      title: 'Profile Settings', 
      icon: User, 
      items: ['Edit Profile', 'Change Password', 'Export Data'] 
    },
    { 
      title: 'Privacy & Security', 
      icon: Shield, 
      items: ['Encryption Keys', 'Session Management', 'Delete Account'] 
    },
    { 
      title: 'Notifications', 
      icon: Bell, 
      items: ['Cycle Alerts', 'Daily Log Reminders', 'Insight Notifications'] 
    },
    { 
      title: 'Data Storage', 
      icon: Database, 
      items: ['Sync to Cloud', 'Offline Mode', 'Clear Local Cache'] 
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-text-primary">Settings</h1>
        <p className="text-text-secondary">Manage your account and data privacy.</p>
      </header>

      {/* User Header */}
      <div className="bg-white p-8 rounded-premium border border-border-premium shadow-subtle flex items-center gap-6">
        <div className="w-20 h-20 bg-lavender rounded-full flex items-center justify-center text-accent-pink text-3xl font-black">
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-text-primary">{user?.email}</h2>
          <p className="text-sm text-text-secondary">Premium Account • Securely Encrypted</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => (
          <Card key={section.title} className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <section.icon className="text-accent-pink" size={20} />
              <h3 className="font-bold text-text-primary">{section.title}</h3>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button 
                  key={item} 
                  className="w-full flex justify-between items-center px-2 py-3 rounded-lg hover:bg-background transition-colors group"
                >
                  <span className="text-sm text-text-secondary group-hover:text-text-primary">{item}</span>
                  <ChevronRight size={16} className="text-text-secondary/40" />
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <Button 
          variant="outline" 
          className="w-full border-peach text-accent-pink hover:bg-peach/10"
          onClick={clearAuth}
        >
          <LogOut size={20} className="mr-2" />
          Sign Out of Lunara AI
        </Button>
      </div>

      <p className="text-center text-[10px] text-text-secondary font-medium uppercase tracking-widest">
        Version 1.1.0 • Built with Calm Intelligence
      </p>
    </div>
  );
}
