import { CheckSquare, Square, Calendar } from 'lucide-react';

export default function TodoWidget({ metadata = {}, onToggle = () => {} }) {
  const { completed = false, priority = 'MEDIUM', dueDate } = metadata;

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'LOW':
        return 'bg-slate-50 text-slate-600 border-slate-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(!completed);
          }}
          className="text-teal-600 hover:text-teal-700 transition-colors duration-200 cursor-pointer"
        >
          {completed ? <CheckSquare size={20} className="fill-teal-50" /> : <Square size={20} />}
        </button>
        <span className={`text-sm font-semibold transition-all duration-200 ${completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
          {completed ? 'Completed' : 'Active Task'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-bold mt-1">
        <span className={`px-2 py-0.5 rounded-full border ${getPriorityColor(priority)}`}>
          {priority}
        </span>
        {dueDate && (
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar size={12} />
            {formatDate(dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}
