import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useJournalEntries from '../hooks/useJournalEntries';
import { useAuth } from '../context/AuthContext';
import EntryCard from '../components/EntryCard';
import { Plus, Search, BookOpen, AlertCircle, RefreshCw, Calendar, Flame, Tag, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JournalListPage() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const size = 6;

  const { entries, totalPages, totalElements, loading, error, refetch } = useJournalEntries({
    page,
    size,
    searchQuery,
    tagFilter
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Reset page on search or tag filter changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery, tagFilter]);

  // Bug 1 Fix: Deduplicate entries by unique id to prevent duplicate card rendering
  const uniqueEntries = Array.from(
    new Map(entries.map((item) => [item.id, item])).values()
  );

  // Extract unique tags from current entries for tag filter pills
  const availableTags = Array.from(
    new Set(uniqueEntries.flatMap((e) => e.tags || []))
  );

  // Stats calculations
  const totalEntriesCount = totalElements || uniqueEntries.length;

  const entriesThisWeek = uniqueEntries.filter(e => {
    if (!e.date) return false;
    const date = new Date(e.date);
    const diffTime = Math.abs(new Date() - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const currentStreak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || currentStreak;

  // Bug 4 Fix: Mood calculations for proportional multi-segment Distribution Bar
  const moodCounts = uniqueEntries.reduce((acc, curr) => {
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

  const totalMoods = moodCounts.POSITIVE + moodCounts.NEGATIVE + moodCounts.NEUTRAL;
  const pctPositive = totalMoods > 0 ? Math.round((moodCounts.POSITIVE / totalMoods) * 100) : 0;
  const pctNegative = totalMoods > 0 ? Math.round((moodCounts.NEGATIVE / totalMoods) * 100) : 0;
  const pctNeutral = totalMoods > 0 ? Math.round((moodCounts.NEUTRAL / totalMoods) * 100) : 0;

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
      {/* Bug 2 & 3 Fix: Top Search Bar (Single desktop create action in header; icon spacing via input-icon-left) */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] z-10" size={16} />
          <input
            type="text"
            placeholder="Search your entries (title, content, tags)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-icon-left pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer z-10"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Bug 6 Fix: Tag Filters with unambiguous active filter badge and clear button */}
      {(availableTags.length > 0 || tagFilter) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[var(--text-muted)] font-medium flex items-center gap-1">
            <Tag size={12} /> {tagFilter ? 'Active filter:' : 'Filter by tag:'}
          </span>
          {tagFilter && (
            <button
              onClick={() => setTagFilter('')}
              className="px-3 py-1 rounded-full bg-[#6366f1]/15 text-[#6366f1] dark:text-[#818cf8] border border-[#6366f1]/40 flex items-center gap-1.5 font-bold cursor-pointer hover:bg-[#6366f1]/25 transition-all shadow-sm"
              title="Click to remove tag filter"
            >
              <span>#{tagFilter}</span>
              <X size={12} className="shrink-0" />
            </button>
          )}
          {availableTags
            .filter((t) => t.toLowerCase() !== tagFilter.toLowerCase())
            .map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className="px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] border border-[var(--border-default)] transition-all cursor-pointer"
              >
                #{tag}
              </button>
            ))}
        </div>
      )}

      {/* Bug 8 Fix: High-contrast Stats Cards and Icon Chips for both light and dark themes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Total Entries</div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{totalEntriesCount}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">All thoughts recorded</div>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">This Week</div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{entriesThisWeek}</div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">Logged last 7 days</div>
          </div>
        </div>

        {/* Bug 5 Fix: Correct pluralization for '1 day' vs 'N days' */}
        <div className="card p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold shrink-0">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Current Streak</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              🔥 {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-1">
              Personal best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>
      </div>

      {/* Bug 4 Fix: Proportional multi-segment Mood Distribution bar */}
      <div className="card p-6 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[var(--text-secondary)]">Mood Distribution</span>
          <span className="text-[var(--text-muted)]">Current view</span>
        </div>

        <div className="h-3 w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-full overflow-hidden flex">
          {totalMoods === 0 ? (
            <div className="w-full h-full bg-[var(--bg-elevated)]" title="No mood data recorded" />
          ) : (
            <>
              {pctPositive > 0 && (
                <div 
                  style={{ width: `${pctPositive}%` }} 
                  className="bg-[#10b981] h-full transition-all duration-300"
                  title={`Positive: ${pctPositive}%`}
                />
              )}
              {pctNeutral > 0 && (
                <div 
                  style={{ width: `${pctNeutral}%` }} 
                  className="bg-[#f59e0b] h-full transition-all duration-300"
                  title={`Neutral: ${pctNeutral}%`}
                />
              )}
              {pctNegative > 0 && (
                <div 
                  style={{ width: `${pctNegative}%` }} 
                  className="bg-[#f43f5e] h-full transition-all duration-300"
                  title={`Negative: ${pctNegative}%`}
                />
              )}
            </>
          )}
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-1">
          <span className="text-[#10b981] font-semibold">{pctPositive}% Positive</span>
          <span className="text-[#f59e0b] font-semibold">{pctNeutral}% Neutral</span>
          <span className="text-[#f43f5e] font-semibold">{pctNegative}% Negative</span>
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
            className="p-1 rounded-lg hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
      ) : uniqueEntries.length === 0 ? (
        <div className="card flex flex-col items-center justify-center text-center py-20 px-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[#818cf8] mb-4">
            <BookOpen size={28} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            {tagFilter ? `No entries found for #${tagFilter}` : "Your journal is empty"}
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mt-2 leading-relaxed">
            {searchQuery || tagFilter ? "No matching entries found for your query or filter." : "Start writing — your first AI analysis is waiting."}
          </p>
          {tagFilter ? (
            <button
              onClick={() => setTagFilter('')}
              className="btn-ghost mt-6 text-xs"
            >
              Clear tag filter
            </button>
          ) : (
            !(searchQuery) && (
              <button
                onClick={() => navigate('/new-entry')}
                className="btn-primary mt-6"
              >
                Write your first entry
              </button>
            )
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            {uniqueEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onClick={() => navigate(`/journal/id/${entry.id}`)}
              />
            ))}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl text-xs">
              <span className="text-[var(--text-secondary)]">
                Page <span className="font-bold text-[var(--text-primary)]">{page + 1}</span> of <span className="font-bold text-[var(--text-primary)]">{totalPages}</span> ({totalElements} total entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-overlay)] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-overlay)] transition-all flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bug 2 Fix: Floating Action Button restricted to mobile only (md:hidden) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/new-entry')}
        className="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-tr from-[#6366f1] to-[#a78bfa] rounded-2xl flex items-center justify-center text-white shadow-[0_4px_25px_rgba(99,102,241,0.4)] cursor-pointer z-40 border border-white/10"
        aria-label="New Entry"
      >
        <Plus size={24} />
      </motion.button>
    </motion.div>
  );
}
