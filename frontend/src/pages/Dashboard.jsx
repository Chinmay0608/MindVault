import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { 
  LogOut, Plus, Trash2, Edit3, Save, Search, 
  BookOpen, Calendar, Clock, Sparkles 
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form fields for editing/creating
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const userName = user?.userName || localStorage.getItem('userName') || 'Journaler';

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(entry => 
        entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEntries(filtered);
    }
  }, [searchQuery, entries]);

  const fetchEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('');
      const data = response.data;
      const entriesList = Array.isArray(data) ? data : (data?.content || []);
      setEntries(entriesList);
      setFilteredEntries(entriesList);
    } catch (err) {
      if (err.response?.status === 404) {
        setEntries([]);
        setFilteredEntries([]);
      } else if (err.response?.status === 403 || err.response?.status === 401) {
        // Redirect to login if unauthorized
        handleLogout();
      } else {
        setError('Failed to fetch journal entries. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    setSelectedEntry(null);
    setTitle('');
    setContent('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaveLoading(true);
    setError('');

    try {
      if (selectedEntry) {
        // Update existing entry
        const response = await API.put(`id/${selectedEntry.id}`, { title, content });
        const updatedEntry = response.data;
        
        const updatedList = entries.map(item => 
          item.id === selectedEntry.id ? updatedEntry : item
        );
        setEntries(updatedList);
        setSelectedEntry(updatedEntry);
        setIsEditing(false);
      } else {
        // Create new entry
        const response = await API.post('', { title, content });
        const newEntry = response.data;
        
        setEntries([newEntry, ...entries]);
        setSelectedEntry(newEntry);
        setIsEditing(false);
      }
      fetchEntries(); // Refresh list to get proper IDs/sorting
    } catch (err) {
      setError('Failed to save entry. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      await API.delete(`id/${entryId}`);
      const updatedList = entries.filter(item => item.id !== entryId);
      setEntries(updatedList);
      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry(null);
        setTitle('');
        setContent('');
      }
    } catch (err) {
      setError('Failed to delete entry.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-logo">
            <Sparkles className="logo-sparkle" size={20} />
            <h2>MindVault</h2>
          </div>
          <div className="user-profile">
            <p className="welcome-text">Welcome back,</p>
            <p className="user-name">{userName}</p>
          </div>
        </div>

        <button className="new-entry-btn" onClick={handleCreateNew}>
          <Plus size={18} />
          New Entry
        </button>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="workspace">
        {/* Entry List Column */}
        <section className="entry-list-col">
          <div className="search-bar">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Search thoughts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="entries-list">
            {loading ? (
              <div className="list-status">Loading entries...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="list-status empty">
                <BookOpen size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                No entries found. Write your first thought!
              </div>
            ) : (
              filteredEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className={`entry-card ${selectedEntry && selectedEntry.id === entry.id ? 'active' : ''}`}
                  onClick={() => handleSelectEntry(entry)}
                >
                  <div className="card-header">
                    <h4>{entry.title || 'Untitled Entry'}</h4>
                    <button 
                      className="delete-card-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="card-preview">{entry.content || 'No content'}</p>
                  <div className="card-footer">
                    <span className="card-date">
                      <Calendar size={12} style={{ marginRight: '4px' }} />
                      {formatDate(entry.date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Editor Column */}
        <section className="editor-col">
          {error && <div className="editor-error">{error}</div>}

          {isEditing || !selectedEntry && (title || content) || (selectedEntry === null && isEditing) ? (
            <div className="editor-pane">
              <div className="editor-header">
                <input 
                  type="text" 
                  className="editor-title-input" 
                  placeholder="Give this entry a title..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <button 
                  className="save-btn" 
                  onClick={handleSave}
                  disabled={saveLoading || !title.trim() || !content.trim()}
                >
                  <Save size={16} style={{ marginRight: '6px' }} />
                  {saveLoading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>

              <div className="editor-meta">
                <span>Creating new entry in journal database</span>
              </div>

              <textarea 
                className="editor-content-input"
                placeholder="Start writing your secure thoughts here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          ) : selectedEntry ? (
            <div className="viewer-pane">
              <div className="viewer-header">
                <h2>{selectedEntry.title}</h2>
                <div className="viewer-actions">
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    <Edit3 size={16} style={{ marginRight: '6px' }} />
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(selectedEntry.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="viewer-meta">
                <span className="meta-item">
                  <Calendar size={14} style={{ marginRight: '4px' }} />
                  Created: {formatDate(selectedEntry.date)}
                </span>
              </div>

              <div className="viewer-content">
                {selectedEntry.content}
              </div>
            </div>
          ) : (
            <div className="empty-workspace">
              <div className="empty-workspace-content">
                <div className="empty-icon-wrapper">
                  <BookOpen size={48} className="pulse-icon" />
                </div>
                <h3>Welcome to MindVault</h3>
                <p>Choose an entry from the list or start a new one to begin capturing your personal details securely.</p>
                <button className="workspace-start-btn" onClick={handleCreateNew}>
                  <Plus size={16} style={{ marginRight: '6px' }} />
                  Create First Entry
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
