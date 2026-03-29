import { create } from 'zustand';
import api from '../api/client';
import type {
  CanvasObject,
  Performance,
  Performer,
  Prop,
  ShowFlow,
  TaskBlock,
  Position,
  SearchResult,
} from '../types';

interface Command {
  execute: () => void;
  undo: () => void;
}

interface CanvasState {
  // Viewport
  viewport: { x: number; y: number; scale: number };
  setViewport: (v: Partial<{ x: number; y: number; scale: number }>) => void;

  // Data
  projectId: string | null;
  canvasObjects: Record<string, CanvasObject>;
  performances: Record<string, Performance>;
  performers: Record<string, Performer>;
  props: Record<string, Prop>;
  showFlow: ShowFlow | null;
  tasks: Record<string, TaskBlock>;

  // Selection & highlighting
  selectedIds: string[];
  highlightedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  setHighlightedIds: (ids: string[]) => void;

  // Sync
  syncStatus: 'saved' | 'saving' | 'error' | 'offline';
  pendingSaves: Map<string, () => Promise<void>>;

  // Undo/Redo
  undoStack: Command[];
  redoStack: Command[];

  // Search
  searchResults: SearchResult[];

  // Actions
  loadProject: (projectId: string) => Promise<void>;
  reset: () => void;

  // Canvas object actions
  moveObject: (id: string, position: Position) => void;
  toggleCollapsed: (id: string) => void;
  deleteCanvasObject: (id: string) => Promise<void>;
  createCanvasObject: (type: CanvasObject['type'], position?: Position) => Promise<void>;

  // Performance actions
  updatePerformance: (id: string, updates: Partial<Performance>) => Promise<void>;

  // Performer actions
  addPerformer: (data: { name: string; role?: string; contact?: string; notes?: string }) => Promise<void>;
  updatePerformer: (id: string, updates: Partial<Performer>) => Promise<void>;
  deletePerformer: (id: string) => Promise<void>;
  assignPerformer: (performerId: string, performanceId: string) => Promise<void>;
  unassignPerformer: (performerId: string, performanceId: string) => Promise<void>;

  // Prop actions
  addProp: (data: { name: string; quantity?: number }) => Promise<void>;
  updateProp: (id: string, updates: Partial<Prop>) => Promise<void>;
  deleteProp: (id: string) => Promise<void>;
  linkPropToPerformance: (propId: string, performanceId: string) => Promise<void>;

  // Show flow actions
  updateShowFlow: (entries: ShowFlow['entries']) => Promise<void>;

  // Task actions
  updateTask: (id: string, updates: Partial<TaskBlock>) => Promise<void>;

  // Search
  search: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  executeCommand: (cmd: Command) => void;

  // Save helpers
  flushSaves: () => Promise<void>;
  scheduleSave: (key: string, saveFn: () => Promise<void>, immediate?: boolean) => void;
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useCanvasStore = create<CanvasState>((set, get) => ({
  viewport: { x: 0, y: 0, scale: 1 },
  projectId: null,
  canvasObjects: {},
  performances: {},
  performers: {},
  props: {},
  showFlow: null,
  tasks: {},
  selectedIds: [],
  highlightedIds: [],
  syncStatus: 'saved',
  pendingSaves: new Map(),
  undoStack: [],
  redoStack: [],
  searchResults: [],

  setViewport: (v) =>
    set((s) => ({ viewport: { ...s.viewport, ...v } })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  setHighlightedIds: (ids) => set({ highlightedIds: ids }),

  loadProject: async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      const d = res.data;

      const canvasObjects: Record<string, CanvasObject> = {};
      for (const co of d.canvasObjects) canvasObjects[co._id] = co;

      const performances: Record<string, Performance> = {};
      for (const p of d.performances) performances[p._id] = p;

      const performers: Record<string, Performer> = {};
      for (const p of d.performers) performers[p._id] = p;

      const props: Record<string, Prop> = {};
      for (const p of d.props) props[p._id] = p;

      const tasks: Record<string, TaskBlock> = {};
      for (const t of d.tasks) tasks[t._id] = t;

      set({
        projectId,
        canvasObjects,
        performances,
        performers,
        props,
        showFlow: d.showFlow || null,
        tasks,
        syncStatus: 'saved',
        undoStack: [],
        redoStack: [],
        selectedIds: [],
        highlightedIds: [],
      });
    } catch (err) {
      console.error('Failed to load project:', err);
      throw err;
    }
  },

  reset: () =>
    set({
      projectId: null,
      canvasObjects: {},
      performances: {},
      performers: {},
      props: {},
      showFlow: null,
      tasks: {},
      selectedIds: [],
      highlightedIds: [],
      syncStatus: 'saved',
      undoStack: [],
      redoStack: [],
      searchResults: [],
    }),

  moveObject: (id, position) => {
    const prev = get().canvasObjects[id]?.position;
    set((s) => ({
      canvasObjects: {
        ...s.canvasObjects,
        [id]: { ...s.canvasObjects[id], position },
      },
    }));

    get().scheduleSave(`move-${id}`, async () => {
      await api.patch(`/projects/${get().projectId}/canvas-objects/${id}`, { position });
    });

    // Push undo command
    if (prev) {
      const undoPos = { ...prev };
      const redoPos = { ...position };
      get().executeCommand({
        execute: () => {
          set((s) => ({
            canvasObjects: {
              ...s.canvasObjects,
              [id]: { ...s.canvasObjects[id], position: redoPos },
            },
          }));
        },
        undo: () => {
          set((s) => ({
            canvasObjects: {
              ...s.canvasObjects,
              [id]: { ...s.canvasObjects[id], position: undoPos },
            },
          }));
          get().scheduleSave(`move-${id}`, async () => {
            await api.patch(`/projects/${get().projectId}/canvas-objects/${id}`, { position: undoPos });
          });
        },
      });
    }
  },

  toggleCollapsed: (id) => {
    const obj = get().canvasObjects[id];
    if (!obj) return;
    const collapsed = !obj.collapsed;
    set((s) => ({
      canvasObjects: { ...s.canvasObjects, [id]: { ...s.canvasObjects[id], collapsed } },
    }));
    get().scheduleSave(`collapse-${id}`, async () => {
      await api.patch(`/projects/${get().projectId}/canvas-objects/${id}`, { collapsed });
    }, true);
  },

  deleteCanvasObject: async (id) => {
    const obj = get().canvasObjects[id];
    if (!obj) return;
    set((s) => {
      const { [id]: _, ...rest } = s.canvasObjects;
      return { canvasObjects: rest };
    });
    try {
      await api.delete(`/projects/${get().projectId}/canvas-objects/${id}`);
    } catch (err) {
      console.error('Failed to delete canvas object:', err);
    }
  },

  createCanvasObject: async (type, position) => {
    const projectId = get().projectId;
    if (!projectId) return;
    try {
      const res = await api.post(`/projects/${projectId}/canvas-objects`, {
        type,
        position: position || { x: 200, y: 200 },
      });
      const { canvasObject, entity } = res.data;
      set((s) => ({
        canvasObjects: { ...s.canvasObjects, [canvasObject._id]: canvasObject },
        ...(type === 'performance' && { performances: { ...s.performances, [entity._id]: entity } }),
        ...(type === 'task' && { tasks: { ...s.tasks, [entity._id]: entity } }),
        ...(type === 'show_flow' && { showFlow: entity }),
      }));
    } catch (err) {
      console.error('Failed to create canvas object:', err);
    }
  },

  updatePerformance: async (id, updates) => {
    set((s) => ({
      performances: { ...s.performances, [id]: { ...s.performances[id], ...updates } },
    }));
    get().scheduleSave(`perf-${id}`, async () => {
      await api.patch(`/projects/${get().projectId}/performances/${id}`, updates);
    }, true);
  },

  addPerformer: async (data) => {
    const projectId = get().projectId;
    if (!projectId) return;
    const res = await api.post(`/projects/${projectId}/performers`, data);
    set((s) => ({
      performers: { ...s.performers, [res.data.performer._id]: res.data.performer },
    }));
  },

  updatePerformer: async (id, updates) => {
    set((s) => ({
      performers: { ...s.performers, [id]: { ...s.performers[id], ...updates } },
    }));
    get().scheduleSave(`performer-${id}`, async () => {
      await api.patch(`/projects/${get().projectId}/performers/${id}`, updates);
    }, true);
  },

  deletePerformer: async (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.performers;
      // Remove from all performances
      const performances = { ...s.performances };
      for (const key in performances) {
        const p = performances[key];
        if (p.performer_ids.includes(id)) {
          performances[key] = { ...p, performer_ids: p.performer_ids.filter((pid) => pid !== id) };
        }
      }
      return { performers: rest, performances };
    });
    await api.delete(`/projects/${get().projectId}/performers/${id}`);
  },

  assignPerformer: async (performerId, performanceId) => {
    set((s) => {
      const perf = s.performances[performanceId];
      if (!perf || perf.performer_ids.includes(performerId)) return s;
      return {
        performances: {
          ...s.performances,
          [performanceId]: { ...perf, performer_ids: [...perf.performer_ids, performerId] },
        },
      };
    });
    const perf = get().performances[performanceId];
    await api.patch(`/projects/${get().projectId}/performances/${performanceId}`, {
      performer_ids: perf.performer_ids,
    });
  },

  unassignPerformer: async (performerId, performanceId) => {
    set((s) => {
      const perf = s.performances[performanceId];
      if (!perf) return s;
      return {
        performances: {
          ...s.performances,
          [performanceId]: { ...perf, performer_ids: perf.performer_ids.filter((id) => id !== performerId) },
        },
      };
    });
    const perf = get().performances[performanceId];
    await api.patch(`/projects/${get().projectId}/performances/${performanceId}`, {
      performer_ids: perf.performer_ids,
    });
  },

  addProp: async (data) => {
    const projectId = get().projectId;
    if (!projectId) return;
    const res = await api.post(`/projects/${projectId}/props`, data);
    set((s) => ({
      props: { ...s.props, [res.data.prop._id]: res.data.prop },
    }));
  },

  updateProp: async (id, updates) => {
    set((s) => ({
      props: { ...s.props, [id]: { ...s.props[id], ...updates } },
    }));
    get().scheduleSave(`prop-${id}`, async () => {
      await api.patch(`/projects/${get().projectId}/props/${id}`, updates);
    }, true);
  },

  deleteProp: async (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.props;
      const performances = { ...s.performances };
      for (const key in performances) {
        const p = performances[key];
        if (p.prop_ids.includes(id)) {
          performances[key] = { ...p, prop_ids: p.prop_ids.filter((pid) => pid !== id) };
        }
      }
      return { props: rest, performances };
    });
    await api.delete(`/projects/${get().projectId}/props/${id}`);
  },

  linkPropToPerformance: async (propId, performanceId) => {
    set((s) => {
      const prop = s.props[propId];
      const perf = s.performances[performanceId];
      if (!prop || !perf) return s;
      const newProp = prop.performance_ids.includes(performanceId)
        ? prop
        : { ...prop, performance_ids: [...prop.performance_ids, performanceId] };
      const newPerf = perf.prop_ids.includes(propId)
        ? perf
        : { ...perf, prop_ids: [...perf.prop_ids, propId] };
      return {
        props: { ...s.props, [propId]: newProp },
        performances: { ...s.performances, [performanceId]: newPerf },
      };
    });
    const prop = get().props[propId];
    const perf = get().performances[performanceId];
    await Promise.all([
      api.patch(`/projects/${get().projectId}/props/${propId}`, { performance_ids: prop.performance_ids }),
      api.patch(`/projects/${get().projectId}/performances/${performanceId}`, { prop_ids: perf.prop_ids }),
    ]);
  },

  updateShowFlow: async (entries) => {
    set((s) => ({
      showFlow: s.showFlow ? { ...s.showFlow, entries } : null,
    }));
    await api.put(`/projects/${get().projectId}/showflow`, { entries });
  },

  updateTask: async (id, updates) => {
    set((s) => ({
      tasks: { ...s.tasks, [id]: { ...s.tasks[id], ...updates } },
    }));
    get().scheduleSave(`task-${id}`, async () => {
      await api.patch(`/projects/${get().projectId}/tasks/${id}`, updates);
    }, true);
  },

  search: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    try {
      const res = await api.get(`/projects/${get().projectId}/search`, { params: { q: query } });
      set({ searchResults: res.data.results });
    } catch {
      set({ searchResults: [] });
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  executeCommand: (cmd) => {
    set((s) => {
      const stack = [...s.undoStack, cmd];
      if (stack.length > 50) stack.shift();
      return { undoStack: stack, redoStack: [] };
    });
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const cmd = undoStack[undoStack.length - 1];
    cmd.undo();
    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, cmd],
    }));
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    const cmd = redoStack[redoStack.length - 1];
    cmd.execute();
    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [...s.undoStack, cmd],
    }));
  },

  scheduleSave: (key, saveFn, immediate = false) => {
    const existing = debounceTimers.get(key);
    if (existing) clearTimeout(existing);

    set({ syncStatus: 'saving' });
    get().pendingSaves.set(key, saveFn);

    const delay = immediate ? 0 : 1000;
    const timer = setTimeout(async () => {
      try {
        await saveFn();
        get().pendingSaves.delete(key);
        debounceTimers.delete(key);
        if (get().pendingSaves.size === 0) {
          set({ syncStatus: 'saved' });
        }
      } catch {
        set({ syncStatus: 'error' });
      }
    }, delay);

    debounceTimers.set(key, timer);
  },

  flushSaves: async () => {
    const saves = Array.from(get().pendingSaves.values());
    for (const [key, timer] of debounceTimers.entries()) {
      clearTimeout(timer);
      debounceTimers.delete(key);
    }
    try {
      await Promise.all(saves.map((fn) => fn()));
      get().pendingSaves.clear();
      set({ syncStatus: 'saved' });
    } catch {
      set({ syncStatus: 'error' });
    }
  },
}));

// Flush pending saves on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const { pendingSaves } = useCanvasStore.getState();
    if (pendingSaves.size > 0) {
      for (const fn of pendingSaves.values()) {
        try {
          // Use sendBeacon or synchronous XHR as last resort
          fn();
        } catch {
          // best effort
        }
      }
    }
  });
}
