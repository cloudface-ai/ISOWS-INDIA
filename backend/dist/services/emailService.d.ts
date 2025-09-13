import { PlagiarismResult, Work, License } from '../types';
export declare const emailService: {
    sendPlagiarismAlert(userEmail: string, workTitle: string, workId: string, plagiarismResult: PlagiarismResult, similarWorks: Work[]): Promise<void>;
    sendLicenseGeneratedNotification(userEmail: string, workTitle: string, license: License): Promise<void>;
};
//# sourceMappingURL=emailService.d.ts.map