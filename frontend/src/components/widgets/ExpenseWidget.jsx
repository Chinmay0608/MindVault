import { Tag } from 'lucide-react';

export default function ExpenseWidget({ metadata = {} }) {
  const { amount = 0, category = 'General' } = metadata;

  return (
    <div className="flex flex-col gap-1.5 p-1">
      <div className="text-xl font-extrabold text-slate-800 tracking-tight">
        ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
        <Tag size={12} className="text-teal-500" />
        <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 uppercase tracking-wider text-[10px]">
          {category}
        </span>
      </div>
    </div>
  );
}
