import { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { BookOpen, User, LogOut, Sparkles, Sun, Moon } from 'lucide-react';

export default function NavBar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const handleLogoClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-transparent transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white shadow-[0_0_15px_var(--accent-glow)] shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-extrabold text-base sm:text-xl tracking-tight bg-gradient-to-r from-text-primary to-accent-secondary bg-clip-text text-transparent select-none">JournalAI</span>
        </div>

        {/* Right side navigation and theme actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-glass-bg border border-glass-border hover:bg-glass-hover text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer shadow-xs"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Navigation & Logout */}
          {user ? (
            <nav className="flex items-center gap-3">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-accent-primary text-white shadow-[0_4px_20px_var(--accent-glow)] border border-accent-primary/20' 
                      : 'text-text-secondary hover:text-text-primary bg-glass-bg border border-transparent hover:border-glass-border hover:bg-glass-hover'
                  }`
                }
              >
                <BookOpen size={15} />
                <span>Journal</span>
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-accent-primary text-white shadow-[0_4px_20px_var(--accent-glow)] border border-accent-primary/20' 
                      : 'text-text-secondary hover:text-text-primary bg-glass-bg border border-transparent hover:border-glass-border hover:bg-glass-hover'
                  }`
                }
              >
                <User size={15} />
                <span>Profile</span>
              </NavLink>

              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-2xl text-sm font-bold text-text-muted hover:text-negative hover:bg-negative/10 border border-transparent hover:border-negative/20 transition-all duration-300 cursor-pointer"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </nav>
          ) : (
            <div className="flex items-center gap-3 sm:gap-6">
              <Link to="/login" className="text-xs sm:text-sm font-bold text-text-secondary hover:text-text-primary transition-colors shrink-0">
                Sign In
              </Link>
              <button
                onClick={() => navigate('/signup')}
                className="px-3.5 py-2 sm:px-5 sm:py-2.5 text-[10px] sm:text-xs font-extrabold text-white bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-90 rounded-xl transition-all cursor-pointer shadow-md shrink-0"
              >
                Create Free Vault
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
