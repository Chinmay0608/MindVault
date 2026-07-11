import SentimentBadge from './SentimentBadge';
import { Calendar, ChevronRight, Edit3, Loader2 } from 'lucide-react';
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                <Loader2 size={12} className="animate-spin" />
                Analyzing...
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium">{formatDate(entry.date)}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white group-hover:text-[#818cf8] transition-colors duration-200 text-base leading-snug line-clamp-1 mb-2">
          {entry.title || 'Untitled Entry'}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {entry.content || 'No thoughts recorded.'}
        </p>
      </div>

      {/* Footer: Tags + Action */}
      <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-2">
        <div className="flex flex-wrap gap-1.5 max-w-[70%]">
          {entry.tags && entry.tags.length > 0 ? (
            entry.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05] text-slate-400">
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-600 italic">No tags</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-white transition-colors">
          <Edit3 size={12} />
          <span>edit</span>
        </div>
      </div>
    </motion.div>
  );
}
