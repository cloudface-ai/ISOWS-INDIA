import { v4 as uuidv4 } from 'uuid';
import { Work, WorkRevision } from '../types';
import fs from 'fs';
import path from 'path';

// JSON persistence (dev)
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const WORKS_FILE = path.join(DATA_DIR, 'works.json');
const REVISIONS_FILE = path.join(DATA_DIR, 'work_revisions.json');

function ensureDataDir() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function loadWorks(): Work[] {
  try {
    const raw = fs.readFileSync(WORKS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.map((w: any) => ({
      ...w,
      submittedAt: new Date(w.submittedAt)
    })) as Work[];
  } catch {
    return [];
  }
}

function saveWorks(items: Work[]) {
  ensureDataDir();
  fs.writeFileSync(WORKS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

function loadRevisions(): WorkRevision[] {
  try {
    const raw = fs.readFileSync(REVISIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.map((r: any) => ({ ...r, updatedAt: new Date(r.updatedAt) })) as WorkRevision[];
  } catch { return []; }
}

function saveRevisions(items: WorkRevision[]) {
  ensureDataDir();
  fs.writeFileSync(REVISIONS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

// Load at startup
let works: Work[] = loadWorks();
let revisions: WorkRevision[] = loadRevisions();

export const workService = {
  async createWork(workData: Omit<Work, 'id' | 'submittedAt' | 'isLicensed'>): Promise<Work> {
    const work: Work = {
      id: uuidv4(),
      ...workData,
      submittedAt: new Date(),
      isLicensed: false
    };
    
    works.push(work);
    saveWorks(works);
    return work;
  },

  async getUserWorks(userId: string): Promise<Work[]> {
    return works.filter(work => work.userId === userId);
  },

  async getWork(workId: string, userId: string): Promise<Work | null> {
    const work = works.find(w => w.id === workId && w.userId === userId);
    return work || null;
  },

  async updateWork(workId: string, updates: Partial<Work>): Promise<Work | null> {
    const workIndex = works.findIndex(w => w.id === workId);
    if (workIndex === -1) return null;
    
    const before = works[workIndex];
    const after = { ...before, ...updates } as Work;
    works[workIndex] = after;
    saveWorks(works);
    // record revision
    revisions.push({
      id: uuidv4(),
      workId: workId,
      userId: after.userId,
      title: after.title,
      content: after.content,
      updatedAt: new Date()
    });
    saveRevisions(revisions);
    return works[workIndex];
  },

  async getRevisions(workId: string, userId: string): Promise<WorkRevision[]> {
    return revisions.filter(r => r.workId === workId && r.userId === userId).sort((a,b) => a.updatedAt.getTime() - b.updatedAt.getTime());
  }
};
