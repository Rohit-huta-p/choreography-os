import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../stores/canvasStore';
import CanvasEngine from '../components/canvas/CanvasEngine';
import CanvasToolbar from '../components/canvas/CanvasToolbar';
import SyncIndicator from '../components/canvas/SyncIndicator';
import SearchOverlay from '../components/SearchOverlay';
import ErrorBoundary from '../components/ErrorBoundary';
import { exportShowFlowPdf } from '../utils/exportPdf';

export default function CanvasScreen() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { loadProject, reset, showFlow, performances, performers, props, flushSaves } = useCanvasStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    loadProject(projectId)
      .then(() => setLoading(false))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load project');
        setLoading(false);
      });

    return () => {
      flushSaves();
      reset();
    };
  }, [projectId, loadProject, reset, flushSaves]);

  const handleExportPdf = () => {
    const state = useCanvasStore.getState();
    exportShowFlowPdf({
      title: 'Event Show Flow',
      showFlow: state.showFlow,
      performances: state.performances,
      performers: state.performers,
      props: state.props,
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading project...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Projects</button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div
        style={{
          height: 56,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          justifyContent: 'space-between',
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-icon" onClick={() => navigate('/')} title="Back to projects">
            ←
          </button>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Choreography OS</span>
        </div>

        <SyncIndicator />

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowSidebar(!showSidebar)}>
            Edit Data
          </button>
          <button className="btn btn-sm btn-secondary" onClick={handleExportPdf}>
            Export PDF
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ErrorBoundary>
          <CanvasEngine />
        </ErrorBoundary>
        <CanvasToolbar />
        <SearchOverlay />
      </div>

      {/* Side panel for data editing */}
      {showSidebar && (
        <SidePanel onClose={() => setShowSidebar(false)} />
      )}
    </div>
  );
}

// Side panel for editing data outside the canvas (add performers, props, show flow edits, etc.)
function SidePanel({ onClose }: { onClose: () => void }) {
  const {
    performers,
    performances,
    props: propsData,
    showFlow,
    addPerformer,
    updatePerformer,
    deletePerformer,
    addProp,
    updateProp,
    deleteProp,
    updatePerformance,
    updateShowFlow,
    assignPerformer,
    linkPropToPerformance,
  } = useCanvasStore();

  const [tab, setTab] = useState<'performers' | 'props' | 'performances' | 'showflow'>('performers');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const perfList = Object.values(performances);
  const performerList = Object.values(performers).filter((p) => p.name !== '__roster__');
  const propList = Object.values(propsData).filter((p) => p.name !== '__props_board__');

  const handleAddPerformer = () => {
    if (!newName.trim()) return;
    addPerformer({ name: newName.trim(), role: newRole.trim() || undefined });
    setNewName('');
    setNewRole('');
  };

  const handleAddProp = () => {
    if (!newName.trim()) return;
    addProp({ name: newName.trim() });
    setNewName('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 56,
        right: 0,
        bottom: 0,
        width: 360,
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)',
        zIndex: 150,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {(['performers', 'props', 'performances', 'showflow'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: tab === t ? 'var(--bg-input)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: tab === t ? 600 : 400,
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
              textTransform: 'capitalize',
            }}
          >
            {t === 'showflow' ? 'Show Flow' : t}
          </button>
        ))}
        <button onClick={onClose} style={{ padding: '12px', background: 'none', color: 'var(--text-muted)', fontSize: 16 }}>✕</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {tab === 'performers' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="input" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ flex: 1 }} />
              <input className="input" placeholder="Role" value={newRole} onChange={(e) => setNewRole(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-sm btn-primary" onClick={handleAddPerformer}>+</button>
            </div>
            {performerList.map((p) => (
              <div key={p._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14 }}>{p.name}</div>
                  {p.role && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.role}</div>}
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => deletePerformer(p._id)}>✕</button>
              </div>
            ))}
          </>
        )}

        {tab === 'props' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="input" placeholder="Prop name" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-sm btn-primary" onClick={handleAddProp}>+</button>
            </div>
            {propList.map((p) => (
              <div key={p._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14 }}>{p.name} (x{p.quantity})</div>
                  <div style={{ fontSize: 11, color: p.status === 'PENDING' ? 'var(--danger)' : 'var(--success)' }}>{p.status}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => updateProp(p._id, { status: p.status === 'PENDING' ? 'ACQUIRED' : 'PENDING' })}
                  >
                    {p.status === 'PENDING' ? '✓' : '↩'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteProp(p._id)}>✕</button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'performances' && (
          <>
            {perfList.map((p) => (
              <div key={p._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</span>
                  <select
                    value={p.status}
                    onChange={(e) => updatePerformance(p._id, { status: e.target.value as any })}
                    style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 11 }}
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="TEACHING">Teaching</option>
                    <option value="ALMOST_DONE">Almost Done</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                {/* Assign performers */}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Performers: {p.performer_ids.map((id) => performers[id]?.name).filter(Boolean).join(', ') || 'None'}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      assignPerformer(e.target.value, p._id);
                      e.target.value = '';
                    }
                  }}
                  style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 11, width: '100%' }}
                >
                  <option value="">+ Assign performer...</option>
                  {performerList.filter((perf) => !p.performer_ids.includes(perf._id)).map((perf) => (
                    <option key={perf._id} value={perf._id}>{perf.name}</option>
                  ))}
                </select>
                {/* Link props */}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, marginBottom: 4 }}>
                  Props: {p.prop_ids.map((id) => propsData[id]?.name).filter(Boolean).join(', ') || 'None'}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      linkPropToPerformance(e.target.value, p._id);
                      e.target.value = '';
                    }
                  }}
                  style={{ background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: 11, width: '100%' }}
                >
                  <option value="">+ Link prop...</option>
                  {propList.filter((prop) => !p.prop_ids.includes(prop._id)).map((prop) => (
                    <option key={prop._id} value={prop._id}>{prop.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </>
        )}

        {tab === 'showflow' && (
          <>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Add performances to the show flow and set durations.
            </p>
            {showFlow?.entries.map((entry, i) => {
              const perf = performances[entry.performance_id];
              return (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{perf?.title || 'Unknown'}</span>
                  <input
                    type="number"
                    value={entry.duration_minutes}
                    onChange={(e) => {
                      const newEntries = [...(showFlow?.entries || [])];
                      newEntries[i] = { ...newEntries[i], duration_minutes: parseInt(e.target.value) || 0 };
                      updateShowFlow(newEntries);
                    }}
                    style={{ width: 50, background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px', fontSize: 11, textAlign: 'center' }}
                    min={0}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>min</span>
                </div>
              );
            })}
            {/* Add to show flow */}
            <select
              onChange={(e) => {
                if (e.target.value && showFlow) {
                  const newEntries = [
                    ...showFlow.entries,
                    { performance_id: e.target.value, duration_minutes: 0, transition_notes: '', order: showFlow.entries.length },
                  ];
                  updateShowFlow(newEntries);
                  e.target.value = '';
                }
              }}
              style={{ marginTop: 12, background: 'var(--bg-input)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px', fontSize: 12, width: '100%' }}
            >
              <option value="">+ Add performance to show flow...</option>
              {perfList
                .filter((p) => !showFlow?.entries.some((e) => e.performance_id === p._id))
                .map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
            </select>
            {showFlow && showFlow.entries.length > 0 && (
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Total: {showFlow.entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)} min
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
