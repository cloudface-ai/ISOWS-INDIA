"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workRoutes = void 0;
/// <reference path="../types/express.d.ts" />
const express_1 = require("express");
const workService_1 = require("../services/workService");
const plagiarismService_1 = require("../services/plagiarismService");
const auth_1 = require("../middleware/auth");
const fileService_1 = require("../services/fileService");
const router = (0, express_1.Router)();
exports.workRoutes = router;
// Submit new work
router.post('/submit', auth_1.authMiddleware, async (req, res) => {
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
        const plagiarismResult = await plagiarismService_1.plagiarismService.checkPlagiarism(content, userId);
        if (plagiarismResult.isPlagiarized) {
            return res.status(400).json({
                error: 'Plagiarism detected',
                details: plagiarismResult.details,
                score: plagiarismResult.score,
                matches: plagiarismResult.matches
            });
        }
        // Create work
        const work = await workService_1.workService.createWork({
            userId: userId,
            title,
            content,
            plagiarismScore: plagiarismResult.score
        });
        res.json({ work, plagiarismResult });
    }
    catch (error) {
        console.error('Work submission error:', error);
        res.status(500).json({ error: 'Failed to submit work' });
    }
});
// Get user's works
router.get('/my-works', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.uid;
        const works = await workService_1.workService.getUserWorks(userId);
        res.json({ works });
    }
    catch (error) {
        console.error('Get works error:', error);
        res.status(500).json({ error: 'Failed to fetch works' });
    }
});
// Get specific work
router.get('/:workId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { workId } = req.params;
        const userId = req.user?.uid;
        const work = await workService_1.workService.getWork(workId, userId);
        if (!work) {
            return res.status(404).json({ error: 'Work not found' });
        }
        res.json({ work });
    }
    catch (error) {
        console.error('Get work error:', error);
        res.status(500).json({ error: 'Failed to fetch work' });
    }
});
// Submit work via file upload
router.post('/submit-file', auth_1.authMiddleware, fileService_1.upload.single('file'), async (req, res) => {
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
        if (!fileService_1.fileService.validateFileType(file.originalname)) {
            return res.status(400).json({
                error: 'Invalid file type. Only .txt and .docx files are supported.'
            });
        }
        if (!fileService_1.fileService.validateFileSize(file)) {
            return res.status(400).json({
                error: 'File too large. Maximum size is 10MB.'
            });
        }
        // Extract text from file
        const fileType = fileService_1.fileService.getFileType(file.originalname);
        const content = await fileService_1.fileService.extractTextFromFile(file.path, fileType);
        // Clean up uploaded file
        await fileService_1.fileService.cleanupFile(file.path);
        if (content.length < 50) {
            return res.status(400).json({
                error: 'Content must be at least 50 characters long'
            });
        }
        // Check for plagiarism
        const plagiarismResult = await plagiarismService_1.plagiarismService.checkPlagiarism(content, userId);
        if (plagiarismResult.isPlagiarized) {
            return res.status(400).json({
                error: 'Plagiarism detected',
                details: plagiarismResult.details,
                score: plagiarismResult.score,
                matches: plagiarismResult.matches
            });
        }
        // Create work
        const work = await workService_1.workService.createWork({
            userId: userId,
            title,
            content,
            plagiarismScore: plagiarismResult.score
        });
        res.json({ work, plagiarismResult });
    }
    catch (error) {
        console.error('File submission error:', error);
        // Clean up file if it exists
        if (req.file) {
            await fileService_1.fileService.cleanupFile(req.file.path);
        }
        res.status(500).json({ error: 'Failed to submit work from file' });
    }
});
// Edit work content/title
router.put('/edit/:workId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { workId } = req.params;
        const userId = req.user?.uid;
        const { title, content } = req.body;
        if (!title && !content)
            return res.status(400).json({ error: 'Nothing to update' });
        const updated = await workService_1.workService.updateWork(workId, { ...(title ? { title } : {}), ...(content ? { content } : {}) });
        if (!updated || updated.userId !== userId)
            return res.status(404).json({ error: 'Work not found' });
        res.json({ work: updated });
    }
    catch (e) {
        console.error('Edit work error:', e);
        res.status(500).json({ error: 'Failed to edit work' });
    }
});
// Get work revisions
router.get('/revisions/:workId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { workId } = req.params;
        const userId = req.user?.uid;
        const items = await workService_1.workService.getRevisions(workId, userId);
        res.json({ revisions: items });
    }
    catch (e) {
        console.error('Get revisions error:', e);
        res.status(500).json({ error: 'Failed to get revisions' });
    }
});
// Check plagiarism for a specific work
router.get('/plagiarism/:workId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { workId } = req.params;
        const userId = req.user?.uid;
        const work = await workService_1.workService.getWork(workId, userId);
        if (!work) {
            return res.status(404).json({ error: 'Work not found' });
        }
        const userEmail = req.user?.email || 'user@example.com';
        const plagiarismResult = await plagiarismService_1.plagiarismService.checkPlagiarismWithNotification(work.content, workId, userId, userEmail, work.title);
        res.json(plagiarismResult);
    }
    catch (error) {
        console.error('Plagiarism check error:', error);
        res.status(500).json({ error: 'Failed to check plagiarism' });
    }
});
//# sourceMappingURL=work.js.map