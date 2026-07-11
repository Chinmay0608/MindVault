import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Lock, Mail, ShieldAlert, Sparkles, Check, Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle } from '../api/firebase';

export default function AuthPage({ initialRegister = false }) {
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, loginWithFirebase } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signup(userName, email, password, sentimentAnalysis);
        showToast('Account successfully created! Please log in.', 'success');
        setIsRegister(false);
      } else {
        await login(userName, password);
        showToast('Welcome back to your secure sanctuary!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Authentication failed';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleOAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const idToken = await signInWithGoogle();
      await loginWithFirebase(idToken);
      showToast('Welcome back to your secure sanctuary!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Google Authentication failed';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full min-h-screen text-slate-100 flex relative font-sans overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 60%), #0f0f13'
      }}
    >
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#6366f1]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#a78bfa]/5 blur-[120px] pointer-events-none" />

      {/* Left Column Brand Banner (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 z-10 select-none border-r border-white/[0.04] bg-neutral-950/20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <BookOpen size={20} />
          </div>
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-[#a78bfa] bg-clip-text text-transparent">MindVault</span>
        </div>

        <div className="my-auto max-w-lg">
          <span className="text-xs uppercase tracking-widest text-[#818cf8] font-bold flex items-center gap-1.5 mb-4">
            <Sparkles size={12} /> Intelligence Meets Privacy
          </span>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] mb-6">
            Your thoughts, <br />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-white bg-clip-text text-transparent">understood.</span>
          </h1>
          <p className="text-base text-slate-400 mb-8 leading-relaxed">
            AI-powered journaling that reads between the lines. Discover mood patterns, build habits, and keep your reflection vault completely secure.
          </p>

          <div className="flex flex-col gap-4 mb-10">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                ✦
              </div>
              <span>Gemini AI sentiment analysis</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                ✦
              </div>
              <span>Mood trend analytics</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                ✦
              </div>
              <span>Streak tracking</span>
            </div>
          </div>

          <div className="p-5 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
            <p className="text-xs text-slate-400 italic mb-3">
              "MindVault helped me understand my own patterns in ways I couldn't before."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                JD
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Developer Portfolio Testimonial</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-medium">
          © {new Date().getFullYear()} MindVault. Fully Refactored Sanctuary.
        </div>
      </div>

      {/* Right Column Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md p-8 bg-[#16161d] border border-white/[0.06] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col gap-6"
        >
          {/* Logo on mobile only */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white">
              <BookOpen size={16} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">MindVault</span>
          </div>

          {/* Custom Tabs */}
          <div className="flex p-1 bg-black/20 border border-white/[0.04] rounded-2xl relative">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 z-10 cursor-pointer ${
                !isRegister ? 'text-white' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 z-10 cursor-pointer ${
                isRegister ? 'text-white' : 'text-slate-400'
              }`}
            >
              Create Account
            </button>
            <motion.div
              className="absolute top-1 bottom-1 left-1 right-1 w-[calc(50%-4px)] bg-[#6366f1] rounded-xl z-0"
              animate={{
                x: isRegister ? '100%' : '0%',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isRegister ? 'Get Started' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister ? 'Sign up for a secure account' : 'Access your private journal vault'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <ShieldAlert size={14} className="shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {isRegister && (
              <div className="flex flex-col gap-1.5 animate-fadeIn">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="flex flex-col gap-1.5 animate-fadeIn">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pl-10 pr-10"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] cursor-pointer group mt-1 select-none">
                <input
                  type="checkbox"
                  checked={sentimentAnalysis}
                  onChange={(e) => setSentimentAnalysis(e.target.checked)}
                  className="rounded border-white/10 text-[#6366f1] focus:ring-[#6366f1]/20 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 font-medium group-hover:text-white transition-colors">
                  Enable AI Sentiment Analysis
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>Continue</span>
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/[0.04]"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/[0.04]"></div>
          </div>

          <button
            type="button"
            onClick={triggerGoogleOAuth}
            className="btn-ghost w-full"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-xs text-center text-slate-500 mt-2">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-[#818cf8] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
