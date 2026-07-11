import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Plus, BookOpen } from 'lucide-react';

export default function DashboardGreeting() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Greeting based on time of day
  const getGreetingText = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Good Morning';
    if (hours >= 12 && hours < 17) return 'Good Afternoon';
    if (hours >= 17 && hours < 21) return 'Good Evening';
    return 'Good Night';
  };

  // Mindfulness quotes matching the time of day
  const getMindfulnessQuote = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return 'A fresh start to document your goals and capture your morning ideas.';
    }
    if (hours >= 12 && hours < 17) {
      return 'Take a quiet pause to reflect on your progress and focus your mind.';
    }
    if (hours >= 17 && hours < 21) {
      return 'Unwind, review your achievements, and capture your evening reflections.';
    }
    return 'Document your day, encrypt your thoughts, and rest peacefully.';
  };

  const userName = user?.userName || 'Journaler';
  const capUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="w-full bg-white/60 backdrop-blur-lg border border-slate-100/80 p-6 md:p-8 rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-teal-400/5 blur-2xl pointer-events-none" />

      {/* Greeting details */}
      <div className="flex items-center gap-4.5 z-10">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-xs">
          <BookOpen className="text-teal-600 w-7 h-7" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
            {getGreetingText()}, <span className="bg-gradient-to-r from-teal-700 to-slate-900 bg-clip-text text-transparent font-black">{capUserName}</span>
          </h2>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Secure Digital Sanctuary</span>
            <span className="text-slate-300 font-normal">•</span>
            <span>Zero Cloud Tracking</span>
          </div>
          <p className="text-xs md:text-sm font-semibold text-slate-400/90 leading-relaxed mt-1">
            {getMindfulnessQuote()}
          </p>
        </div>
      </div>

      {/* Encouragement Button Actions */}
      <div className="flex items-center z-10 shrink-0">
        <button
          onClick={() => navigate('/new-entry')}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-900 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-xs border-l-4 border-l-teal-500"
        >
          <Plus size={16} className="text-teal-400" />
          <span>New Entry</span>
        </button>
      </div>
    </div>
  );
}
