import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BarChart3, Settings, LogOut, Bell, Plus, Sun, Moon, Shield, Lock, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* SIDEBAR - Desktop (>=768px) */}
      <aside className="hidden md:flex flex-col justify-between w-60 shrink-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] p-6 z-20 transition-colors duration-200">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white shadow-[0_0_16px_rgba(99,102,241,0.2)]">
              <BookOpen size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-[var(--text-primary)] to-[#a78bfa] bg-clip-text text-transparent">MindVault</span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366f1]/20 to-[#a78bfa]/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {getInitials(user?.userName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate text-[var(--text-primary)]">{user?.userName || 'User'}</div>
              <div className="text-[10px] text-[#818cf8] font-bold uppercase tracking-wider">Free plan</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all border-l-2 cursor-pointer ${
                    isActive
                      ? 'border-[#6366f1] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  <item.icon size={16} className={isActive ? 'text-[#818cf8]' : 'text-[var(--text-secondary)]'} />
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
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] z-20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white">
            <BookOpen size={14} />
          </div>
          <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">MindVault</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-all duration-300 active:scale-90 active:rotate-45"
          >
            {theme === 'dark' ? <Sun size={15} className="transition-transform duration-300 transform rotate-0" /> : <Moon size={15} className="transition-transform duration-300 transform rotate-0" />}
          </button>
          {location.pathname !== '/new-entry' && (
            <button
              onClick={() => navigate('/new-entry')}
              aria-label="New Entry"
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white shadow-lg"
            >
              <Plus size={16} />
            </button>
          )}
          <button
            onClick={handleSignOut}
            aria-label="Sign Out"
            className="text-rose-400 p-1 cursor-pointer"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR - Desktop only */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="text-sm text-[var(--text-secondary)] font-medium">
            Welcome back, <span className="text-[var(--text-primary)] font-semibold">{user?.userName}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Light/Dark Theme"
              className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-all duration-300 active:scale-90 hover:scale-105"
            >
              {theme === 'dark' ? <Sun size={16} className="transition-transform duration-300 hover:rotate-12" /> : <Moon size={16} className="transition-transform duration-300 hover:-rotate-12" />}
            </button>
            <div className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-all">
              <Bell size={16} />
            </div>
            {location.pathname !== '/new-entry' && (
              <button
                onClick={() => navigate('/new-entry')}
                className="btn-primary"
              >
                <Plus size={16} />
                <span>New Entry</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <Outlet />
          </div>

          {/* Integrated App Footer */}
          <footer className="mt-16 pt-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--text-secondary)]">MindVault</span>
              <span>— Secure AI-Powered Journal Sanctuary</span>
            </div>
            <div className="flex items-center gap-5">
              <Link to="/privacy-shield" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
                <Shield size={12} /> Privacy Shield
              </Link>
              <Link to="/zero-knowledge" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
                <Lock size={12} /> Zero-Knowledge
              </Link>
              <Link to="/data-audit" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
                <Eye size={12} /> Data Audit
              </Link>
            </div>
          </footer>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-surface)]/90 backdrop-blur-lg border-t border-[var(--border-subtle)] flex items-center justify-around px-4 z-20 pb-safe" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-all ${
                isActive ? 'text-[#818cf8]' : 'text-[var(--text-secondary)]'
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
