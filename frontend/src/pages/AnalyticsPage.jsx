import { useMemo } from 'react';
import useJournalEntries from '../hooks/useJournalEntries';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, Award, PenTool, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const { entries, loading } = useJournalEntries();
  const { user } = useAuth();

  // Page animation settings
  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
  };

  // 1. Mood Over Time Line Chart Calculations
  const lineChartData = useMemo(() => {
    return [...entries]
      .filter((e) => e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-15) // last 15 entries
      .map((entry) => {
        const scoreStr = (entry.sentimentScore || 'NEUTRAL').toUpperCase();
        let value = 0; // Neutral
        if (scoreStr.includes('POSITIVE') || scoreStr.includes('HAPPY')) value = 1;
        if (scoreStr.includes('NEGATIVE') || scoreStr.includes('SAD') || scoreStr.includes('ANGRY')) value = -1;

        const date = new Date(entry.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });

        return {
          date,
          Mood: value
        };
      });
  }, [entries]);

  // 2. Mood Distribution Donut Chart Calculations
  const pieChartData = useMemo(() => {
    const counts = entries.reduce(
      (acc, curr) => {
        const score = (curr.sentimentScore || 'NEUTRAL').toUpperCase();
        if (score.includes('POSITIVE') || score.includes('HAPPY')) acc.Positive++;
        else if (score.includes('NEGATIVE') || score.includes('SAD') || score.includes('ANGRY')) acc.Negative++;
        else acc.Neutral++;
        return acc;
      },
      { Positive: 0, Negative: 0, Neutral: 0 }
    );

    return [
      { name: 'Positive', value: counts.Positive, color: '#10b981' },
      { name: 'Neutral', value: counts.Neutral, color: '#f59e0b' },
      { name: 'Negative', value: counts.Negative, color: '#f43f5e' }
    ].filter(item => item.value > 0);
  }, [entries]);

  // 3. Writing stats
  const stats = useMemo(() => {
    if (entries.length === 0) return { avgWords: 0, maxStreak: 0, mostActiveDay: 'N/A' };

    // Average words count
    const totalWords = entries.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
    const avgWords = Math.round(totalWords / entries.length);

    // Most active day of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = entries.reduce((acc, curr) => {
      if (curr.date) {
        const day = new Date(curr.date).getDay();
        acc[day] = (acc[day] || 0) + 1;
      }
      return acc;
    }, {});

    let maxDayIdx = 0;
    let maxCount = 0;
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDayIdx = Number(day);
      }
    });

    return {
      avgWords,
      maxStreak: user?.longestStreak || 0,
      mostActiveDay: entries.length > 0 ? daysOfWeek[maxDayIdx] : 'N/A'
    };
  }, [entries, user]);

  // 4. Tag frequency cloud
  const tagsData = useMemo(() => {
    const freq = {};
    entries.forEach((e) => {
      e.tags?.forEach((t) => {
        freq[t] = (freq[t] || 0) + 1;
      });
    });

    return Object.entries(freq)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 pb-20"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="text-[#818cf8]" />
          <span>Analytics Dashboard</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Deep analysis of your emotional trends and writing metrics.</p>
      </div>

      {entries.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-slate-500 mb-4">
            <TrendingUp size={22} />
          </div>
          <h3 className="text-sm font-bold text-white">No analytics data available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">Write a few entries to populate mood maps and metrics.</p>
        </div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Mood Over Time Line Chart */}
            <div className="card p-6 space-y-4">
              <span className="text-xs font-bold text-slate-400 block">Mood Trajectory (Recent Entries)</span>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ left: -20, right: 10 }}>
                    <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                    <YAxis 
                      stroke="#475569" 
                      fontSize={10} 
                      domain={[-1, 1]} 
                      ticks={[-1, 0, 1]} 
                      tickFormatter={(val) => val === 1 ? '😊' : val === -1 ? '😔' : '😐'}
                      tickLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1e28', border: '1px solid rgba(255,255,255,0.06)' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Mood" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      dot={{ r: 4, stroke: '#818cf8', strokeWidth: 1, fill: '#1e1e28' }}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mood Distribution Donut Chart */}
            <div className="card p-6 space-y-4">
              <span className="text-xs font-bold text-slate-400 block">Sentiment Breakdown</span>
              <div className="h-64 w-full flex flex-col justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1e28', border: '1px solid rgba(255,255,255,0.06)' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex justify-center gap-6 text-xs mt-2">
                  {pieChartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 font-medium">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Tags Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Writing Stats Card */}
            <div className="card p-6 space-y-5">
              <span className="text-xs font-bold text-slate-400 block">Writing Habits</span>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                  <PenTool size={20} className="mx-auto text-indigo-400 mb-2" />
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Words</div>
                  <div className="text-lg font-bold text-white mt-1">{stats.avgWords}</div>
                </div>

                <div className="text-center p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                  <Calendar size={20} className="mx-auto text-indigo-400 mb-2" />
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Peak Day</div>
                  <div className="text-sm font-bold text-white mt-1.5 truncate">{stats.mostActiveDay}</div>
                </div>

                <div className="text-center p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                  <Award size={20} className="mx-auto text-amber-400 mb-2" />
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Max Streak</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">🔥 {stats.maxStreak}</div>
                </div>
              </div>
            </div>

            {/* Tags Word Cloud Card */}
            <div className="card p-6 space-y-4">
              <span className="text-xs font-bold text-slate-400 block flex items-center gap-1.5">
                <Tag size={13} /> Highly Used Hashtags
              </span>
              <div className="flex flex-wrap gap-2.5 items-center justify-center min-h-[100px] p-4 bg-white/[0.01] rounded-2xl border border-white/[0.03]">
                {tagsData.map((tag, idx) => {
                  const sizeClasses = idx === 0 ? 'text-lg font-bold text-[#818cf8] bg-indigo-500/10' 
                                      : idx < 3 ? 'text-sm font-semibold text-slate-200 bg-white/[0.04]' 
                                      : 'text-xs text-slate-400 bg-white/[0.02]';
                  return (
                    <span 
                      key={tag.name} 
                      className={`px-3 py-1.5 rounded-xl border border-white/[0.04] transition-all hover:scale-105 ${sizeClasses}`}
                    >
                      #{tag.name} <span className="text-[9px] text-slate-500 font-medium">({tag.value})</span>
                    </span>
                  );
                })}
                {tagsData.length === 0 && (
                  <span className="text-xs text-slate-500 italic">No tags detected in entries.</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
