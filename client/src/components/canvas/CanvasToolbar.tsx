import { useCanvasStore } from '../../stores/canvasStore';
import type { CanvasObject } from '../../types';

const blockTypes: { type: CanvasObject['type']; label: string }[] = [
  { type: 'performance', label: 'Performance' },
  { type: 'task', label: 'Task List' },
];

export default function CanvasToolbar() {
  const { viewport, setViewport, createCanvasObject, undo, redo, undoStack, redoStack } =
    useCanvasStore();

  const zoomIn = () => setViewport({ scale: Math.min(viewport.scale + 0.15, 2) });
  const zoomOut = () => setViewport({ scale: Math.max(viewport.scale - 0.15, 0.25) });
  const fitAll = () => setViewport({ x: 0, y: 0, scale: 0.8 });

  const addBlock = (type: CanvasObject['type']) => {
    const cx = (-viewport.x + 400) / viewport.scale;
    const cy = (-viewport.y + 300) / viewport.scale;
    createCanvasObject(type, { x: cx, y: cy });
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 6,
        padding: '8px 12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        zIndex: 100,
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Add blocks */}
      {blockTypes.map((bt) => (
        <button key={bt.type} className="btn btn-sm btn-secondary" onClick={() => addBlock(bt.type)}>
          + {bt.label}
        </button>
      ))}

      <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

      {/* Undo / Redo */}
      <button className="btn-icon" onClick={undo} disabled={undoStack.length === 0} title="Undo (Ctrl+Z)">
        ↩
      </button>
      <button className="btn-icon" onClick={redo} disabled={redoStack.length === 0} title="Redo (Ctrl+Shift+Z)">
        ↪
      </button>

      <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

      {/* Zoom */}
      <button className="btn-icon" onClick={zoomOut} title="Zoom out">
        −
      </button>
      <span style={{ fontSize: 12, minWidth: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
        {Math.round(viewport.scale * 100)}%
      </span>
      <button className="btn-icon" onClick={zoomIn} title="Zoom in">
        +
      </button>
      <button className="btn btn-sm btn-secondary" onClick={fitAll}>
        Fit
      </button>
    </div>
  );
}
