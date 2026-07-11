import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as journalApi from '../api/journalApi';
import GlassCard from '../components/GlassCard';
import SentimentBadge from '../components/SentimentBadge';
import EntryForm from '../components/EntryForm';
import { Calendar, ArrowLeft, Edit3, Trash2, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function JournalEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [entry, setEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiSentiment, setAiSentiment] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const fetchEntry = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await journalApi.getById(id);
      setEntry(data);
      if (data.sentimentScore) {
        setAiSentiment(data.sentimentScore);
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
    } catch (err) {
      // Graceful fallback
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setError('');
    const typeLabel = formData.entryType === 'TODO' ? 'task' : formData.entryType === 'EXPENSE' ? 'expense' : 'journal entry';
    try {
      const updated = await journalApi.update(id, formData);
      setEntry(updated);
      showToast(`${typeLabel} updated successfully!`, 'success');
      setIsEditing(false);
      if (updated.sentimentScore) {
        setAiSentiment(updated.sentimentScore);
      } else {
        fetchAiSentiment(updated.id);
      }
    } catch (err) {
      setError(`Failed to save ${typeLabel}.`);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen pb-24 text-[#f1f0ff] relative">
      <main className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Back navigation */}
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#9ca3af] hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 hover:border-white/20 rounded-2xl cursor-pointer transition-all duration-300"
          >
            <ArrowLeft size={14} />
            <span>Back to Workspace</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-2xl">
            <AlertCircle size={16} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#7c6aff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : entry ? (
          <GlassCard className="p-8 md:p-10 border-white/10">
            {isEditing ? (
              <EntryForm
                initialTitle={entry.title}
                initialContent={entry.content}
                initialSentiment={entry.sentiment}
                initialType={entry.entryType || 'JOURNAL'}
                initialMetadata={entry.metadata}
                isEditMode={true}
                onCancel={() => setIsEditing(false)}
                onSave={handleUpdate}
              />
            ) : (
              <article className="flex flex-col gap-6">
                {/* Header Actions */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-white/5">
                  <div className="flex flex-col gap-1.5">
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                      {entry.title || 'Untitled Entry'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#6b7280]">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {formatDate(entry.date)}
                      </span>
                      {aiSentiment && (
                        <span className="flex items-center gap-1 bg-[#7c6aff]/10 border border-[#7c6aff]/20 px-2 py-0.5 rounded-md text-[10px] text-[#a78bfa] font-extrabold uppercase tracking-widest">
                          Mood: {aiSentiment}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-2xl text-xs font-extrabold text-white transition-all cursor-pointer shadow-sm"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center p-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-[#f87171] rounded-2xl transition-all cursor-pointer shadow-sm"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="flex items-center gap-2 p-3.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
                  <ShieldCheck size={16} className="text-[#a78bfa] animate-pulse" />
                  <span className="text-[11px] font-extrabold text-[#a78bfa] uppercase tracking-wider">Encrypted in Local Vault</span>
                </div>

                {/* Content text */}
                <div className="text-sm md:text-base text-[#f1f0ff] leading-relaxed whitespace-pre-wrap pt-2 font-medium">
                  {entry.content}
                </div>

                {/* Metadata sections based on type */}
                {entry.entryType === 'TODO' && entry.metadata && (
                  <div className="mt-4 p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl flex flex-col gap-3">
                    <span className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-widest">Task Details</span>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div>Priority: <span className="text-white">{entry.metadata.priority || 'MEDIUM'}</span></div>
                      <div>Due: <span className="text-white">{entry.metadata.dueDate ? entry.metadata.dueDate.substring(0, 10) : 'None'}</span></div>
                      <div>Completed: <span className={entry.metadata.completed ? 'text-emerald-400' : 'text-amber-400'}>{entry.metadata.completed ? 'Yes' : 'No'}</span></div>
                      <div>Estimated Time: <span className="text-white">{entry.metadata.estimatedTime || '30m'}</span></div>
                    </div>
                  </div>
                )}

                {entry.entryType === 'EXPENSE' && entry.metadata && (
                  <div className="mt-4 p-5 bg-[#0a0a0f] border border-white/5 rounded-2xl flex flex-col gap-3">
                    <span className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-widest">Expense Details</span>
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div>Amount: <span className="text-white">₹{entry.metadata.amount}</span></div>
                      <div>Category: <span className="text-white">{entry.metadata.category || 'General'}</span></div>
                      <div>Payment Method: <span className="text-white">{entry.metadata.paymentMethod || 'UPI'}</span></div>
                      <div>Tags: <span className="text-white">{entry.metadata.tags || 'None'}</span></div>
                    </div>
                  </div>
                )}

                {aiSentiment && (
                  <div className="mt-4 p-5 bg-[#7c6aff]/5 border border-[#7c6aff]/10 rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-[#a78bfa] uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={12} />
                      AI Sentiment Analysis
                    </span>
                    <div className="text-xs text-[#9ca3af] font-semibold leading-relaxed">
                      What you are thinking: <span className="text-white italic">"{entry.aiInsight || 'Your thoughts are being processed.'}"</span>
                    </div>
                  </div>
                )}
              </article>
            )}
          </GlassCard>
        ) : null}
      </main>
    </div>
  );
}
