# PhD Dashboard

[**Live Demo (PWA)**](https://vmullapudi1.github.io/tasktracker/)

A local-first productivity application designed specifically for researchers and PhD students. It provides a centralized hub for managing research projects, time-tracking via a calendar, maintaining a reading list, and tracking tasks through a Kanban board.

## Key Features

- **Dashboard**: High-level overview of progress, time spent, and upcoming tasks.
- **Calendar & Time-Blocking**: Visual schedule management with the ability to drag todos directly onto the calendar.
- **Project Management**: Structured tracking of research projects with phases, checkpoints, and logged hours.
- **Reading List**: Bibliography management with status tracking (read/unread) and takeaway notes.
- **Kanban**: Task management with 'Todo', 'Doing', and 'Done' states.
- **Insights**: Analytics on research activity and progress.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript.
- **Build Tool**: Vite.
- **Data Management**: Replicache (used as a local, transactional KV store).
- **Storage/Sync**: File System Access API for local-first synchronization to a user-selected folder (allowing sync via OneDrive, Dropbox, etc.).
- **PWA**: Progressive Web App support via `vite-plugin-pwa`.

## Architecture: Local-First Sync

The app employs a unique local-first synchronization strategy. Instead of a traditional backend, it uses Replicache to manage local state and mutations. A `SyncController` watches for changes and flushes a snapshot of the application state to a JSON file (`phd-dashboard.json`) in a local directory chosen by the user. 

When the app starts or the file changes, it reconciles the state by replaying any 'pending' mutations that haven't been successfully flushed yet. This provides a robust, offline-capable experience without needing a specialized server, while allowing users to own their data and sync across devices using standard cloud storage (OneDrive, Dropbox, etc.).

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
