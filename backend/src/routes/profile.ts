import express from 'express';
import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

// Try to import canvas, fallback if not available
let createCanvas: any, loadImage: any;
try {
  const canvas = require('canvas');
  createCanvas = canvas.createCanvas;
  loadImage = canvas.loadImage;
} catch (error) {
  console.log('Canvas not available, using fallback');
  createCanvas = null;
  loadImage = null;
}

const router = express.Router();

interface IDCardData {
  uid: string;
  displayName: string;
  email: string;
  joinDate: string;
  photoURL?: string;
}

// Generate ID Card PNG
router.post('/generate-id-card', async (req: Request, res: Response) => {
  try {
    const { uid, displayName, email, joinDate, photoURL }: IDCardData = req.body;

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

    // Header text with better typography and proper spacing
    ctx.fillStyle = 'white';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('ISOWS-INDIA', 40, 35);

    ctx.font = '13px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Indian Society of Writers and Screenwriters', 40, 55);
    
    ctx.font = '9px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText('Regi. Add: Plot No 64, Sector 44, Gurgaon, 1220003, India', 40, 70);

    // Member ID Card title with better styling and spacing
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('MEMBER ID CARD', 40, 130);
    
    // Add a subtle line under the title
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 140);
    ctx.lineTo(320, 140);
    ctx.stroke();

    // User details with better formatting and proper spacing to prevent overlap
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`Name:`, 40, 175);
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px Arial';
    ctx.fillText(displayName, 100, 175);
    
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`Email:`, 40, 205);
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px Arial';
    ctx.fillText(email, 100, 205);
    
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`User ID:`, 40, 235);
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px Arial';
    ctx.fillText(uid, 100, 235);
    
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 15px Arial';
    ctx.fillText(`Member Since:`, 40, 265);
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px Arial';
    ctx.fillText(new Date(joinDate).toLocaleDateString('en-IN'), 140, 265);

    // Profile photo section with better styling and proper spacing to avoid overlap
    const photoX = 470;
    const photoY = 110;
    const photoRadius = 35;
    
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
      } catch (error) {
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
    } else {
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

    // Add a subtle divider line with proper spacing to avoid overlap
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 285);
    ctx.lineTo(560, 285);
    ctx.stroke();

    // Footer with better styling and proper spacing to avoid overlap
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('This is an official Indian Society of Writers and Screenwriters member identification card', 40, 310);

    // Computer generated text with better positioning and spacing to avoid overlap
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'italic 9px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Computer Generated - No Sign or Seal Required', 560, 385);

    // Enhanced border with rounded corners effect and proper spacing
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 580, 380);

    // Convert canvas to PNG buffer
    const buffer = canvas.toBuffer('image/png');

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="ISOWS-Profile-${uid}.png"`);
    res.send(buffer);

  } catch (error) {
    console.error('Error generating ID card:', error);
    res.status(500).json({ error: 'Failed to generate ID card' });
  }
});

// Get user profile
router.get('/', async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/', async (req: Request, res: Response) => {
  try {
    const { displayName, email } = req.body;

    // In real app, this would update the database
    const updatedProfile = {
      displayName,
      email,
      updatedAt: new Date().toISOString()
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
