import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Settings, ShieldAlert, Sparkles, User, Lock, Trash2, Loader2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { showToast } = useToast();
  const [userName, setUserName] = useState(user?.userName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState(user?.location || '');
  const [sentimentAnalysis, setSentimentAnalysis] = useState(user?.sentimentAnalysis !== false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete confirm
  const [confirmUsername, setConfirmUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        userName,
        email,
        location,
        sentimentAnalysis
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        password: newPassword
      });
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast('Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmUsername !== user.userName) {
      showToast('Please type your exact username to confirm deletion.', 'error');
      return;
    }
    if (!window.confirm('WARNING: Deleting your account is permanent. All entries will be purged. Proceed?')) {
      return;
    }
    setLoading(true);
    try {
      await deleteAccount();
      showToast('Account permanently closed.', 'success');
    } catch (err) {
      showToast('Failed to delete account.', 'error');
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'MV';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-2xl mx-auto space-y-8 pb-20"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="text-[#818cf8]" />
          <span>System Settings</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure profile metrics, security keys, and AI features.</p>
      </div>

      {/* Profile Info */}
      <div className="card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/[0.04] pb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] flex items-center justify-center text-white font-bold text-lg shadow-[0_0_16px_rgba(99,102,241,0.25)]">
            {getInitials(user?.userName)}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Your Profile</h3>
            <span className="text-xs text-slate-500 font-medium">{user?.email}</span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Location (Optional)</label>
            <input
              type="text"
              placeholder="e.g. New York, USA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <Save size={14} />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Security Info */}
      <div className="card p-6 md:p-8 space-y-6">
        <h3 className="text-base font-bold text-white border-b border-white/[0.04] pb-4 flex items-center gap-2">
          <Lock size={16} /> Update Vault Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>Change Password</span>
          </button>
        </form>
      </div>

      {/* AI Settings */}
      <div className="card p-6 md:p-8 space-y-5">
        <h3 className="text-base font-bold text-white border-b border-white/[0.04] pb-4 flex items-center gap-2">
          <Sparkles size={16} /> AI Engine Preferences
        </h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] cursor-pointer group">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-white">Enable Gemini sentiment analysis</span>
              <span className="text-[10px] text-slate-500">Run asynchronous sentiment score checks via Kafka</span>
            </div>
            <input
              type="checkbox"
              checked={sentimentAnalysis}
              onChange={(e) => {
                setSentimentAnalysis(e.target.checked);
                updateProfile({ sentimentAnalysis: e.target.checked });
                showToast('AI preferences updated', 'success');
              }}
              className="rounded border-white/10 text-[#6366f1] focus:ring-[#6366f1]/20 cursor-pointer"
            />
          </label>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-white">Analysis Model Version</span>
              <span className="text-[10px] text-slate-500">Currently executing endpoint version</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[#818cf8] font-bold">
              Gemini Flash 2.0
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 md:p-8 space-y-5 border-rose-500/20 bg-rose-500/[0.01]">
        <h3 className="text-base font-bold text-rose-400 border-b border-rose-500/10 pb-4 flex items-center gap-2">
          <ShieldAlert size={16} /> Danger Zone
        </h3>

        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Deleting account will erase all journal logs, metrics, streaks, and data caches permanently. This cannot be undone.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Type username <span className="text-white">"{user?.userName}"</span> to confirm:</label>
            <input
              type="text"
              placeholder="Type username"
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              className="input border-rose-500/20 focus:border-rose-500"
            />
          </div>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={loading || confirmUsername !== user?.userName}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-2xl text-xs cursor-pointer transition-all"
          >
            <Trash2 size={14} />
            <span>Close Account & Purge Vault</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
