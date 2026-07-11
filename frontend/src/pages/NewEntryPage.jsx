import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as journalApi from '../api/journalApi';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

export default function NewEntryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [sentimentResult, setSentimentResult] = useState(null);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [content]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Please enter both title and content.', 'error');
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setSentimentResult(null);

    try {
      const saved = await journalApi.create({
        title,
        content,
        tags
      });

      showToast('Entry successfully saved!', 'success');

      // Trigger/retrieve AI analysis
      try {
        const analysis = await journalApi.getSentiment(saved.id);
        setSentimentResult(analysis);
      } catch (err) {
        // Safe fallback score
        setSentimentResult({
          sentiment: 'NEUTRAL',
          aiInsight: 'Your thoughts are recorded securely in the vault.'
        });
      }
    } catch (err) {
      showToast('Failed to save journal entry.', 'error');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-3xl mx-auto space-y-6 pb-20"
    >
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>All Entries</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-medium">{wordCount} words</span>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>Save Entry</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="card p-8 md:p-10 space-y-6">
        <div className="text-xs font-bold text-[#818cf8] tracking-wide uppercase">
          {formatDate()}
        </div>

        <input
          type="text"
          placeholder="Title your entry..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-none text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-0"
        />

        <textarea
          placeholder="What's on your mind today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full bg-transparent border-none text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-0 leading-relaxed resize-none"
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/[0.04]">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2">Tags:</span>
          {tags.map((tag) => (
            <span
              key={tag}
              onClick={() => setTags(tags.filter((t) => t !== tag))}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[#818cf8] font-medium cursor-pointer hover:border-rose-500/30 hover:text-rose-400 transition-all"
            >
              #{tag}
            </span>
          ))}

          {showTagInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                className="px-2 py-0.5 text-xs bg-[#1e1e28] border border-white/10 rounded-md text-white outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="text-xs text-slate-500 hover:text-white transition-colors font-medium"
            >
              + Add tag
            </button>
          )}
        </div>
      </div>

      {/* Analyzing/Sentiment Card Container */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 border-indigo-500/20 bg-indigo-500/5 space-y-3"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              <span>Analyzing your entry...</span>
            </div>
            <p className="text-xs text-slate-400">Gemini is reading and scoring your sentiment score...</p>
          </motion.div>
        )}

        {sentimentResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 space-y-4 border-emerald-500/20 bg-emerald-500/5"
          >
            <div className="flex justify-between items-center text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Sparkles size={14} /> AI Mood Analysis</span>
              <span className="text-slate-500">Powered by Gemini Flash 2.0</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">{sentimentResult.sentiment}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {sentimentResult.aiInsight || 'Your thoughts reflect a state of reflection and emotional awareness.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
