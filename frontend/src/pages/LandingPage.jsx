import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useEffect } from 'react';
import { BookOpen, CheckSquare, IndianRupee, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If active token exists, push straight to dashboard immediately
    if (localStorage.getItem('token') || user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="relative w-full z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-12 py-8 lg:py-16">
      {/* Dynamic ambient radial glows */}
      <div className="absolute -top-10 -right-10 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-radial from-teal-500/5 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-radial from-blue-500/5 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Left Column Text Content */}
      <div className="lg:col-span-5 flex flex-col items-start text-left w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight">
            Your Mind's Sanctuary.<br />
            <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">Organized & Secured.</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-text-secondary font-medium leading-relaxed max-w-xl my-4 sm:my-6">
            MindVault is an elegant, multi-purpose workspace built to capture your personal daily journals, track fluid interactive to-do lists, log financial diaries, and analyze personal habits. Zero heavy cloud tracking. Completely personalized, local, and encrypted under your control.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 bg-accent-primary hover:opacity-90 active:scale-[0.98] text-white font-extrabold rounded-xl shadow-md shadow-accent-primary/20 transition-all duration-200 cursor-pointer text-sm sm:text-base"
          >
            <span>Launch Your Vault</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Right Column Visual Asymmetric Feature Mesh */}
        <div className="lg:col-span-7 flex items-center justify-center relative min-h-[350px] sm:min-h-[400px] lg:min-h-[500px] w-full">
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative w-full max-w-[480px] h-[350px] sm:h-[400px] flex items-center justify-center scale-90 sm:scale-100"
          >
            {/* Central ambient glow */}
            <div className="absolute w-64 h-64 rounded-full bg-linear-to-tr from-teal-500/10 to-blue-500/5 blur-3xl pointer-events-none" />

            {/* Journal Mock Card (Teal) */}
            <div className="absolute top-4 left-4 w-72 p-5 bg-glass-bg border border-glass-border rounded-2xl shadow-md border-l-4 border-l-teal-500 flex flex-col gap-2 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <BookOpen size={16} />
                </div>
                <span className="font-extrabold text-xs text-text-primary">Mindful Entry</span>
              </div>
              <p className="text-xs font-semibold text-text-secondary leading-relaxed">
                "Reflections captured safely."
              </p>
            </div>

            {/* Tasks Mock Card (Blue) */}
            <div className="absolute bottom-6 left-12 w-64 p-5 bg-glass-bg border border-glass-border rounded-2xl shadow-md border-l-4 border-l-blue-500 flex flex-col gap-2.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-text-primary">Daily Agendas</span>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20">HIGH</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm border border-blue-500 bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-text-secondary line-through">Placement strategy prep</span>
              </div>
            </div>

            {/* Finances Mock Card (Amber) */}
            <div className="absolute top-36 right-4 w-60 p-5 bg-glass-bg border border-glass-border rounded-2xl shadow-md border-l-4 border-l-amber-500 flex flex-col gap-2 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-text-primary">Expense Ledger</span>
                <span className="text-[10px] text-amber-400 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 font-sans">₹8,450.00</span>
              </div>
              <p className="text-[10px] text-text-secondary font-semibold">Category: Travel & Relocation</p>
            </div>

            {/* Subtle accent dots */}
            <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-teal-300 rounded-full blur-xs animate-ping" />
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-slate-300 rounded-full" />
          </motion.div>
        </div>
    </div>
  );
}
