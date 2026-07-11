import { Smile, Frown, Flame, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

const SENTIMENT_CONFIG = {
  HAPPY: {
    label: 'Happy',
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Smile,
  },
  SAD: {
    label: 'Sad',
    classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Frown,
  },
  ANGRY: {
    label: 'Angry',
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: Flame,
  },
  ANXIOUS: {
    label: 'Anxious',
    classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: ShieldAlert,
  },
  POSITIVE: {
    label: 'Positive',
    classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Sparkles,
  },
  NEGATIVE: {
    label: 'Negative',
    classes: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: Frown,
  },
  NEUTRAL: {
    label: 'Neutral',
    classes: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    icon: HelpCircle,
  },
};

export default function SentimentBadge({ sentiment, className = '' }) {
  if (!sentiment) return null;
  const config = SENTIMENT_CONFIG[sentiment.toUpperCase()] || {
    label: sentiment,
    classes: 'bg-white/5 text-[#9ca3af] border-white/10',
    icon: Smile,
  };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${config.classes} ${className}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
export { SENTIMENT_CONFIG };
