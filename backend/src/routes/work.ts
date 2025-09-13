/// <reference path="../types/express.d.ts" />
import { Router } from 'express';
import { workService } from '../services/workService';
import { plagiarismService } from '../services/plagiarismService';
import { authMiddleware } from '../middleware/auth';
import { upload, fileService } from '../services/fileService';

const router = Router();

// Submit new work
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.uid;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (content.length < 50) {
      return res.status(400).json({ error: 'Content must be at least 50 characters long' });
    }

    // Check for plagiarism
    const plagiarismResult = await plagiarismService.checkPlagiarism(content, userId);
    
    if (plagiarismResult.isPlagiarized) {
      return res.status(400).json({ 
        error: 'Plagiarism detected', 
        details: plagiarismResult.details,
        score: plagiarismResult.score,
        matches: plagiarismResult.matches
      });
    }

    // Create work
    const work = await workService.createWork({
      userId: userId!,
      title,
      content,
      plagiarismScore: plagiarismResult.score
    });

    res.json({ work, plagiarismResult });
  } catch (error) {
    console.error('Work submission error:', error);
    res.status(500).json({ error: 'Failed to submit work' });
  }
});

// Get user's works
router.get('/my-works', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const works = await workService.getUserWorks(userId!);
    res.json({ works });
  } catch (error) {
    console.error('Get works error:', error);
    res.status(500).json({ error: 'Failed to fetch works' });
  }
});

// Get specific work
router.get('/:workId', authMiddleware, async (req, res) => {
  try {
    const { workId } = req.params;
    const userId = req.user?.uid;
    
    const work = await workService.getWork(workId, userId!);
    if (!work) {
      return res.status(404).json({ error: 'Work not found' });
    }
    
    res.json({ work });
  } catch (error) {
    console.error('Get work error:', error);
    res.status(500).json({ error: 'Failed to fetch work' });
  }
});

// Delete work
router.delete('/:workId', authMiddleware, async (req, res) => {
  try {
    const { workId } = req.params;
    const userId = req.user?.uid;
    
    const deleted = await workService.deleteWork(workId, userId!);
    if (!deleted) {
      return res.status(404).json({ error: 'Work not found or you do not have permission to delete it' });
    }
    
    res.json({ message: 'Work deleted successfully' });
  } catch (error) {
    console.error('Delete work error:', error);
    res.status(500).json({ error: 'Failed to delete work' });
  }
});

// Submit work via file upload
router.post('/submit-file', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user?.uid;
    const file = req.file;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Validate file type and size
    if (!fileService.validateFileType(file.originalname)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only .txt and .docx files are supported.' 
      });
    }

    if (!fileService.validateFileSize(file)) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 10MB.' 
      });
    }

    // Extract text from file
    const fileType = fileService.getFileType(file.originalname);
    const content = await fileService.extractTextFromFile(file.path, fileType);

    // Clean up uploaded file
    await fileService.cleanupFile(file.path);

    if (content.length < 50) {
      return res.status(400).json({ 
        error: 'Content must be at least 50 characters long' 
      });
    }

    // Check for plagiarism
    const plagiarismResult = await plagiarismService.checkPlagiarism(content, userId);
    
    if (plagiarismResult.isPlagiarized) {
      return res.status(400).json({ 
        error: 'Plagiarism detected', 
        details: plagiarismResult.details,
        score: plagiarismResult.score,
        matches: plagiarismResult.matches
      });
    }

    // Create work
    const work = await workService.createWork({
      userId: userId!,
      title,
      content,
      plagiarismScore: plagiarismResult.score
    });

    res.json({ work, plagiarismResult });
  } catch (error) {
    console.error('File submission error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      await fileService.cleanupFile(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to submit work from file' });
  }
});

export { router as workRoutes };

// Edit work content/title
router.put('/edit/:workId', authMiddleware, async (req, res) => {
  try {
    const { workId } = req.params;
    const userId = req.user?.uid!;
    const { title, content } = req.body;
    if (!title && !content) return res.status(400).json({ error: 'Nothing to update' });
    const updated = await workService.updateWork(workId, { ...(title ? { title } : {}), ...(content ? { content } : {}) });
    if (!updated || updated.userId !== userId) return res.status(404).json({ error: 'Work not found' });
    res.json({ work: updated });
  } catch (e) {
    console.error('Edit work error:', e);
    res.status(500).json({ error: 'Failed to edit work' });
  }
});

// Get work revisions
router.get('/revisions/:workId', authMiddleware, async (req, res) => {
  try {
    const { workId } = req.params;
    const userId = req.user?.uid!;
    const items = await workService.getRevisions(workId, userId);
    res.json({ revisions: items });
  } catch (e) {
    console.error('Get revisions error:', e);
    res.status(500).json({ error: 'Failed to get revisions' });
  }
});

// Check plagiarism for a specific work
router.get('/plagiarism/:workId', authMiddleware, async (req, res) => {
  try {
    const { workId } = req.params;
    const userId = req.user?.uid!;
    
    const work = await workService.getWork(workId, userId);
    if (!work) {
      return res.status(404).json({ error: 'Work not found' });
    }
    
    const userEmail = req.user?.email || 'user@example.com';
    const plagiarismResult = await plagiarismService.checkPlagiarismWithNotification(
      work.content, 
      workId, 
      userId, 
      userEmail, 
      work.title
    );
    res.json(plagiarismResult);
  } catch (error) {
    console.error('Plagiarism check error:', error);
    res.status(500).json({ error: 'Failed to check plagiarism' });
  }
});
