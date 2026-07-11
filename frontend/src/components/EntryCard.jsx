import SentimentBadge from './SentimentBadge';
import { Calendar, ChevronRight } from 'lucide-react';

export default function EntryCard({ entry = {}, onClick = () => {} }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col gap-3 p-6 bg-white/5 border border-white/10 hover:border-accent-primary/30 hover:bg-white/10 rounded-2xl cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_var(--accent-glow)] transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex justify-between items-start gap-4">
        <h3 className="font-bold text-white group-hover:text-accent-secondary transition-colors duration-200 text-base leading-snug line-clamp-1">
          {entry.title || 'Untitled Entry'}
        </h3>
        <ChevronRight size={16} className="text-[#6b7280] group-hover:translate-x-1 group-hover:text-accent-secondary transition-all duration-200" />
      </div>

      <p className="text-sm text-[#9ca3af] line-clamp-2 leading-relaxed min-h-[2.8rem]">
        {entry.content || 'No thoughts recorded.'}
      </p>

      <div className="flex items-center justify-between mt-1 text-xs text-[#6b7280] font-semibold border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-[#6b7280]" />
          <span>{formatDate(entry.date)}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {entry.sentimentScore ? (
            <SentimentBadge sentiment={entry.sentimentScore} className="scale-90 origin-right" />
          ) : entry.sentiment ? (
            <SentimentBadge sentiment={entry.sentiment} className="scale-90 origin-right" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
