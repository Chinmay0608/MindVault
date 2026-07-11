import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useJournalEntries from '../hooks/useJournalEntries';
import EntryCard from '../components/EntryCard';
import { Plus, Search, BookOpen, AlertCircle, RefreshCw, Calendar, Heart, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JournalListPage() {
  const { entries, loading, error, refetch } = useJournalEntries();
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
              e.sentiment?.toLowerCase().includes(q) ||
              e.sentimentScore?.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, entries]);

  // Statistics calculations
  const totalEntries = entries.length;

  const entriesThisWeek = entries.filter(e => {
    if (!e.date) return false;
    const date = new Date(e.date);
    const diffTime = Math.abs(new Date() - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const moodCounts = entries.reduce((acc, curr) => {
    const score = (curr.sentimentScore || 'NEUTRAL').toUpperCase();
    if (acc[score] !== undefined) {
      acc[score]++;
    }
    return acc;
  }, { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 });

  return (
    <div className="min-h-screen pb-24 text-[#f1f0ff] relative">
      {/* Search and Write Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 mt-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Journal Vault
          </h1>
          <p className="text-sm text-[#9ca3af] font-semibold mt-1">
            Reflect securely, analyze metrics, and stay mindful.
          </p>
        </div>

        <div className="relative flex items-center w-full md:w-80">
          <Search className="absolute left-4 text-[#6b7280] pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] outline-none"
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1 */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex items-center gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
          <div className="w-12 h-12 rounded-2xl bg-[#7c6aff]/10 border border-[#7c6aff]/20 flex items-center justify-center text-[#a78bfa]">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="text-xs text-[#6b7280] font-extrabold uppercase tracking-widest">Total Logs</div>
            <div className="text-2xl font-black text-white mt-0.5">{totalEntries}</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex items-center gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
          <div className="w-12 h-12 rounded-2xl bg-[#a78bfa]/10 border border-[#a78bfa]/20 flex items-center justify-center text-[#a78bfa]">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-xs text-[#6b7280] font-extrabold uppercase tracking-widest">Logged This Week</div>
            <div className="text-2xl font-black text-white mt-0.5">{entriesThisWeek}</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex items-center gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Heart size={22} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-[#6b7280] font-extrabold uppercase tracking-widest">Mood Summary</div>
            <div className="flex items-center gap-3.5 mt-1 text-[11px] font-bold">
              <span className="text-emerald-400">{moodCounts.POSITIVE} Pos</span>
              <span className="text-rose-400">{moodCounts.NEGATIVE} Neg</span>
              <span className="text-violet-400">{moodCounts.NEUTRAL} Neu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="flex items-center justify-between p-4 mb-6 text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-2xl">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span className="font-bold">{error}</span>
          </div>
          <button 
            onClick={refetch}
            className="p-1 rounded-lg hover:bg-white/5 text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      )}

      {/* Loading & Grid List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#7c6aff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#a78bfa] mb-4">
            <BookOpen size={28} />
          </div>
          <h3 className="text-lg font-black text-white">No entries found</h3>
          <p className="text-xs text-[#6b7280] max-w-sm mt-2 font-bold leading-relaxed">
            {searchQuery ? "We couldn't find any entries matching your query." : "Your secure vault is empty. Click the button below to write your first entry!"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => navigate('/new-entry')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#7c6aff] to-[#a78bfa] hover:from-[#6d5be6] hover:to-[#967ce6] text-white font-extrabold rounded-2xl text-xs transition-all shadow-[0_4px_20px_rgba(124,106,255,0.25)] hover:shadow-[0_4px_25px_rgba(124,106,255,0.35)] cursor-pointer"
            >
              Log First Entry
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {filtered.map((entry) => (
            <motion.div
              key={entry.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <EntryCard
                entry={entry}
                onClick={() => navigate(`/journal/id/${entry.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/new-entry')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-[#7c6aff] to-[#a78bfa] rounded-2xl flex items-center justify-center text-white shadow-[0_4px_25px_rgba(124,106,255,0.45)] cursor-pointer z-40 border border-[#7c6aff]/20"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}
