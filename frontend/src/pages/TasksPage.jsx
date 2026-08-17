import { useState, useEffect } from 'react';
import useJournalEntries from '../hooks/useJournalEntries';
import * as journalApi from '../api/journalApi';
import { useToast } from '../context/ToastContext';
import { 
  CheckSquare, 
  Grid, 
  Columns, 
  List, 
  Plus, 
  Calendar, 
  Flag, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'kanban' | 'list'
  const { entries, loading, refetch } = useJournalEntries({ page: 0, size: 50 });
  const { showToast } = useToast();

  // Filter tasks from entries or treat TODO-type items
  const tasks = entries.filter((e) => e.entryType === 'TODO' || (e.title && e.title.startsWith('[Task]')));

  // Quick Task Form States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleCreateTask = async (e) => {
    if (e) e.preventDefault();
    if (!taskTitle.trim()) {
      showToast('Task title cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      await journalApi.create({
        title: taskTitle.trim(),
        content: taskContent.trim() || 'No additional task details.',
        entryType: 'TODO',
        priority,
        status,
        completed: status === 'DONE',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        subtasks
      });

      showToast('Task created successfully!', 'success');
      setTaskTitle('');
      setTaskContent('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDueDate('');
      setSubtasks([]);
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      showToast('Failed to create task.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const updated = await journalApi.update(task.id, {
        status: newStatus,
        completed: newStatus === 'DONE'
      });
      showToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'success');
      refetch();
    } catch (err) {
      showToast('Failed to update task status.', 'error');
    }
  };

  const handleToggleComplete = async (task) => {
    const isCompleted = !task.completed;
    const newStatus = isCompleted ? 'DONE' : 'TODO';
    try {
      await journalApi.update(task.id, {
        completed: isCompleted,
        status: newStatus
      });
      showToast(isCompleted ? 'Task completed! 🎉' : 'Task marked active', 'success');
      refetch();
    } catch (err) {
      showToast('Failed to toggle completion', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await journalApi.remove(taskId);
      showToast('Task deleted', 'success');
      refetch();
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, { text: subtaskInput.trim(), completed: false }]);
      setSubtaskInput('');
    }
  };

  const priorityColor = (p) => {
    switch ((p || 'MEDIUM').toUpperCase()) {
      case 'HIGH': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'LOW': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Eisenhower Matrix Quadrant Categorization Logic
  const getQuadrantTasks = (quadrant) => {
    return tasks.filter((t) => {
      const isHighPriority = (t.priority || 'MEDIUM').toUpperCase() === 'HIGH';
      const isUrgent = Boolean(t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 86400000 * 2));
      
      switch (quadrant) {
        case 'Q1': return isHighPriority && isUrgent; // Do First
        case 'Q2': return isHighPriority && !isUrgent; // Schedule
        case 'Q3': return !isHighPriority && isUrgent; // Delegate / Quick
        case 'Q4': return !isHighPriority && !isUrgent; // Don't Do / Backlog
        default: return false;
      }
    });
  };

  // Kanban Columns Data
  const kanbanColumns = [
    { key: 'BACKLOG', label: 'Backlog', color: 'border-slate-500/30' },
    { key: 'TODO', label: 'To Do', color: 'border-indigo-500/30' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-amber-500/30' },
    { key: 'DONE', label: 'Completed', color: 'border-emerald-500/30' }
  ];

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
            <CheckSquare className="text-[#6366f1]" size={24} />
            <span>Task Productivity Suite</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Organize priorities with the Eisenhower Matrix & Kanban Board workflow.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Switcher Pills */}
          <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-2xl border border-[var(--border-default)]">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#a78bfa] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Grid size={14} />
              <span>Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'kanban'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#a78bfa] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Columns size={14} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#a78bfa] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List size={14} />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary shrink-0"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* EISENHOWER MATRIX VIEW (2x2 Grid) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Q1: Do First */}
            <div className="card p-6 border-rose-500/30 bg-rose-500/[0.02] flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-rose-500/20 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <h3 className="font-bold text-rose-500 text-sm uppercase tracking-wider">
                      Q1: Do First (Urgent & Important)
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                    {getQuadrantTasks('Q1').length}
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {getQuadrantTasks('Q1').map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
                  ))}
                  {getQuadrantTasks('Q1').length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] italic py-8 text-center">No urgent & important tasks.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Q2: Schedule */}
            <div className="card p-6 border-indigo-500/30 bg-indigo-500/[0.02] flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-indigo-500/20 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                    <h3 className="font-bold text-indigo-400 text-sm uppercase tracking-wider">
                      Q2: Schedule (Important, Not Urgent)
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                    {getQuadrantTasks('Q2').length}
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {getQuadrantTasks('Q2').map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
                  ))}
                  {getQuadrantTasks('Q2').length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] italic py-8 text-center">No scheduled tasks.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Q3: Quick / Delegate */}
            <div className="card p-6 border-amber-500/30 bg-amber-500/[0.02] flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-amber-500/20 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <h3 className="font-bold text-amber-500 text-sm uppercase tracking-wider">
                      Q3: Quick / Delegate (Urgent, Not Important)
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                    {getQuadrantTasks('Q3').length}
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {getQuadrantTasks('Q3').map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
                  ))}
                  {getQuadrantTasks('Q3').length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] italic py-8 text-center">No quick tasks.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Q4: Don't Do / Backlog */}
            <div className="card p-6 border-slate-500/30 bg-slate-500/[0.02] flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-500/20 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-400" />
                    <h3 className="font-bold text-slate-400 text-sm uppercase tracking-wider">
                      Q4: Backlog (Not Urgent & Not Important)
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-400 font-bold border border-slate-500/20">
                    {getQuadrantTasks('Q4').length}
                  </span>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {getQuadrantTasks('Q4').map((task) => (
                    <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
                  ))}
                  {getQuadrantTasks('Q4').length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] italic py-8 text-center">No backlog items.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* KANBAN BOARD VIEW (4 Columns) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => (t.status || 'TODO').toUpperCase() === col.key);
            return (
              <div key={col.key} className={`card p-5 border-t-4 ${col.color} space-y-4 min-h-[420px] flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                    <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">
                      {col.label}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 pt-4 max-h-[480px] overflow-y-auto pr-1">
                    {colTasks.map((task) => (
                      <div key={task.id} className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl space-y-3 shadow-sm hover:border-[#6366f1]/50 transition-all">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityColor(task.priority)}`}>
                            {task.priority || 'MEDIUM'}
                          </span>
                          <div className="flex items-center gap-1">
                            {col.key !== 'BACKLOG' && (
                              <button
                                onClick={() => handleStatusChange(task, col.key === 'DONE' ? 'IN_PROGRESS' : col.key === 'IN_PROGRESS' ? 'TODO' : 'BACKLOG')}
                                className="p-1 hover:text-[var(--text-primary)] text-[var(--text-muted)] cursor-pointer"
                                title="Move left"
                              >
                                <ChevronLeft size={14} />
                              </button>
                            )}
                            {col.key !== 'DONE' && (
                              <button
                                onClick={() => handleStatusChange(task, col.key === 'BACKLOG' ? 'TODO' : col.key === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                                className="p-1 hover:text-[var(--text-primary)] text-[var(--text-muted)] cursor-pointer"
                                title="Move right"
                              >
                                <ChevronRight size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2 leading-snug">
                          {task.title}
                        </h4>

                        {task.content && (
                          <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                            {task.content}
                          </p>
                        )}

                        <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                          </span>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <span className="font-semibold text-indigo-400">
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <p className="text-xs text-[var(--text-muted)] italic py-12 text-center">Empty stage</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* LIST VIEW (GTD Task List) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'list' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider pb-3 border-b border-[var(--border-subtle)]">
            All Actionable Tasks ({tasks.length})
          </h3>

          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
            ))}
            {tasks.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] italic py-12 text-center">No tasks recorded yet. Click "New Task" to create one.</p>
            )}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 md:p-8 max-w-lg w-full space-y-5 bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4">
                <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center gap-2">
                  <CheckSquare size={18} className="text-[#6366f1]" />
                  <span>Create Task</span>
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[var(--text-secondary)] block mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete quarterly audit report..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--text-secondary)] block mb-1">Task Notes / Description</label>
                  <textarea
                    placeholder="Add extra context or requirements..."
                    value={taskContent}
                    onChange={(e) => setTaskContent(e.target.value)}
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[var(--text-secondary)] block mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="input cursor-pointer"
                    >
                      <option value="HIGH">🔴 High (Do First)</option>
                      <option value="MEDIUM">🟡 Medium (Schedule)</option>
                      <option value="LOW">🔵 Low (Delegate)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[var(--text-secondary)] block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="input cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete }) {
  const priorityColor = (p) => {
    switch ((p || 'MEDIUM').toUpperCase()) {
      case 'HIGH': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'LOW': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl space-y-2 hover:border-[#6366f1]/40 transition-all flex items-center justify-between gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 text-[var(--text-muted)] hover:text-[#6366f1] transition-colors cursor-pointer shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <Circle size={18} />
          )}
        </button>

        <div className="space-y-1 min-w-0 flex-1">
          <h4 className={`text-xs font-bold text-[var(--text-primary)] leading-snug line-clamp-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h4>
          {task.content && (
            <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
              {task.content}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityColor(task.priority)}`}>
          {task.priority || 'MEDIUM'}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
