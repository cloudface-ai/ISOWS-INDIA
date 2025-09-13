import mammoth from 'mammoth';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported. Only .txt and .docx files are allowed.`));
    }
  }
});

export const fileService = {
  async extractTextFromFile(filePath: string, fileType: string): Promise<string> {
    try {
      switch (fileType.toLowerCase()) {
        case '.txt':
          return await this.extractFromTxt(filePath);
        case '.docx':
          return await this.extractFromDocx(filePath);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error(`Failed to extract text from ${fileType} file`);
    }
  },

  async extractFromTxt(filePath: string): Promise<string> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content.trim();
    } catch (error) {
      throw new Error('Failed to read .txt file');
    }
  },

  async extractFromDocx(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    } catch (error) {
      throw new Error('Failed to extract text from .docx file');
    }
  },

  async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  },

  getFileType(fileName: string): string {
    return path.extname(fileName).toLowerCase();
  },

  validateFileSize(file: Express.Multer.File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  },

  validateFileType(fileName: string): boolean {
    const allowedTypes = ['.txt', '.docx'];
    const ext = path.extname(fileName).toLowerCase();
    return allowedTypes.includes(ext);
  }
};
