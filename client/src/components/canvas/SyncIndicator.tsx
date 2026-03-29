import { useCanvasStore } from '../../stores/canvasStore';

export default function SyncIndicator() {
  const syncStatus = useCanvasStore((s) => s.syncStatus);

  const config = {
    saved: { text: 'All changes saved', color: 'var(--success)' },
    saving: { text: 'Saving...', color: 'var(--warning)' },
    error: { text: 'Sync error', color: 'var(--danger)' },
    offline: { text: 'Offline — changes pending', color: 'var(--danger)' },
  };

  const c = config[syncStatus];

  return (
    <span style={{ fontSize: 12, color: c.color, display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
      {c.text}
    </span>
  );
}
