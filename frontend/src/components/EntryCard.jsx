import SentimentBadge from './SentimentBadge';
import { Edit3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EntryCard({ entry = {}, onClick = () => {} }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const cardVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 }
  };

  const sentiment = entry.sentimentScore || entry.sentiment;

  return (
    <motion.div
      variants={cardVariants}
      onClick={onClick}
      className="card p-6 flex flex-col justify-between cursor-pointer select-none group min-h-[170px]"
    >
      <div>
        {/* Top: Sentiment Badge + Date */}
        <div className="flex justify-between items-center mb-4">
          <div>
            {sentiment ? (
              <SentimentBadge sentiment={sentiment} className="scale-95 origin-left" />
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Loader2 size={12} className="animate-spin" />
                Analyzing...
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--text-muted)] font-medium">{formatDate(entry.date)}</span>
        </div>

        {/* Bug 7 Fix: Title uses var(--text-primary) so it is clearly visible in both light and dark themes */}
        <h3 className="font-bold text-[var(--text-primary)] group-hover:text-[#818cf8] transition-colors duration-200 text-base leading-snug line-clamp-1 mb-2">
          {entry.title || 'Untitled Entry'}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-4">
          {entry.content || 'No thoughts recorded.'}
        </p>
      </div>

      {/* Footer: Tags + Action */}
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 mt-2">
        <div className="flex flex-wrap gap-1.5 max-w-[70%]">
          {entry.tags && entry.tags.length > 0 ? (
            entry.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-[var(--text-muted)] italic">No tags</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
          <Edit3 size={12} />
          <span>edit</span>
        </div>
      </div>
    </motion.div>
  );
}
