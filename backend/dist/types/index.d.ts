export interface User {
    uid: string;
    email: string;
    displayName?: string;
    createdAt: Date;
}
export interface Work {
    id: string;
    userId: string;
    title: string;
    content: string;
    submittedAt: Date;
    licenseId?: string;
    isLicensed: boolean;
    plagiarismScore?: number;
    plagiarismDetails?: string;
}
export interface License {
    id: string;
    workId: string;
    userId: string;
    issuedAt: Date;
    downloadUrl?: string;
    isActive: boolean;
    authorName?: string;
    dob?: string;
    address?: string;
    mobile?: string;
    workType?: string;
}
export interface PlagiarismResult {
    isPlagiarized: boolean;
    score: number;
    details: string;
    similarWorks?: string[];
    matches?: Array<{
        workId: string;
        workTitle?: string;
        similarity: number;
        overlappingPhrases: string[];
    }>;
}
export interface WorkRevision {
    id: string;
    workId: string;
    userId: string;
    title: string;
    content: string;
    updatedAt: Date;
}
//# sourceMappingURL=index.d.ts.map