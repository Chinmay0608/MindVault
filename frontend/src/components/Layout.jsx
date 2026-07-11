import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BarChart3, Flame, Tag, Settings, LogOut, Search, Bell, Plus, Menu } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const navItems = [
    { label: 'All Entries', icon: BookOpen, path: '/dashboard' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'MV';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-slate-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR - Desktop (>=768px) */}
      <aside className="hidden md:flex flex-col justify-between w-60 shrink-0 bg-[#16161d] border-r border-white/[0.06] p-6 z-20">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white shadow-[0_0_16px_rgba(99,102,241,0.2)]">
              <BookOpen size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-[#a78bfa] bg-clip-text text-transparent">MindVault</span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-[#1e1e28] border border-white/[0.04] rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366f1]/20 to-[#a78bfa]/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
              {getInitials(user?.userName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{user?.userName || 'User'}</div>
              <div className="text-[10px] text-[#818cf8] font-bold uppercase tracking-wider">Free plan</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all border-l-2 cursor-pointer ${
                    isActive
                      ? 'border-[#6366f1] bg-[#1e1e28] text-white'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <item.icon size={16} className={isActive ? 'text-[#818cf8]' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 rounded-xl transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* MOBILE HEADER & BOTTOM NAV (<768px) */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#16161d] border-b border-white/[0.06] z-20">
        <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white">
            <BookOpen size={14} />
          </div>
          <span className="font-bold text-base tracking-tight text-white">MindVault</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/new-entry')}
            className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white shadow-lg"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={handleSignOut}
            className="text-rose-400 p-1"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR - Desktop only */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-white/[0.04] bg-[#0f0f13]/40 backdrop-blur-md sticky top-0 z-10">
          <div className="text-sm text-slate-400 font-medium">
            Welcome back, <span className="text-white font-semibold">{user?.userName}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/new-entry')}
              className="btn-primary"
            >
              <Plus size={16} />
              <span>New Entry</span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#1e1e28] border border-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-all">
              <Bell size={16} />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#16161d]/90 backdrop-blur-lg border-t border-white/[0.06] flex items-center justify-around px-4 z-20 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
                isActive ? 'text-[#818cf8]' : 'text-slate-400'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          onClick={() => navigate('/new-entry')}
          className="flex flex-col items-center gap-1 text-[10px] text-indigo-400 font-semibold"
        >
          <Plus size={18} />
          <span>New</span>
        </button>
      </nav>
    </div>
  );
}
