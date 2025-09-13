import { Work, WorkRevision } from '../types';
export declare const workService: {
    createWork(workData: Omit<Work, "id" | "submittedAt" | "isLicensed">): Promise<Work>;
    getUserWorks(userId: string): Promise<Work[]>;
    getWork(workId: string, userId: string): Promise<Work | null>;
    updateWork(workId: string, updates: Partial<Work>): Promise<Work | null>;
    getRevisions(workId: string, userId: string): Promise<WorkRevision[]>;
    getAllWorks(): Promise<Work[]>;
};
//# sourceMappingURL=workService.d.ts.map