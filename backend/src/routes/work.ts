/// <reference path="../types/express.d.ts" />
import { Router } from 'express';
import { workService } from '../services/workService';
import { plagiarismService } from '../services/plagiarismService';
import { authMiddleware } from '../middleware/auth';

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
    const plagiarismResult = await plagiarismService.checkPlagiarism(content);
    
    if (plagiarismResult.isPlagiarized) {
      return res.status(400).json({ 
        error: 'Plagiarism detected', 
        details: plagiarismResult.details,
        score: plagiarismResult.score
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
