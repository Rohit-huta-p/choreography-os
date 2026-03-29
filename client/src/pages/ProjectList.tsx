import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../stores/authStore';
import type { Project } from '../types';

const TEMPLATES = [
  { key: 'blank', label: 'Blank Canvas' },
  { key: 'standard_wedding', label: 'Standard Wedding' },
  { key: 'small_sangeet', label: 'Small Sangeet' },
  { key: 'engagement', label: 'Engagement' },
];

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('blank');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/projects', { title, template });
      navigate(`/canvas/${res.data.project._id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? It can be recovered within 30 days.')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await api.post(`/projects/${id}/duplicate`);
      setProjects((prev) => [res.data.project, ...prev]);
    } catch (err) {
      console.error('Failed to duplicate project:', err);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Choreography OS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Welcome, {user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Create New Project</h3>
          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Event Name</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Sharma Wedding" autoFocus />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>Template</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TEMPLATES.map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => setTemplate(t.key)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius)',
                      border: `1px solid ${template === t.key ? 'var(--primary)' : 'var(--border)'}`,
                      background: template === t.key ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
                      color: template === t.key ? 'var(--primary)' : 'var(--text)',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Project list */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No projects yet</p>
          <p style={{ fontSize: 14 }}>Create your first project to get started</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map((p) => (
            <div
              key={p._id}
              className="card"
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}
              onClick={() => navigate(`/canvas/${p._id}`)}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{p.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Last updated: {new Date(p.updated_at).toLocaleDateString()}
                  {p.event_date && ` | Event: ${new Date(p.event_date).toLocaleDateString()}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-sm btn-secondary" onClick={() => handleDuplicate(p._id)}>Duplicate</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
