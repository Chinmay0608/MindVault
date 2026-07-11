import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as journalApi from '../api/journalApi';
import SentimentBadge from '../components/SentimentBadge';
import { Calendar, ArrowLeft, Edit3, Trash2, ShieldCheck, AlertCircle, Sparkles, Loader2, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function JournalEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [entry, setEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // AI Sentiment analysis state
  const [aiSentiment, setAiSentiment] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  useEffect(() => {
    const words = editContent.trim() ? editContent.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [editContent]);

  const fetchEntry = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await journalApi.getById(id);
      setEntry(data);
      setEditTitle(data.title || '');
      setEditContent(data.content || '');
      setEditTags(data.tags || []);
      
      if (data.sentimentScore) {
        setAiSentiment(data.sentimentScore);
        setAiInsight(data.aiInsight);
      } else {
        // Trigger synchronous analysis if not yet available
        fetchAiSentiment(data.id);
      }
    } catch (err) {
      setError('Could not retrieve this journal entry.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSentiment = async (entryId) => {
    setAiLoading(true);
    try {
      const response = await journalApi.getSentiment(entryId);
      setAiSentiment(response.sentiment);
      setAiInsight(response.aiInsight || 'Your thoughts reflect a state of reflection and emotional awareness.');
    } catch (err) {
      // Graceful fallback
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      showToast('Please enter both title and content.', 'error');
      return;
    }

    setLoading(true);
    setAiLoading(true);
    try {
      const updated = await journalApi.update(id, {
        title: editTitle,
        content: editContent,
        tags: editTags
      });
      setEntry(updated);
      showToast('Entry updated successfully!', 'success');
      setIsEditing(false);
      
      if (updated.sentimentScore) {
        setAiSentiment(updated.sentimentScore);
        setAiInsight(updated.aiInsight);
      } else {
        fetchAiSentiment(updated.id);
      }
    } catch (err) {
      showToast('Failed to save entry changes.', 'error');
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this entry forever?')) return;
    try {
      await journalApi.remove(id);
      showToast('Entry permanently deleted', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to delete entry.');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim().toLowerCase())) {
      setEditTags([...editTags, newTag.trim().toLowerCase()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-3xl mx-auto space-y-6 pb-20"
    >
      {/* Editor/Viewer Top Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>All Entries</span>
        </button>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <span className="text-xs text-slate-500 font-medium">{wordCount} words</span>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="btn-primary"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} />
                <span>Save</span>
              </button>
              <button
                onClick={() => { setIsEditing(false); fetchEntry(); }}
                className="btn-ghost"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-ghost"
              >
                <Edit3 size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="px-3.5 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-[#f43f5e] rounded-xl transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <AlertCircle size={14} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {loading && !entry ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : entry ? (
        <div className="space-y-6">
          {/* Card Body */}
          <div className="card p-8 md:p-10 space-y-6">
            <div className="text-xs font-bold text-[#818cf8] tracking-wide uppercase">
              {formatDate(entry.date)}
            </div>

            {isEditing ? (
              <>
                <input
                  type="text"
                  placeholder="Title your entry..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-transparent border-none text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-0"
                />

                <textarea
                  placeholder="What's on your mind today?"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="w-full bg-transparent border-none text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-0 leading-relaxed resize-none"
                />

                {/* Edit Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/[0.04]">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2">Tags:</span>
                  {editTags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => setEditTags(editTags.filter((t) => t !== tag))}
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
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">
                  {entry.title || 'Untitled Entry'}
                </h1>

                {/* Secure Badge */}
                <div className="flex items-center gap-2 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl inline-flex">
                  <ShieldCheck size={14} className="text-[#818cf8] animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Encrypted in Local Vault</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>

                {/* View Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/[0.04]">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mr-2">Tags:</span>
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[#818cf8] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* AI Analysis slide-in */}
          <AnimatePresence>
            {aiLoading && (
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
              </motion.div>
            )}

            {aiSentiment && !aiLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card p-6 space-y-4 border-emerald-500/20 bg-[#16161d] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 text-[10px] text-slate-500 font-medium">
                  {formatDate(entry.sentimentAnalyzedAt || entry.date)}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>AI Mood Analysis</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <SentimentBadge sentiment={aiSentiment} />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiInsight || 'Your thoughts reflect a state of reflection and emotional awareness.'}
                </p>
                
                <div className="text-[10px] text-slate-500 pt-2 border-t border-white/[0.04]">
                  Powered by Gemini Flash 2.0
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </motion.div>
  );
}
