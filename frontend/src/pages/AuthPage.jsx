import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Lock, Mail, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { signInWithGoogle } from '../api/firebase';

export default function AuthPage({ initialRegister = false }) {
  const [isRegister, setIsRegister] = useState(initialRegister);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  return (
    <div className="w-full min-h-screen bg-[#0a0a0f] text-[#f1f0ff] flex flex-col lg:flex-row relative font-sans overflow-x-hidden">
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#7c6aff]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#a78bfa]/10 blur-[120px] pointer-events-none" />

      {/* Left Column Brand Banner */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-16 z-10 select-none">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7c6aff] to-[#a78bfa] flex items-center justify-center text-white shadow-[0_0_20px_rgba(124,106,255,0.4)]">
            <BookOpen size={20} />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white to-[#a78bfa] bg-clip-text text-transparent">JournalAI</span>
        </div>

        <div className="my-auto py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs uppercase tracking-widest text-[#7c6aff] font-bold flex items-center gap-1.5 mb-4">
              <Sparkles size={12} /> Privacy Guaranteed
            </span>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              Your Secure <br />
              <span className="bg-gradient-to-r from-[#7c6aff] via-[#a78bfa] to-[#f1f0ff] bg-clip-text text-transparent">Digital Sanctuary</span>
            </h1>
            <p className="text-lg text-[#9ca3af] max-w-lg leading-relaxed font-medium">
              Reflect, organize, and analyze your thoughts using local vault encryption and AI-powered sentiment pipelines.
            </p>
          </motion.div>
        </div>

        <div className="text-xs text-[#6b7280] font-semibold">
          © {new Date().getFullYear()} JournalAI. End-to-End Cryptographic Protection.
        </div>
      </div>

      {/* Right Column Auth Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-md p-8 bg-white/5 border border-white/10 backdrop-blur-[20px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-6"
        >
          {/* Custom Tabs */}
          <div className="flex p-1 bg-black/30 border border-white/5 rounded-2xl relative">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 z-10 cursor-pointer ${
                !isRegister ? 'text-white' : 'text-[#9ca3af]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 z-10 cursor-pointer ${
                isRegister ? 'text-white' : 'text-[#9ca3af]'
              }`}
            >
              Register
            </button>
            <motion.div
              layoutId="activeTab"
              className="absolute top-1 bottom-1 left-1 right-1 w-[calc(50%-4px)] bg-[#7c6aff] rounded-xl"
              style={{
                x: isRegister ? '100%' : '0%',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-white">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-[#9ca3af] font-semibold mt-1">
              {isRegister ? 'Get started with a free secure account' : 'Please log in to enter your secure vault'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-2xl animate-shake">
              <ShieldAlert size={14} className="shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {isRegister && (
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                  <input
                    type="text"
                    required
                    placeholder="Choose a username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] focus:ring-1 focus:ring-[#7c6aff]/20 outline-none"
                  />
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] focus:ring-1 focus:ring-[#7c6aff]/20 outline-none"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] focus:ring-1 focus:ring-[#7c6aff]/20 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] focus:ring-1 focus:ring-[#7c6aff]/20 outline-none"
                />
              </div>
            </div>

            {isRegister && (
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] focus:ring-1 focus:ring-[#7c6aff]/20 outline-none"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5 cursor-pointer group mt-1 select-none">
                <input
                  type="checkbox"
                  checked={sentimentAnalysis}
                  onChange={(e) => setSentimentAnalysis(e.target.checked)}
                  className="rounded border-white/10 text-[#7c6aff] focus:ring-[#7c6aff]/20 cursor-pointer"
                />
                <span className="text-[11px] text-[#9ca3af] font-semibold group-hover:text-white transition-colors">
                  Enable AI Sentiment Analysis on entries
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#7c6aff] to-[#a78bfa] hover:from-[#6d5be6] hover:to-[#967ce6] text-white font-extrabold rounded-2xl text-sm shadow-[0_4px_20px_rgba(124,106,255,0.2)] hover:shadow-[0_4px_25px_rgba(124,106,255,0.3)] active:scale-[0.99] transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{isRegister ? 'Sign Up' : 'Log In'}</span>
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] text-[#6b7280] font-bold uppercase tracking-widest">Or Continue With</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Glass styled Google Auth Button */}
          <button
            type="button"
            onClick={triggerGoogleOAuth}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google Account</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
