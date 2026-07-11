import { Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0a0f] text-[#6b7280] font-sans border-t border-white/10 px-6 pt-16 pb-8 mt-auto z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
        
        {/* Left Column Brand & Identity Panel */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <h2 className="text-white font-extrabold text-2xl tracking-tight">JournalAI</h2>
          <p className="text-sm text-[#9ca3af] font-medium leading-relaxed max-w-sm">
            Your personal space for daily reflections, goals, and metrics. Encrypted, secure, and built for your peace of mind.
          </p>
        </div>

        {/* Middle Column Product/Features */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h3 className="text-white font-bold text-xs uppercase tracking-widest">Platform</h3>
          <nav className="flex flex-col gap-2">
            <Link to="/dashboard" className="text-xs font-semibold hover:text-white transition-colors duration-200">
              Workspace
            </Link>
            <Link to="/profile" className="text-xs font-semibold hover:text-white transition-colors duration-200">
              My Profile
            </Link>
            <Link to="/new-entry" className="text-xs font-semibold hover:text-white transition-colors duration-200">
              New Entry
            </Link>
          </nav>
        </div>

        {/* Middle Column Security & Privacy */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h3 className="text-white font-bold text-xs uppercase tracking-widest">Security</h3>
          <nav className="flex flex-col gap-2">
            <Link to="/privacy-shield" className="text-xs font-semibold hover:text-white transition-colors duration-200">
              Privacy Shield
            </Link>
            <Link to="/zero-knowledge" className="text-xs font-semibold hover:text-white transition-colors duration-200">
              Zero-Knowledge
            </Link>
            <Link to="/data-audit" className="text-xs font-semibold hover:text-white transition-colors duration-200">
              Data Audit
            </Link>
          </nav>
        </div>

        {/* Right Column Security Status */}
        <div className="md:col-span-4 flex flex-col gap-4 items-start md:items-end">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#a78bfa] bg-[#7c6aff]/10 border border-[#7c6aff]/20 px-3 py-2 rounded-xl shadow-xs">
            <Shield size={14} className="text-[#a78bfa]" />
            <span>AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#6b7280] font-bold">
            <Lock size={12} />
            <span>Local Database Storage Mode</span>
          </div>
        </div>

      </div>

      {/* Bottom Copyright and Micro-links */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 text-[10px] font-extrabold tracking-widest text-[#6b7280] uppercase gap-4">
        <div>SECURE ENCRYPTED LEDGER SYSTEM &copy; {new Date().getFullYear()}</div>
        <div className="flex gap-6 font-bold">
          <Link to="/" className="hover:text-white transition-colors">Terms</Link>
          <Link to="/" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/" className="hover:text-white transition-colors">Guidelines</Link>
        </div>
      </div>
    </footer>
  );
}
