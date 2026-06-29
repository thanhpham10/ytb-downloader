import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'downloads.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS downloads (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    format TEXT NOT NULL,
    status TEXT NOT NULL,
    progress REAL DEFAULT 0,
    filePath TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface DownloadTask {
  id: string;
  url: string;
  title: string | null;
  format: 'mp3' | 'mp4';
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  filePath: string | null;
  createdAt: string;
}

export function createTask(id: string, url: string, format: 'mp3' | 'mp4') {
  const stmt = db.prepare('INSERT INTO downloads (id, url, format, status) VALUES (?, ?, ?, ?)');
  stmt.run(id, url, format, 'pending');
}

export function updateTask(id: string, updates: Partial<DownloadTask>) {
  const keys = Object.keys(updates);
  if (keys.length === 0) return;
  
  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  
  const stmt = db.prepare(`UPDATE downloads SET ${setClause} WHERE id = ?`);
  stmt.run(...values, id);
}

export function getTask(id: string): DownloadTask | undefined {
  const stmt = db.prepare('SELECT * FROM downloads WHERE id = ?');
  return stmt.get(id) as DownloadTask | undefined;
}

export function getAllTasks(): DownloadTask[] {
  const stmt = db.prepare('SELECT * FROM downloads ORDER BY createdAt DESC');
  return stmt.all() as DownloadTask[];
}

export default db;
