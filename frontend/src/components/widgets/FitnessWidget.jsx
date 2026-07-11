import { Activity, Flame, Clock } from 'lucide-react';

export default function FitnessWidget({ metadata = {} }) {
  const { exerciseType = 'Workout', durationMinutes = 0, caloriesBurned = 0 } = metadata;

  return (
    <div className="flex flex-col gap-2 p-1">
      <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
        <Activity size={16} className="text-teal-500" />
        <span>{exerciseType}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mt-0.5">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {durationMinutes} min
        </span>
        <span className="flex items-center gap-1 text-rose-600">
          <Flame size={12} className="fill-rose-50" />
          {caloriesBurned} kcal
        </span>
      </div>
    </div>
  );
}
