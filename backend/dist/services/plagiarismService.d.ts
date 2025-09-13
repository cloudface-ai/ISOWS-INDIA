import { PlagiarismResult } from '../types';
export declare const plagiarismService: {
    checkPlagiarism(content: string, currentUserId?: string): Promise<PlagiarismResult>;
    checkPlagiarismWithNotification(content: string, workId: string, userId: string, userEmail: string, workTitle: string): Promise<PlagiarismResult>;
};
//# sourceMappingURL=plagiarismService.d.ts.map