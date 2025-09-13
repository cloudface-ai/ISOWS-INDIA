import multer from 'multer';
export declare const upload: multer.Multer;
export declare const fileService: {
    extractTextFromFile(filePath: string, fileType: string): Promise<string>;
    extractFromTxt(filePath: string): Promise<string>;
    extractFromDocx(filePath: string): Promise<string>;
    cleanupFile(filePath: string): Promise<void>;
    getFileType(fileName: string): string;
    validateFileSize(file: Express.Multer.File): boolean;
    validateFileType(fileName: string): boolean;
};
//# sourceMappingURL=fileService.d.ts.map