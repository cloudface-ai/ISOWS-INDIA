import { License } from '../types';
export declare const licenseService: {
    generateLicense(workId: string, userId: string, userEmail: string, details?: Partial<Pick<License, "authorName" | "dob" | "address" | "mobile" | "workType">>): Promise<License>;
    getUserLicenses(userId: string): Promise<License[]>;
    verifyLicense(licenseId: string): Promise<License | null>;
    updateLicenseUrl(licenseId: string, downloadUrl: string): Promise<License | null>;
};
//# sourceMappingURL=licenseService.d.ts.map