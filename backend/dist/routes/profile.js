"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Try to import canvas, fallback if not available
let createCanvas, loadImage;
try {
    const canvas = require('canvas');
    createCanvas = canvas.createCanvas;
    loadImage = canvas.loadImage;
}
catch (error) {
    console.log('Canvas not available, using fallback');
    createCanvas = null;
    loadImage = null;
}
const router = express_1.default.Router();
// Generate ID Card PNG
router.post('/generate-id-card', async (req, res) => {
    try {
        const { uid, displayName, email, joinDate, photoURL } = req.body;
        if (!uid || !displayName || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Check if canvas is available
        if (!createCanvas) {
            return res.status(500).json({ error: 'Canvas not available, please use HTML fallback' });
        }
        // Create canvas for ID card (600x400 pixels)
        // Create canvas with higher resolution for better quality
        const scale = 2; // 2x resolution for retina displays
        const canvas = createCanvas(600 * scale, 400 * scale);
        const ctx = canvas.getContext('2d');
        // Scale the context for high DPI
        ctx.scale(scale, scale);
        // Enable high-quality rendering
        ctx.textRenderingOptimization = 'optimizeQuality';
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // Background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 600, 400);
        // Header with gradient and subtle border
        const headerGradient = ctx.createLinearGradient(0, 0, 600, 90);
        headerGradient.addColorStop(0, '#4f46e5');
        headerGradient.addColorStop(0.5, '#6366f1');
        headerGradient.addColorStop(1, '#7c3aed');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, 600, 90);
        // Add subtle border to header
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 600, 90);
        // Header text with better typography
        ctx.fillStyle = 'white';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('ISOWS-INDIA', 30, 32);
        ctx.font = '13px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('Indian Society of Writers and Screenwriters', 30, 52);
        ctx.font = '9px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText('Regi. Add: Plot No 64, Sector 44, Gurgaon, 1220003, India', 30, 68);
        // Member ID Card title with better styling
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('MEMBER ID CARD', 30, 125);
        // Add a subtle line under the title
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 135);
        ctx.lineTo(300, 135);
        ctx.stroke();
        // User details with better formatting
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(`Name:`, 30, 165);
        ctx.fillStyle = '#1f2937';
        ctx.font = '14px Arial';
        ctx.fillText(displayName, 80, 165);
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(`Email:`, 30, 190);
        ctx.fillStyle = '#1f2937';
        ctx.font = '14px Arial';
        ctx.fillText(email, 80, 190);
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(`User ID:`, 30, 215);
        ctx.fillStyle = '#1f2937';
        ctx.font = '14px Arial';
        ctx.fillText(uid, 80, 215);
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(`Member Since:`, 30, 240);
        ctx.fillStyle = '#1f2937';
        ctx.font = '14px Arial';
        ctx.fillText(new Date(joinDate).toLocaleDateString('en-IN'), 120, 240);
        // Profile photo section with better styling
        const photoX = 450;
        const photoY = 100;
        const photoRadius = 45;
        if (photoURL) {
            try {
                const profileImage = await loadImage(photoURL);
                // Draw circular profile photo with high quality and border
                ctx.save();
                // Draw outer border
                ctx.fillStyle = '#4f46e5';
                ctx.beginPath();
                ctx.arc(photoX, photoY, photoRadius + 3, 0, 2 * Math.PI);
                ctx.fill();
                // Draw inner circle for photo
                ctx.beginPath();
                ctx.arc(photoX, photoY, photoRadius, 0, 2 * Math.PI);
                ctx.clip();
                // Use higher quality image rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(profileImage, photoX - photoRadius, photoY - photoRadius, photoRadius * 2, photoRadius * 2);
                ctx.restore();
            }
            catch (error) {
                console.log('Could not load profile image:', error);
                // Draw placeholder circle with border
                ctx.fillStyle = '#4f46e5';
                ctx.beginPath();
                ctx.arc(photoX, photoY, photoRadius + 3, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#e5e7eb';
                ctx.beginPath();
                ctx.arc(photoX, photoY, photoRadius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#6b7280';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Photo', photoX, photoY + 4);
            }
        }
        else {
            // Draw placeholder circle with border
            ctx.fillStyle = '#4f46e5';
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoRadius + 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#e5e7eb';
            ctx.beginPath();
            ctx.arc(photoX, photoY, photoRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#6b7280';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Photo', photoX, photoY + 4);
        }
        // Add a subtle divider line
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 280);
        ctx.lineTo(570, 280);
        ctx.stroke();
        // Computer generated text with better positioning
        ctx.fillStyle = '#9ca3af';
        ctx.font = 'italic 9px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Computer Generated - No Sign or Seal Required', 570, 370);
        // Footer with better styling
        ctx.fillStyle = '#6b7280';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('This is an official Indian Society of Writers and Screenwriters member identification card', 30, 340);
        // Enhanced border with rounded corners effect
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 3;
        ctx.strokeRect(8, 8, 584, 384);
        // Inner border
        ctx.strokeStyle = '#f3f4f6';
        ctx.lineWidth = 1;
        ctx.strokeRect(12, 12, 576, 376);
        // Convert canvas to PNG buffer
        const buffer = canvas.toBuffer('image/png');
        // Set response headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="ISOWS-Profile-${uid}.png"`);
        res.send(buffer);
    }
    catch (error) {
        console.error('Error generating ID card:', error);
        res.status(500).json({ error: 'Failed to generate ID card' });
    }
});
// Get user profile
router.get('/', async (req, res) => {
    try {
        // In real app, this would fetch from database
        const profile = {
            uid: 'mock-uid',
            email: 'user@example.com',
            displayName: 'User Name',
            joinDate: '2024-01-15',
            totalWorks: 0,
            totalLicenses: 0
        };
        res.json(profile);
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
// Update user profile
router.put('/', async (req, res) => {
    try {
        const { displayName, email } = req.body;
        // In real app, this would update the database
        const updatedProfile = {
            displayName,
            email,
            updatedAt: new Date().toISOString()
        };
        res.json(updatedProfile);
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
exports.default = router;
//# sourceMappingURL=profile.js.map