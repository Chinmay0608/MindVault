import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as journalApi from '../api/journalApi';
import GlassCard from '../components/GlassCard';
import BackgroundGradient from '../components/BackgroundGradient';
import EntryForm from '../components/EntryForm';
import { ArrowLeft, AlertCircle } from 'lucide-react';

import { useToast } from '../context/ToastContext';

export default function NewEntryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSave = async (formData) => {
    setLoading(true);
    setError('');
    const typeLabel = formData.entryType === 'TODO' ? 'Task' : formData.entryType === 'EXPENSE' ? 'Expense' : 'Journal entry';
    try {
      await journalApi.create(formData);
      showToast(`${typeLabel} successfully encrypted and saved!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      const errMsg = `Failed to save ${typeLabel.toLowerCase()}. Please try again.`;
      setError(errMsg);
      showToast(errMsg, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <BackgroundGradient />

      <main className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Back navigation */}
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#9ca3af] hover:text-[#7c6aff] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Journal
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-2xl">
            <AlertCircle size={16} />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <GlassCard className="p-8 md:p-10 border-white/10">
          <EntryForm
            onSave={handleSave}
            loading={loading}
          />
        </GlassCard>
      </main>
    </div>
  );
}
