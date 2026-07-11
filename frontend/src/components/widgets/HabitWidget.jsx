import { Flame, CheckCircle2 } from 'lucide-react';

export default function HabitWidget({ metadata = {} }) {
  const { streakCount = 0, checkedToday = false } = metadata;

  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex items-center gap-1.5 text-orange-600 font-extrabold text-sm">
        <Flame size={18} className="fill-orange-500 animate-pulse" />
        <span>{streakCount} Day Streak</span>
      </div>
      <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
        <CheckCircle2 size={16} className={checkedToday ? 'text-teal-500 fill-teal-50' : 'text-slate-300'} />
        <span>{checkedToday ? 'Done Today' : 'Pending'}</span>
      </div>
    </div>
  );
}
