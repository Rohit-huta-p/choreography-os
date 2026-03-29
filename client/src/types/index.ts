export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  _id: string;
  user_id: string;
  title: string;
  event_date?: string;
  template_source?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasObject {
  _id: string;
  project_id: string;
  type: 'performance' | 'roster' | 'props_board' | 'show_flow' | 'task';
  position: Position;
  size: Size;
  z_index: number;
  collapsed: boolean;
  reference_id: string;
}

export type PerformanceStatus = 'NOT_STARTED' | 'TEACHING' | 'ALMOST_DONE' | 'DONE';

export interface Song {
  name: string;
  artist?: string;
  duration_seconds?: number;
}

export interface Performance {
  _id: string;
  project_id: string;
  title: string;
  songs: Song[];
  status: PerformanceStatus;
  notes?: string;
  performer_ids: string[];
  prop_ids: string[];
  color_tag?: string;
  created_at: string;
  updated_at: string;
}

export interface Performer {
  _id: string;
  project_id: string;
  name: string;
  role?: string;
  contact?: string;
  notes?: string;
}

export type PropStatus = 'PENDING' | 'ACQUIRED';

export interface Prop {
  _id: string;
  project_id: string;
  name: string;
  quantity: number;
  status: PropStatus;
  performance_ids: string[];
}

export interface ShowFlowEntry {
  performance_id: string;
  duration_minutes: number;
  transition_notes?: string;
  order: number;
}

export interface ShowFlow {
  _id: string;
  project_id: string;
  entries: ShowFlowEntry[];
}

export interface TaskItem {
  text: string;
  completed: boolean;
  order: number;
}

export interface TaskBlock {
  _id: string;
  project_id: string;
  title: string;
  tasks: TaskItem[];
}

export interface SearchResult {
  type: 'performance' | 'performer' | 'prop' | 'task';
  id: string;
  title: string;
  canvasObjectId?: string;
  position?: Position;
}

export const STATUS_COLORS: Record<PerformanceStatus, string> = {
  NOT_STARTED: '#9CA3AF',
  TEACHING: '#FBBF24',
  ALMOST_DONE: '#FB923C',
  DONE: '#34D399',
};

export const STATUS_BG: Record<PerformanceStatus, string> = {
  NOT_STARTED: '#F3F4F6',
  TEACHING: '#FEF3C7',
  ALMOST_DONE: '#FED7AA',
  DONE: '#D1FAE5',
};
