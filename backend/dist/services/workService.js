"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workService = void 0;
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// JSON persistence (dev)
const DATA_DIR = path_1.default.join(__dirname, '..', '..', 'data');
const WORKS_FILE = path_1.default.join(DATA_DIR, 'works.json');
const REVISIONS_FILE = path_1.default.join(DATA_DIR, 'work_revisions.json');
function ensureDataDir() {
    try {
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    catch { }
}
function loadWorks() {
    try {
        const raw = fs_1.default.readFileSync(WORKS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed.map((w) => ({
            ...w,
            submittedAt: new Date(w.submittedAt)
        }));
    }
    catch {
        return [];
    }
}
function saveWorks(items) {
    ensureDataDir();
    fs_1.default.writeFileSync(WORKS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}
function loadRevisions() {
    try {
        const raw = fs_1.default.readFileSync(REVISIONS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed.map((r) => ({ ...r, updatedAt: new Date(r.updatedAt) }));
    }
    catch {
        return [];
    }
}
function saveRevisions(items) {
    ensureDataDir();
    fs_1.default.writeFileSync(REVISIONS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}
// Load at startup
let works = loadWorks();
let revisions = loadRevisions();
exports.workService = {
    async createWork(workData) {
        const work = {
            id: (0, uuid_1.v4)(),
            ...workData,
            submittedAt: new Date(),
            isLicensed: false
        };
        works.push(work);
        saveWorks(works);
        return work;
    },
    async getUserWorks(userId) {
        return works.filter(work => work.userId === userId);
    },
    async getWork(workId, userId) {
        const work = works.find(w => w.id === workId && w.userId === userId);
        return work || null;
    },
    async updateWork(workId, updates) {
        const workIndex = works.findIndex(w => w.id === workId);
        if (workIndex === -1)
            return null;
        const before = works[workIndex];
        const after = { ...before, ...updates };
        works[workIndex] = after;
        saveWorks(works);
        // record revision
        revisions.push({
            id: (0, uuid_1.v4)(),
            workId: workId,
            userId: after.userId,
            title: after.title,
            content: after.content,
            updatedAt: new Date()
        });
        saveRevisions(revisions);
        return works[workIndex];
    },
    async getRevisions(workId, userId) {
        return revisions.filter(r => r.workId === workId && r.userId === userId).sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    },
    async getAllWorks() {
        return works.slice();
    }
};
//# sourceMappingURL=workService.js.map