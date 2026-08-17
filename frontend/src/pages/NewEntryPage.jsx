import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as journalApi from '../api/journalApi';
import { ArrowLeft, Loader2, Sparkles, Plus, AlertCircle } from 'lucide-react';
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

  // Track created entry ID in current editor session to prevent duplicate entry records on re-save
  const [createdEntryId, setCreatedEntryId] = useState(null);

  // Validation & dirty tracking states
  const [showValidation, setShowValidation] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [sentimentResult, setSentimentResult] = useState(null);

  // Track if user has unsaved draft changes
  const isDirty = (title.trim() !== '' || content.trim() !== '' || tags.length > 0) && !savedSuccess;

  // Handle browser tab close/reload beforeunload event when draft is dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [content]);

  // Safe in-app navigation guard for unsaved changes
  const handleNavigateAway = (path) => {
    if (isDirty) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave and discard this draft?');
      if (!confirmed) return;
    }
    navigate(path);
  };

  const isFormInvalid = !title.trim() || !content.trim();

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (isFormInvalid) {
      setShowValidation(true);
      showToast('Please enter both a title and entry content.', 'error');
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setSentimentResult(null);

    try {
      let saved;
      if (createdEntryId) {
        // Update existing entry in place instead of creating a duplicate document in MongoDB
        saved = await journalApi.update(createdEntryId, {
          title,
          content,
          tags
        });
      } else {
        // Create new entry on first save
        saved = await journalApi.create({
          title,
          content,
          tags
        });
        if (saved && saved.id) {
          setCreatedEntryId(saved.id);
        }
      }

      setSavedSuccess(true);
      showToast(createdEntryId ? 'Entry updated successfully!' : 'Entry successfully saved!', 'success');

      // Trigger/retrieve AI analysis
      try {
        const targetId = saved?.id || createdEntryId;
        if (targetId) {
          const analysis = await journalApi.getSentiment(targetId);
          setSentimentResult(analysis);
        }
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
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <button
          type="button"
          onClick={() => handleNavigateAway('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>All Entries</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--text-muted)] font-medium">{wordCount} words</span>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || analyzing || isFormInvalid}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {(loading || analyzing) && <Loader2 size={14} className="animate-spin" />}
            <span>{createdEntryId ? 'Update Entry' : 'Save Entry'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="card p-8 md:p-10 space-y-6">
        <div className="text-xs font-bold text-[#818cf8] tracking-wide uppercase">
          {formatDate()}
        </div>

        {/* Title input */}
        <div className="space-y-1">
          <input
            type="text"
            placeholder="Title your entry..."
            value={title}
            onChange={(e) => { setTitle(e.target.value); setShowValidation(false); setSavedSuccess(false); }}
            className="w-full bg-transparent border-none text-2xl font-bold text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:ring-0"
          />
          {showValidation && !title.trim() && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 pt-1">
              <AlertCircle size={13} /> Title is required.
            </div>
          )}
        </div>

        {/* Content Textarea */}
        <div className="space-y-1">
          <textarea
            placeholder="What's on your mind today?"
            value={content}
            onChange={(e) => { setContent(e.target.value); setShowValidation(false); setSavedSuccess(false); }}
            rows={10}
            className="w-full bg-transparent border-none text-sm text-[var(--text-primary)] placeholder:[var(--text-muted)] focus:outline-none focus:ring-0 leading-relaxed resize-none"
          />
          {showValidation && !content.trim() && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 pt-1">
              <AlertCircle size={13} /> Entry content is required.
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider mr-2">Tags:</span>
          {tags.map((tag) => (
            <span
              key={tag}
              onClick={() => { setTags(tags.filter((t) => t !== tag)); setSavedSuccess(false); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium cursor-pointer hover:border-rose-500/30 hover:text-rose-400 transition-all flex items-center gap-1"
            >
              #{tag}
            </span>
          ))}

          {showTagInput ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                className="px-2 py-1 text-xs bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-md text-[var(--text-primary)] outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowTagInput(true)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all font-medium cursor-pointer flex items-center gap-1"
            >
              <Plus size={12} />
              <span>Add tag</span>
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
            <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Loader2 size={14} className="animate-spin text-indigo-500" />
              <span>Analyzing your entry...</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Gemini is reading and scoring your sentiment score...</p>
          </motion.div>
        )}

        {sentimentResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 space-y-4 border-emerald-500/20 bg-emerald-500/5"
          >
            <div className="flex justify-between items-center text-xs font-bold text-emerald-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Sparkles size={14} /> AI Mood Analysis</span>
              <span className="text-[var(--text-muted)]">Powered by Gemini Flash 2.0</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">{sentimentResult.sentiment}</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {sentimentResult.aiInsight || 'Your thoughts reflect a state of reflection and emotional awareness.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
