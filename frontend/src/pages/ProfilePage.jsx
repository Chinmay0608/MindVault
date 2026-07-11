import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import BackgroundGradient from '../components/BackgroundGradient';
import { User, Mail, Lock, ShieldAlert, CheckCircle, AlertCircle, Trash2, MapPin, Compass } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { showToast } = useToast();
  
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [sentimentAnalysis, setSentimentAnalysis] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (user) {
      setUserName(user.userName || '');
      setEmail(user.email || '');
      setLocation(user.location || '');
      setSentimentAnalysis(user.sentimentAnalysis || false);
    }
  }, [user]);

  const fallbackToIpLocation = async () => {
    showToast('Attempting to locate via IP network...', 'info');
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data && data.city) {
        setLocation(data.city);
        showToast(`Located via network: ${data.city}!`, 'success');
      } else {
        throw new Error('Invalid IP data');
      }
    } catch (err) {
      showToast('Could not acquire location. Please type manually.', 'error');
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      fallbackToIpLocation();
      return;
    }
    
    showToast('Locating your position...', 'info');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.state || 'Mumbai';
          setLocation(city);
          showToast(`Location set to ${city}!`, 'success');
        } catch (err) {
          fallbackToIpLocation();
        }
      },
      (error) => {
        fallbackToIpLocation();
      }
    );
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({
        userName,
        email,
        password: password || undefined, // send only if written
        sentimentAnalysis,
        location,
      });
      const msg = 'Profile updated successfully!';
      setSuccess(msg);
      showToast(msg, 'success');
      setPassword('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update profile.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== userName) {
      setError('Username confirmation does not match.');
      return;
    }
    setLoading(true);
    try {
      await deleteAccount();
    } catch (err) {
      setError('Failed to delete account.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 text-[#f1f0ff] relative">
      <BackgroundGradient />
      <main className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Profile & Vault Settings</h1>
          <p className="text-sm text-[#9ca3af] font-semibold mt-1">Manage your identity, encryption credentials, and data preferences.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-2xl">
            <AlertCircle size={16} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <CheckCircle size={16} />
            <span className="font-bold">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Main profile settings card */}
          <GlassCard className="col-span-1 md:col-span-2 p-8 border-white/10">
            <h2 className="text-lg font-black text-white mb-6">Security Credentials</h2>

            <form onSubmit={handleUpdate} className="flex flex-col gap-5">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Username</label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 text-[#6b7280]" size={16} />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#7c6aff] focus:bg-white/10 outline-none rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 font-semibold"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 text-[#6b7280]" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#7c6aff] focus:bg-white/10 outline-none rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 font-semibold"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Location</label>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1 flex items-center">
                    <MapPin className="absolute left-4 text-[#6b7280]" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#7c6aff] focus:bg-white/10 outline-none rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-[#a78bfa] hover:text-white rounded-2xl transition-all duration-200 cursor-pointer"
                    title="Detect Current Location"
                  >
                    <Compass size={18} />
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">New Password (leave empty to keep current)</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 text-[#6b7280]" size={16} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 focus:border-[#7c6aff] focus:bg-white/10 outline-none rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 font-semibold"
                  />
                </div>
              </div>

              {/* Sentiment Analysis Toggle */}
              <div className="flex items-center gap-3 py-2 select-none">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sentimentAnalysis}
                    onChange={(e) => setSentimentAnalysis(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c6aff] border border-white/10"></div>
                </label>
                <span className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest">Enable Sentiment Analysis</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#7c6aff] to-[#a78bfa] hover:from-[#6d5be6] hover:to-[#967ce6] text-white font-extrabold rounded-2xl shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                Save Profile
              </button>
            </form>
          </GlassCard>

          {/* Account Deletion Area */}
          <div className="col-span-1 flex flex-col gap-6">
            <div className="p-6 bg-[#f87171]/5 border border-[#f87171]/20 rounded-3xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-[#f87171] font-black text-base mb-3">
                <ShieldAlert size={20} />
                <span>Danger Zone</span>
              </div>
              
              <p className="text-xs text-[#9ca3af] font-bold leading-relaxed mb-4">
                Deleting your account will permanently wipe all your encrypted entries. This action is irreversible.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2.5 bg-white/5 hover:bg-[#f87171]/10 border border-[#f87171]/20 text-[#f87171] font-bold rounded-2xl text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-extrabold text-[#f87171] uppercase tracking-wide">
                    Type your username <code className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">{user?.userName}</code> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Confirm username"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-[#f87171]/20 focus:border-[#f87171] outline-none rounded-2xl text-xs text-white"
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || deleteConfirmText !== user?.userName}
                      className="flex-1 py-2.5 bg-[#f87171] hover:bg-[#e15a5a] text-white text-xs font-extrabold rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
