import { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../stores/canvasStore';

const TYPE_ICONS: Record<string, string> = {
  performance: '🎭',
  performer: '👤',
  prop: '🎪',
  task: '☑',
};

export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, searchResults, clearSearch, setViewport, viewport } = useCanvasStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        clearSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [clearSearch]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(value);
    }, 300);
  };

  const handleSelect = (result: (typeof searchResults)[number]) => {
    if (result.position) {
      setViewport({
        x: -result.position.x * viewport.scale + window.innerWidth / 2,
        y: -result.position.y * viewport.scale + window.innerHeight / 2,
      });
    }
    setOpen(false);
    setQuery('');
    clearSearch();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 120,
      }}
      onClick={() => { setOpen(false); clearSearch(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
          height: 'fit-content',
          maxHeight: '60vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="input"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search performances, performers, props..."
          style={{ border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '14px 20px', fontSize: 15 }}
        />
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {searchResults.length === 0 && query.trim() && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No results found
            </div>
          )}
          {searchResults.map((r) => (
            <div
              key={`${r.type}-${r.id}`}
              onClick={() => handleSelect(r)}
              style={{
                padding: '10px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderBottom: '1px solid var(--border)',
                fontSize: 14,
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--bg-input)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
            >
              <span>{TYPE_ICONS[r.type] || '?'}</span>
              <span>{r.title}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{r.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
