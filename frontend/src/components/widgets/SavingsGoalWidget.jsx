import { Target } from 'lucide-react';

export default function SavingsGoalWidget({ metadata = {} }) {
  const { targetAmount = 0, currentSavings = 0 } = metadata;
  
  const percentage = targetAmount > 0 
    ? Math.min(100, Math.round((currentSavings / targetAmount) * 100)) 
    : 0;

  return (
    <div className="flex flex-col gap-2.5 p-1">
      <div className="flex justify-between items-center text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5 text-slate-600">
          <Target size={14} className="text-teal-500" />
          Goal Progress
        </span>
        <span>{percentage}%</span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
        <div 
          className="bg-gradient-to-r from-teal-400 to-teal-500 h-full rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-baseline text-xs font-extrabold mt-0.5">
        <span className="text-teal-600">₹{Number(currentSavings).toLocaleString('en-IN')}</span>
        <span className="text-slate-400 font-medium text-[10px]">Target: ₹{Number(targetAmount).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
}
