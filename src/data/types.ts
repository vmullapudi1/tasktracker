export interface Checkpoint {
  id: string;
  name: string;
  done: boolean;
}

export interface Phase {
  id: string;
  name: string;
  done: boolean;
  checkpoints: Checkpoint[];
}

export interface Update {
  id: string;
  date: string;
  text: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  active: boolean;
  paletteIdx: number;
  targetHours: number;
  hoursLogged: number;
  phases: Phase[];
  updates: Update[];
}

export interface Block {
  id: string;
  date: string;
  start: number;
  end: number;
  title: string;
  projectId: string;
  seriesId?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string;
  venue: string;
  addedAt: string;
  read: boolean;
  summary: string;
  takeaway: string;
  projectId: string;
}

export interface Todo {
  id: string;
  title: string;
  projectId?: string;
  due: string;
  done: boolean;
  scheduled: boolean;
  tags?: string[];
  status?: 'todo' | 'doing' | 'done';
  order?: number;
  priority?: 'low' | 'medium' | 'high';
}

export interface WeeklyHighlight {
  id: string; // monday date key: YYYY-MM-DD
  top3: string;
  movedForward: string;
  stalled: string;
}

export type Density = 'compact' | 'comfortable';
export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
  theme: Theme;
  accentColor: string;
  density: Density;
  showTodayRail: boolean;
  dashboardName: string;
  calendarStartHour: number;
  calendarEndHour: number;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 'monday' | 'sunday';
  hasSeenHelp: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  accentColor: '#008491',
  density: 'comfortable',
  showTodayRail: true,
  dashboardName: 'PhD Dashboard',
  calendarStartHour: 7,
  calendarEndHour: 22,
  timeFormat: '12h',
  firstDayOfWeek: 'monday',
  hasSeenHelp: false,
};

export interface AppData {
  projects: Project[];
  blocks: Block[];
  papers: Paper[];
  todos: Todo[];
  highlights: WeeklyHighlight[];
  settings: Settings;
}
