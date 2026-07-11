import { useState } from 'react';
import { SENTIMENT_CONFIG } from './SentimentBadge';
import { 
  Save, 
  AlertCircle, 
  FileText, 
  CheckSquare, 
  IndianRupee, 
  Clock,
  Flag,
  Calendar as CalendarIcon,
  Bell,
  Plus,
  Trash2,
  ListTodo,
  Wallet,
  Paperclip,
  Tag,
  X
} from 'lucide-react';

const SENTIMENT_ACTIVE_STYLES = {
  HAPPY: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20 scale-[1.03]',
  SAD: 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.03]',
  ANGRY: 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20 scale-[1.03]',
  ANXIOUS: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.03]',
};

const ENTRY_TYPES = [
  { value: 'JOURNAL', label: 'Journal', icon: FileText },
  { value: 'TODO', label: 'To-Do', icon: CheckSquare },
  { value: 'EXPENSE', label: 'Expense', icon: IndianRupee }
];

export default function EntryForm({ 
  initialTitle = '', 
  initialContent = '', 
  initialSentiment = 'HAPPY', 
  initialType = 'JOURNAL',
  initialMetadata = {},
  onSave = () => {}, 
  onCancel = null,
  isEditMode = false,
  loading = false 
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [sentiment, setSentiment] = useState(initialSentiment);
  const [entryType, setEntryType] = useState(initialType);
  const [error, setError] = useState('');

  // Todo metadata states
  const [completed, setCompleted] = useState(initialMetadata.completed || false);
  const [priority, setPriority] = useState(initialMetadata.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(initialMetadata.dueDate ? initialMetadata.dueDate.substring(0, 10) : '');
  const [subtasks, setSubtasks] = useState(initialMetadata.subtasks || []);
  const [estimatedTime, setEstimatedTime] = useState(initialMetadata.estimatedTime || '30m');
  const [reminder, setReminder] = useState(initialMetadata.reminder || false);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Expense metadata states
  const [amount, setAmount] = useState(initialMetadata.amount || '');
  const [category, setCategory] = useState(initialMetadata.category || '');
  const [paymentMethod, setPaymentMethod] = useState(initialMetadata.paymentMethod || 'UPI');
  const [tags, setTags] = useState(initialMetadata.tags || '');
  const [receiptName, setReceiptName] = useState(initialMetadata.receiptName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      const modeLabel = entryType === 'TODO' ? 'task title' : entryType === 'EXPENSE' ? 'expense description' : 'title';
      setError(`Please enter a ${modeLabel}.`);
      return;
    }
    setError('');

    const metadata = {};
    if (entryType === 'TODO') {
      metadata.completed = completed;
      metadata.priority = priority;
      metadata.dueDate = dueDate || null;
      metadata.subtasks = subtasks;
      metadata.estimatedTime = estimatedTime;
      metadata.reminder = reminder;
    } else if (entryType === 'EXPENSE') {
      metadata.amount = Number(amount) || 0;
      metadata.category = category || 'General';
      metadata.paymentMethod = paymentMethod;
      metadata.tags = tags;
      metadata.receiptName = receiptName;
    }

    onSave({ title, content, sentiment, entryType, metadata });
  };

  // Subtask helpers
  const addSubtask = () => {
    if (newSubtaskText.trim()) {
      setSubtasks([...subtasks, { text: newSubtaskText.trim(), completed: false }]);
      setNewSubtaskText('');
    }
  };

  const toggleSubtask = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  const deleteSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progressPercent = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  // File Upload Simulator
  const triggerMockUpload = () => {
    setReceiptName('receipt_invoice_2026.pdf');
  };

  const removeMockReceipt = (e) => {
    e.stopPropagation();
    setReceiptName('');
  };

  // ----------------------------------------------------
  // JOURNAL LAYOUT
  // ----------------------------------------------------
  const renderJournalForm = () => {
    return (
      <div className="flex flex-col gap-6 text-[#f1f0ff]">
        {/* Dynamic Header */}
        <div className="border-b border-white/5 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {isEditMode ? 'Reflect Securely' : 'Write Your Thoughts'}
            </h2>
            <p className="text-xs text-[#9ca3af] font-semibold mt-1">Reflect securely under local vault encryption.</p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-[#9ca3af] hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-accent-primary uppercase tracking-wider">Journal Title</label>
          <input
            type="text"
            required
            placeholder="Give this entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-text-primary placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-accent-primary outline-none"
          />
        </div>

        {/* Reflection Thoughts */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-accent-primary uppercase tracking-wider">Journal Entry</label>
          <textarea
            required
            placeholder="Start writing your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-text-primary placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-accent-primary outline-none leading-relaxed resize-y min-h-[220px]"
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg shadow-accent-primary/20 transition-all duration-200 cursor-pointer text-sm"
        >
          <Save size={16} />
          <span>{loading ? 'Saving Entry...' : 'Save Entry'}</span>
        </button>
      </div>
    );
  };

  // ----------------------------------------------------
  // TO-DO LAYOUT
  // ----------------------------------------------------
  const renderTodoForm = () => {
    return (
      <div className="flex flex-col gap-6 text-[#f1f0ff]">
        {/* Dynamic Header */}
        <div className="border-b border-white/5 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {isEditMode ? 'Edit Task' : 'Create Task'}
            </h2>
            <p className="text-xs text-[#9ca3af] font-semibold mt-1">Organize your work and stay productive.</p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-[#9ca3af] hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Task Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-accent-primary uppercase tracking-wider">Task Title</label>
          <input
            type="text"
            required
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-accent-primary outline-none"
          />
        </div>

        {/* Task Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-2xl bg-white/5 border border-white/10">
          {/* Due Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <CalendarIcon size={12} className="text-[#6b7280]" />
              <span>Due Date</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-accent-primary outline-none text-white cursor-pointer"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <Flag size={12} className="text-[#6b7280]" />
              <span>Priority Level</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-accent-primary outline-none text-white cursor-pointer"
            >
              <option value="LOW">🔵 LOW</option>
              <option value="MEDIUM">🟡 MEDIUM</option>
              <option value="HIGH">🔴 HIGH</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider">Status</label>
            <button
              type="button"
              onClick={() => setCompleted(!completed)}
              className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                completed
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-[#9ca3af] hover:bg-white/10'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/10 bg-[#0a0a0f]'
              }`}>
                {completed && (
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>{completed ? 'Completed' : 'Active Task'}</span>
            </button>
          </div>
        </div>

        {/* Checklist */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
          <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1.5">
            <ListTodo size={13} className="text-[#6b7280]" />
            <span>Subtasks Checklist</span>
          </label>

          {subtasks.length > 0 && (
            <div className="flex flex-col gap-1.5 pb-2 border-b border-white/5">
              <div className="flex justify-between items-center text-[10px] font-extrabold text-[#9ca3af]">
                <span>PROGRESS</span>
                <span className="text-accent-secondary bg-accent-primary/10 px-1.5 py-0.5 rounded-md">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a0a0f] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-primary transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {subtasks.map((task, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-[#0a0a0f] border border-white/5 rounded-xl group">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleSubtask(idx)}
                    className="rounded border-white/10 text-accent-primary focus:ring-accent-primary/20 cursor-pointer"
                  />
                  <span className={`text-xs font-semibold text-[#f1f0ff] transition-all ${
                    task.completed ? 'line-through text-[#6b7280]' : ''
                  }`}>
                    {task.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteSubtask(idx)}
                  className="p-1 hover:text-rose-400 text-[#6b7280] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {subtasks.length === 0 && (
              <p className="text-xs text-[#6b7280] font-semibold italic text-center py-2">No subtasks added.</p>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add subtask step..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
              className="flex-1 px-3.5 py-2 text-xs bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-[#7c6aff] text-white outline-none"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Task Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Task Notes</label>
          <textarea
            placeholder="Add notes, details, or reminders..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] outline-none"
          />
        </div>

        {/* Time Estimate / Reminders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} className="text-[#6b7280]" />
              <span>Time Estimate</span>
            </label>
            <select
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0a0a0f] border border-white/10 rounded-xl outline-none text-white cursor-pointer"
            >
              <option value="15m">15 Minutes</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="2h">2 Hours</option>
              <option value="4h">4 Hours</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <Bell size={12} className="text-[#6b7280]" />
              <span>Reminders</span>
            </label>
            <button
              type="button"
              onClick={() => setReminder(!reminder)}
              className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer ${
                reminder
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-white/5 border-white/10 text-[#9ca3af]'
              }`}
            >
              <span>Enable Reminder Alert</span>
              <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                reminder ? 'bg-amber-500' : 'bg-white/10'
              }`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200 ${
                  reminder ? 'translate-x-3.5' : 'translate-x-0'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Add Task Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#7c6aff] to-[#a78bfa] hover:from-[#6d5be6] hover:to-[#967ce6] text-white font-extrabold rounded-2xl shadow-lg transition-all duration-200 cursor-pointer text-sm"
        >
          <Save size={16} />
          <span>{loading ? 'Adding Task...' : 'Add Task'}</span>
        </button>
      </div>
    );
  };

  // ----------------------------------------------------
  // EXPENSE LAYOUT
  // ----------------------------------------------------
  const renderExpenseForm = () => {
    return (
      <div className="flex flex-col gap-6 text-[#f1f0ff]">
        {/* Dynamic Header */}
        <div className="border-b border-white/5 pb-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              {isEditMode ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <p className="text-xs text-[#9ca3af] font-semibold mt-1">Track your spending intelligently.</p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-[#9ca3af] hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Expense Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Weekly Groceries, Server Billing..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] outline-none"
          />
        </div>

        {/* Expense Grid Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-2xl bg-white/5 border border-white/10">
          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <IndianRupee size={12} className="text-[#6b7280]" />
              <span>Amount (₹)</span>
            </label>
            <input
              type="number"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs font-extrabold bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-[#7c6aff] text-white outline-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} className="text-[#6b7280]" />
              <span>Category</span>
            </label>
            <input
              type="text"
              required
              placeholder="Food, Travel, Rent..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-[#7c6aff] text-white outline-none"
            />
          </div>

          {/* Payment Method */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <Wallet size={12} className="text-[#6b7280]" />
              <span>Payment Method</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-[#7c6aff] text-white outline-none cursor-pointer"
            >
              <option value="UPI">UPI</option>
              <option value="CARD">Credit/Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="NETBANKING">Net Banking</option>
            </select>
          </div>
        </div>

        {/* Tags & Receipt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tags */}
          <div className="flex flex-col gap-1.5 p-5 rounded-2xl bg-white/5 border border-white/10">
            <label className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1">
              <Tag size={12} className="text-[#6b7280]" />
              <span>Tags (comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="personal, vital, office"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-[#0a0a0f] border border-white/10 rounded-xl focus:border-[#7c6aff] text-white outline-none"
            />
          </div>

          {/* Mock Receipt Upload */}
          <div 
            onClick={triggerMockUpload}
            className="p-5 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 hover:border-[#7c6aff]/80 hover:bg-white/10 transition-all duration-200 cursor-pointer flex flex-col justify-center items-center text-center gap-1 group"
          >
            {receiptName ? (
              <div className="flex items-center gap-2 bg-[#7c6aff]/10 border border-[#7c6aff]/20 text-[#a78bfa] text-xs font-bold px-3 py-1.5 rounded-xl">
                <Paperclip size={13} />
                <span>{receiptName}</span>
                <button 
                  type="button" 
                  onClick={removeMockReceipt}
                  className="hover:text-rose-400 font-extrabold text-[10px]"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <>
                <Paperclip size={16} className="text-[#6b7280] group-hover:text-[#a78bfa] transition-colors" />
                <span className="text-[11px] text-[#9ca3af] font-bold">Attach Bill / Receipt</span>
                <span className="text-[9px] text-[#6b7280] font-semibold uppercase tracking-wider">No receipt attached.</span>
              </>
            )}
          </div>
        </div>

        {/* Expense Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-[#7c6aff] uppercase tracking-wider">Expense Notes</label>
          <textarea
            placeholder="Add notes about this purchase..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-[#6b7280] text-sm transition-all duration-300 focus:bg-white/10 focus:border-[#7c6aff] outline-none"
          />
        </div>

        {/* Save Expense Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#7c6aff] to-[#a78bfa] hover:from-[#6d5be6] hover:to-[#967ce6] text-white font-extrabold rounded-2xl shadow-lg transition-all duration-200 cursor-pointer text-sm"
        >
          <Save size={16} />
          <span>{loading ? 'Saving Expense...' : 'Save Expense'}</span>
        </button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="flex items-center gap-2 p-4 text-xs text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 rounded-2xl animate-shake">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Entry Type Selector Pills */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-extrabold text-[#6b7280] uppercase tracking-wider">Entry Mode</label>
        <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
          {ENTRY_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = entryType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setEntryType(type.value)}
                className={`flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-bold rounded-full border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#7c6aff] text-white border-transparent shadow-[0_4px_15px_rgba(124,106,255,0.25)] scale-[1.01]'
                    : 'bg-white/5 text-[#9ca3af] border-white/10 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} className={isSelected ? 'text-white' : 'text-[#9ca3af]'} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render subforms conditionally */}
      {entryType === 'TODO' && renderTodoForm()}
      {entryType === 'EXPENSE' && renderExpenseForm()}
      {entryType === 'JOURNAL' && renderJournalForm()}
    </form>
  );
}
