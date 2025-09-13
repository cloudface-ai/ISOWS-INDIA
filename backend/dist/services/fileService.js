"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileService = exports.upload = void 0;
const mammoth_1 = __importDefault(require("mammoth"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads');
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.txt', '.docx'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${ext} not supported. Only .txt and .docx files are allowed.`));
        }
    }
});
exports.fileService = {
    async extractTextFromFile(filePath, fileType) {
        try {
            switch (fileType.toLowerCase()) {
                case '.txt':
                    return await this.extractFromTxt(filePath);
                case '.docx':
                    return await this.extractFromDocx(filePath);
                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }
        }
        catch (error) {
            console.error('Error extracting text from file:', error);
            throw new Error(`Failed to extract text from ${fileType} file`);
        }
    },
    async extractFromTxt(filePath) {
        try {
            const content = fs_1.default.readFileSync(filePath, 'utf-8');
            return content.trim();
        }
        catch (error) {
            throw new Error('Failed to read .txt file');
        }
    },
    async extractFromDocx(filePath) {
        try {
            const result = await mammoth_1.default.extractRawText({ path: filePath });
            return result.value.trim();
        }
        catch (error) {
            throw new Error('Failed to extract text from .docx file');
        }
    },
    async cleanupFile(filePath) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (error) {
            console.error('Error cleaning up file:', error);
        }
    },
    getFileType(fileName) {
        return path_1.default.extname(fileName).toLowerCase();
    },
    validateFileSize(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        return file.size <= maxSize;
    },
    validateFileType(fileName) {
        const allowedTypes = ['.txt', '.docx'];
        const ext = path_1.default.extname(fileName).toLowerCase();
        return allowedTypes.includes(ext);
    }
};
//# sourceMappingURL=fileService.js.map