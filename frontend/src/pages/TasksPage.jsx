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
  ChevronDown,
  Sparkles,
  Trash2,
  Folder,
  MoreHorizontal,
  ArrowUpDown,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('sections'); // 'sections' | 'matrix' | 'kanban' | 'list'
  const { entries, loading, refetch } = useJournalEntries({ page: 0, size: 100 });
  const { showToast } = useToast();

  // Project & Section States
  const [projectName, setProjectName] = useState('TCS Placement Prep (19 July)');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [sections, setSections] = useState(['Sorting', 'Arrays', 'Strings', 'General']);
  const [showNewSectionInput, setShowNewSectionInput] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  
  // Collapsible completed section toggle
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  // Inline Quick Add Task for specific section
  const [activeAddingSection, setActiveAddingSection] = useState(null);
  const [inlineTaskTitle, setInlineTaskTitle] = useState('');

  // Full Task Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('TODO');
  const [selectedSection, setSelectedSection] = useState('Sorting');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [saving, setSaving] = useState(false);

  // Filter tasks from entries
  const tasks = entries.filter((e) => e.entryType === 'TODO' || (e.title && e.title.startsWith('[Task]')));

  // Active (uncompleted) and Completed tasks
  const activeTasks = tasks.filter((t) => !t.completed && (t.status || 'TODO') !== 'DONE');
  const completedTasks = tasks.filter((t) => t.completed || (t.status || 'TODO') === 'DONE');

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
        section: selectedSection,
        projectName,
        completed: status === 'DONE',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        subtasks
      });

      showToast('Task added to project!', 'success');
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

  const handleInlineQuickAddTask = async (sectionName) => {
    if (!inlineTaskTitle.trim()) return;

    try {
      await journalApi.create({
        title: inlineTaskTitle.trim(),
        content: 'Quick task item',
        entryType: 'TODO',
        priority: 'MEDIUM',
        status: 'TODO',
        section: sectionName,
        projectName,
        completed: false
      });

      showToast(`Added to ${sectionName}!`, 'success');
      setInlineTaskTitle('');
      setActiveAddingSection(null);
      refetch();
    } catch (err) {
      showToast('Failed to add quick task', 'error');
    }
  };

  const handleCreateSection = () => {
    if (newSectionName.trim() && !sections.includes(newSectionName.trim())) {
      setSections([...sections, newSectionName.trim()]);
      showToast(`Created section "${newSectionName.trim()}"`, 'success');
      setNewSectionName('');
      setShowNewSectionInput(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await journalApi.update(task.id, {
        title: task.title,
        content: task.content,
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
        title: task.title,
        content: task.content,
        completed: isCompleted,
        status: newStatus
      });
      showToast(isCompleted ? 'Completed! 🎉' : 'Task restored to active', 'success');
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

  const priorityColor = (p) => {
    switch ((p || 'MEDIUM').toUpperCase()) {
      case 'HIGH': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'LOW': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Group active tasks by section
  const getTasksForSection = (sectionName) => {
    return activeTasks.filter((t) => (t.section || 'General').toLowerCase() === sectionName.toLowerCase());
  };

  // Eisenhower Matrix Quadrant Categorization Logic
  const getQuadrantTasks = (quadrant) => {
    return tasks.filter((t) => {
      const isHighPriority = (t.priority || 'MEDIUM').toUpperCase() === 'HIGH';
      const isUrgent = Boolean(t.dueDate && new Date(t.dueDate) <= new Date(Date.now() + 86400000 * 2));
      
      switch (quadrant) {
        case 'Q1': return isHighPriority && isUrgent;
        case 'Q2': return isHighPriority && !isUrgent;
        case 'Q3': return !isHighPriority && isUrgent;
        case 'Q4': return !isHighPriority && !isUrgent;
        default: return false;
      }
    });
  };

  const kanbanColumns = [
    { key: 'BACKLOG', label: 'Backlog', color: 'border-slate-500/30' },
    { key: 'TODO', label: 'To Do', color: 'border-indigo-500/30' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-amber-500/30' },
    { key: 'DONE', label: 'Completed', color: 'border-emerald-500/30' }
  ];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Reference Image Header Matching TickTick Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div className="flex items-center gap-3">
          <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
            <Folder size={20} />
          </button>
          
          {isEditingProject ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingProject(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingProject(false); }}
              className="text-xl font-bold bg-[var(--bg-elevated)] border border-[var(--border-default)] px-2 py-1 rounded-lg text-[var(--text-primary)] outline-none"
              autoFocus
            />
          ) : (
            <h1 
              onClick={() => setIsEditingProject(true)}
              className="text-xl font-bold text-[var(--text-primary)] tracking-tight cursor-pointer flex items-center gap-2 hover:text-indigo-400 transition-colors"
            >
              <span>{projectName}</span>
              <Edit3 size={14} className="text-[var(--text-muted)] opacity-60 hover:opacity-100" />
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Switcher Pills */}
          <div className="flex items-center bg-[var(--bg-surface)] p-1 rounded-2xl border border-[var(--border-default)]">
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#a78bfa] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List size={14} />
              <span>Section Board</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-gradient-to-r from-[#6366f1] to-[#a78bfa] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Grid size={14} />
              <span>Eisenhower</span>
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
      {/* SECTIONED PROJECT TASK BOARD (Reference UI Implementation) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'sections' && (
        <div className="space-y-10">
          {sections.map((sectionName) => {
            const sectionTasks = getTasksForSection(sectionName);
            return (
              <div key={sectionName} className="space-y-3">
                {/* Section Header Matching Reference UI: "Sorting 5 + ... + New section" */}
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-primary)] font-extrabold text-sm">{sectionName}</span>
                    <span className="text-[11px] text-[var(--text-muted)] font-bold">{sectionTasks.length}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <button
                      onClick={() => setActiveAddingSection(sectionName)}
                      className="hover:text-[var(--text-primary)] text-[var(--text-muted)] cursor-pointer flex items-center gap-1"
                      title="Add task to this section"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => setShowNewSectionInput(true)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold cursor-pointer"
                    >
                      + New section
                    </button>
                  </div>
                </div>

                {/* Inline Quick Add Task for this Section */}
                {activeAddingSection === sectionName && (
                  <div className="flex gap-2 p-2 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
                    <input
                      type="text"
                      placeholder={`Add task to ${sectionName}...`}
                      value={inlineTaskTitle}
                      onChange={(e) => setInlineTaskTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleInlineQuickAddTask(sectionName); }}
                      className="flex-1 text-xs bg-transparent border-none outline-none text-[var(--text-primary)] px-2"
                      autoFocus
                    />
                    <button
                      onClick={() => handleInlineQuickAddTask(sectionName)}
                      className="px-3 py-1 bg-[#6366f1] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#4f46e5]"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setActiveAddingSection(null)}
                      className="px-2 py-1 text-[var(--text-muted)] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Task Cards List - Reference Pill Card Design */}
                <div className="space-y-2">
                  {sectionTasks.map((task) => (
                    <TickTaskPillCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleComplete}
                      onDelete={handleDeleteTask}
                    />
                  ))}

                  {sectionTasks.length === 0 && activeAddingSection !== sectionName && (
                    <div className="p-3 text-xs text-[var(--text-muted)] italic bg-[var(--bg-surface)]/50 rounded-xl border border-[var(--border-subtle)] text-center">
                      No active tasks in {sectionName}.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* New Section Inline Creator Prompt */}
          {showNewSectionInput && (
            <div className="flex items-center gap-3 p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl">
              <input
                type="text"
                placeholder="Section title (e.g. Dynamic Programming, Graphs)..."
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateSection(); }}
                className="input flex-1 text-xs"
                autoFocus
              />
              <button onClick={handleCreateSection} className="btn-primary">
                Create Section
              </button>
              <button onClick={() => setShowNewSectionInput(false)} className="btn-ghost">
                Cancel
              </button>
            </div>
          )}

          {/* Collapsible Completed Section Matching Reference UI: "v Completed 4" */}
          <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
            <button
              onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
              className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer select-none"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isCompletedExpanded ? 'rotate-0' : '-rotate-90'}`}
              />
              <span>Completed</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[10px] font-bold">
                {completedTasks.length}
              </span>
            </button>

            <AnimatePresence>
              {isCompletedExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-1"
                >
                  {completedTasks.map((task) => (
                    <TickTaskPillCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      completedStyle={true}
                    />
                  ))}

                  {completedTasks.length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] italic py-4">No completed tasks yet.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* EISENHOWER MATRIX VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'matrix' && (
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
                  <TickTaskPillCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
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
                  <TickTaskPillCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
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
                  <TickTaskPillCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
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
                  <TickTaskPillCard key={task.id} task={task} onToggle={handleToggleComplete} onDelete={handleDeleteTask} />
                ))}
                {getQuadrantTasks('Q4').length === 0 && (
                  <p className="text-xs text-[var(--text-muted)] italic py-8 text-center">No backlog items.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* KANBAN BOARD VIEW */}
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
                    placeholder="e.g. Selection Sort, Merge Sort..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-[var(--text-secondary)] block mb-1">Target Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="input cursor-pointer"
                    >
                      {sections.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

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
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary">
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

// TickTick Pixel-Matched Pill Card Component
function TickTaskPillCard({ task, onToggle, onDelete, completedStyle = false }) {
  const isCompleted = task.completed || (task.status || 'TODO') === 'DONE' || completedStyle;

  return (
    <div
      className={`px-4 py-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group select-none ${
        isCompleted
          ? 'bg-[#16161d]/40 border-white/[0.04] text-[var(--text-muted)]'
          : 'bg-[#1e1e28] border-white/[0.08] hover:border-white/20 text-[var(--text-primary)] shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <button
          onClick={() => onToggle(task)}
          className="text-[var(--text-muted)] hover:text-[#6366f1] transition-colors cursor-pointer shrink-0"
          aria-label="Toggle task"
        >
          {isCompleted ? (
            <div className="w-4 h-4 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white/80">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-4 h-4 rounded-md border border-white/30 hover:border-[#6366f1] transition-colors" />
          )}
        </button>

        <span className={`text-xs font-semibold tracking-wide transition-all truncate ${
          isCompleted ? 'line-through opacity-50' : 'text-[var(--text-primary)]'
        }`}>
          {task.title}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
          title="Delete task"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
