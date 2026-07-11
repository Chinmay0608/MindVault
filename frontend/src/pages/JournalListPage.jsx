import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useJournalEntries from '../hooks/useJournalEntries';
import { useAuth } from '../context/AuthContext';
import EntryCard from '../components/EntryCard';
import { Plus, Search, BookOpen, AlertCircle, RefreshCw, Calendar, Flame, Tag, HelpCircle, AlertTriangle, Smile } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JournalListPage() {
  const { entries, loading, error, refetch } = useJournalEntries();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFiltered(entries);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        entries.filter(
          (e) =>
              e.title?.toLowerCase().includes(q) ||
              e.content?.toLowerCase().includes(q) ||
              e.tags?.some(t => t.toLowerCase().includes(q)) ||
              e.sentimentScore?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, entries]);

  // Stats calculations
  const totalEntries = entries.length;

  const entriesThisWeek = entries.filter(e => {
    if (!e.date) return false;
    const date = new Date(e.date);
    const diffTime = Math.abs(new Date() - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const currentStreak = user?.currentStreak || 0;

  // Mood calculations for Distribution Bar
  const moodCounts = entries.reduce((acc, curr) => {
    const score = (curr.sentimentScore || 'NEUTRAL').toUpperCase();
    if (score.includes('POSITIVE') || score.includes('HAPPY')) {
      acc.POSITIVE++;
    } else if (score.includes('NEGATIVE') || score.includes('SAD') || score.includes('ANGRY')) {
      acc.NEGATIVE++;
    } else {
      acc.NEUTRAL++;
    }
    return acc;
  }, { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 });

  const totalMoods = moodCounts.POSITIVE + moodCounts.NEGATIVE + moodCounts.NEUTRAL || 1;
  const pctPositive = Math.round((moodCounts.POSITIVE / totalMoods) * 100);
  const pctNegative = Math.round((moodCounts.NEGATIVE / totalMoods) * 100);
  const pctNeutral = Math.round((moodCounts.NEUTRAL / totalMoods) * 100);

  const containerVariants = {
    animate: { transition: { staggerChildren: 0.06 } }
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
      className="space-y-8 pb-20"
    >
      {/* Top Search & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-11"
          />
        </div>

        <button
          onClick={() => navigate('/new-entry')}
          className="btn-primary md:hidden"
        >
          <Plus size={16} />
          <span>New Entry</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Entries</div>
            <div className="text-2xl font-bold text-white mt-0.5">{totalEntries}</div>
            <div className="text-[10px] text-slate-500 mt-1">All thoughts recorded</div>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">This Week</div>
            <div className="text-2xl font-bold text-white mt-0.5">{entriesThisWeek}</div>
            <div className="text-[10px] text-slate-500 mt-1">Logged last 7 days</div>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Streak</div>
            <div className="text-2xl font-bold text-amber-400 mt-0.5">🔥 {currentStreak} days</div>
            <div className="text-[10px] text-slate-500 mt-1">Personal best: {user?.longestStreak || currentStreak}</div>
          </div>
        </div>
      </div>

      {/* Mood Distribution bar */}
      <div className="card p-6 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-400">Mood Distribution</span>
          <span className="text-slate-500">Last 30 days</span>
        </div>

        <div className="h-3 w-full bg-white/[0.02] rounded-full overflow-hidden flex">
          {pctPositive > 0 && (
            <div 
              style={{ width: `${pctPositive}%` }} 
              className="bg-[#10b981] h-full"
              title={`Positive: ${pctPositive}%`}
            />
          )}
          {pctNeutral > 0 && (
            <div 
              style={{ width: `${pctNeutral}%` }} 
              className="bg-[#f59e0b] h-full"
              title={`Neutral: ${pctNeutral}%`}
            />
          )}
          {pctNegative > 0 && (
            <div 
              style={{ width: `${pctNegative}%` }} 
              className="bg-[#f43f5e] h-full"
              title={`Negative: ${pctNegative}%`}
            />
          )}
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-1">
          <span className="text-[#10b981]">{pctPositive}% Positive</span>
          <span className="text-[#f59e0b]">{pctNeutral}% Neutral</span>
          <span className="text-[#f43f5e]">{pctNegative}% Negative</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between p-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <div className="flex items-center gap-2">
            <AlertCircle size={14} />
            <span className="font-bold">{error}</span>
          </div>
          <button 
            onClick={refetch}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      )}

      {/* Grid / List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-[#818cf8] mb-4">
            <BookOpen size={28} />
          </div>
          <h3 className="text-lg font-bold text-white">Your journal is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
            {searchQuery ? "No matching entries found." : "Start writing — your first AI analysis is waiting."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/new-entry')}
              className="btn-primary mt-6"
            >
              Write your first entry
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {filtered.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onClick={() => navigate(`/journal/id/${entry.id}`)}
            />
          ))}
        </motion.div>
      )}

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/new-entry')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] rounded-2xl flex items-center justify-center text-white shadow-[0_4px_25px_rgba(99,102,241,0.4)] cursor-pointer z-40 border border-white/10"
      >
        <Plus size={24} />
      </motion.button>
    </motion.div>
  );
}
