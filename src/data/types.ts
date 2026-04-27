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
  projectId: string;
  due: string;
  done: boolean;
  scheduled: boolean;
}

export type Density = 'compact' | 'comfortable';

export interface Settings {
  darkMode: boolean;
  accentHue: number;
  density: Density;
  showTodayRail: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  accentHue: 250,
  density: 'comfortable',
  showTodayRail: true,
};

export interface AppData {
  projects: Project[];
  blocks: Block[];
  papers: Paper[];
  todos: Todo[];
  settings: Settings;
}
