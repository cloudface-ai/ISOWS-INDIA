import { Router } from 'express';
import { licenseService } from '../services/licenseService';
import { authMiddleware } from '../middleware/auth';
import PDFDocument from 'pdfkit';
import admin from 'firebase-admin';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { workService } from '../services/workService';

const router = Router();

// Generate license for work
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { workId, authorName, dob, address, mobile, workType } = req.body;
    const userId = req.user?.uid;

    if (!workId) {
      return res.status(400).json({ error: 'Work ID is required' });
    }

    const license = await licenseService.generateLicense(workId, userId!, {
      authorName,
      dob,
      address,
      mobile,
      workType,
    });
    res.json({ license });
  } catch (error) {
    console.error('License generation error:', error);
    res.status(500).json({ error: 'Failed to generate license' });
  }
});

// Get user's licenses
router.get('/my-licenses', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.uid;
    const licenses = await licenseService.getUserLicenses(userId!);
    res.json({ licenses });
  } catch (error) {
    console.error('Get licenses error:', error);
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
});

// Verify license (public endpoint)
router.get('/verify/:licenseId', async (req, res) => {
  try {
    const { licenseId } = req.params;
    const license = await licenseService.verifyLicense(licenseId);
    
    if (!license) {
      return res.status(404).json({ error: 'License not found' });
    }
    
    res.json({ 
      license: {
        id: license.id,
        workId: license.workId,
        issuedAt: license.issuedAt,
        isActive: license.isActive
      }
    });
  } catch (error) {
    console.error('License verification error:', error);
    res.status(500).json({ error: 'Failed to verify license' });
  }
});

export { router as licenseRoutes };
// Download PDF with license and watermarked content
router.get('/download/:licenseId', authMiddleware, async (req, res) => {
  try {
    const { licenseId } = req.params;
    const userId = req.user?.uid!;

    const license = await licenseService.verifyLicense(licenseId);
    if (!license || license.userId !== userId) {
      return res.status(404).json({ error: 'License not found' });
    }

    const work = await workService.getWork(license.workId, userId);
    if (!work) {
      return res.status(404).json({ error: 'Work not found' });
    }

    // Prepare temp write stream
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'license-'));
    const tempPath = path.join(tempDir, `license_${license.id}.pdf`);
    const writeStream = fs.createWriteStream(tempPath);

    const PAGE_SIZE: any = 'A4';
    // Separate margins for first page vs content pages
    const FIRST_PAGE_MARGINS = { top: 80, bottom: 80, left: 55, right: 55 };
    const CONTENT_PAGE_MARGINS = { top: 35, bottom: 35, left: 55, right: 55 };
    const HEADER_HEIGHT = 60; // reserved header area on content pages
    const FOOTER_HEIGHT = 60; // reserved footer area on content pages

    const doc = new (PDFDocument as any)({ autoFirstPage: false });
    doc.pipe(writeStream);

    const addHeaderFooter = (doc: any) => {
      const { width, height, margins } = doc.page;
      const headerLine1 = `License #${license.id} — ${license.authorName || 'Author'}`;
      const headerLine2 = `Licensed by ISOWS-INDIA • ${new Date().toLocaleString()}`;
      const footerText = `Copyright: ${license.authorName || 'Author'} • ${license.userId}`;

      // Header (two lines)
      doc.font('Courier-Bold').fontSize(12).fillColor('#333').text(
        headerLine1,
        margins.left,
        margins.top + 15,
        { width: width - margins.left - margins.right, align: 'left', lineBreak: false }
      );
      doc.font('Courier').fontSize(10).fillColor('#555').text(
        headerLine2,
        margins.left,
        margins.top + 26,
        { width: width - margins.left - margins.right, align: 'left', lineBreak: false }
      );

      // Footer (single line) at 30px from bottom
      doc.font('Courier').fontSize(10).fillColor('#555').text(
        footerText,
        margins.left,
        height - 50,
        { width: width - margins.left - margins.right, align: 'right', lineBreak: false }
      );
    };

    const addWatermark = (doc: any) => {
      const { width, height } = doc.page;
      doc.save();
      doc.rotate(45, { origin: [width / 2, height / 2] });
      doc.font('Courier-Bold').fontSize(30).fillColor('#eeeeee').opacity(0.12);
      const waterText = `${license.authorName || 'Author'} • #${license.id}`;
      doc.text(waterText, 0, height / 2 - 36, { align: 'center', width });
      doc.restore();
      doc.opacity(1);
    };

    // Decorate every page after the first with header/footer + watermark
    let pageCount = 0;
    let isDecorating = false;
    doc.on('pageAdded', () => {
      pageCount += 1;
      // page 1: no decorations (license summary)
      if (pageCount === 1) return;
      if (isDecorating) return;
      isDecorating = true;
      addHeaderFooter(doc);
      addWatermark(doc);
      // reset content cursor inside content box
      const CONTENT_START_Y = CONTENT_PAGE_MARGINS.top + HEADER_HEIGHT + 8;
      doc.y = CONTENT_START_Y;
      doc.font('Courier').fontSize(11).fillColor('#222');
      isDecorating = false;
    });

    // Page 1: License summary (Typewriter style) — no header/footer/watermark
    doc.addPage({ size: PAGE_SIZE, margins: FIRST_PAGE_MARGINS });

    const labelFont = 'Courier';
    const valueFont = 'Courier-Bold';

    // Title
    doc.fillColor('#111').font(valueFont).fontSize(26).text('License Certificate', { align: 'center' });

    // Branding under title
    doc.moveDown(0.4);
    doc.font('Courier-Bold').fontSize(16).fillColor('#222').text('ISOWS-INDIA', { align: 'center' });
    doc.font('Courier').fontSize(10).fillColor('#555').text('Indian Society of Writers and Screenwriters', { align: 'center' });

    // Fixed-position two-column layout
    // First page layout: start at x=80, y=170 as requested
    const labelX = 80;
    const valueX = 240;
    let y = 170; // starting y position on first page
    const lineHeight = 26; // slightly larger to avoid overlap

    const drawRow = (label: string, value: string, boldValue = false) => {
      doc.font(labelFont).fontSize(14).text(label, labelX, y);
      doc.font(boldValue ? valueFont : labelFont).fontSize(14).text(value, valueX, y);
      y += lineHeight;
    };

    drawRow('License ID:', license.id);
    drawRow('User ID:', license.userId);
    drawRow('Title:', work.title, true);
    drawRow('Type:', license.workType || '-');
    drawRow('Author/Writer:', license.authorName || '-');
    drawRow('DOB:', license.dob || '-');
    drawRow('Mobile:', license.mobile || '-');
    drawRow('Address:', license.address || '-');
    y += lineHeight / 2;
    drawRow('Issued At:', new Date(license.issuedAt).toLocaleString());

    // Circular stamp (bottom of details) with arc text
    const drawArcTextCentered = (
      doc: any,
      text: string,
      cx: number,
      cy: number,
      radius: number,
      centerAngleRad: number,
      arcSpanRad: number
    ) => {
      const chars = text.split('');
      if (chars.length === 0) return;
      const start = centerAngleRad - arcSpanRad / 2;
      const step = arcSpanRad / Math.max(chars.length - 1, 1);
      for (let i = 0; i < chars.length; i++) {
        const angle = start + i * step;
        const x = cx + radius * Math.cos(angle);
        const yPos = cy + radius * Math.sin(angle);
        doc.save();
        doc.translate(x, yPos);
        doc.rotate((angle + Math.PI / 2) * 180 / Math.PI);
        doc.text(chars[i], -3, -3, { width: 6, align: 'center' });
        doc.restore();
      }
    };

    const drawStamp = (doc: any, centerX: number, centerY: number) => {
      const outer = 78; // increased radius to give arc text more room
      const inner = 62;
      doc.save();
      // rings
      doc.circle(centerX, centerY, outer).lineWidth(3).stroke('#c0392b');
      doc.circle(centerX, centerY, inner).lineWidth(1).stroke('#c0392b');
      // center text
      doc.font('Courier-Bold').fontSize(14).fillColor('#c0392b').text('LICENSED', centerX - 60, centerY - 12, { width: 120, align: 'center' });
      doc.font('Courier-Bold').fontSize(9).fillColor('#c0392b').text(`#${license.id}`, centerX - 60, centerY + 6, { width: 120, align: 'center' });
      // arc text
      doc.font('Courier-Bold').fontSize(9).fillColor('#c0392b');
      // Top center arc: center angle at -PI/2 (upwards), span ~ PI (semi-circle)
      drawArcTextCentered(doc, 'ISOWS-INDIA', centerX, centerY, outer - 8, -Math.PI / 2, Math.PI * 0.9);
      doc.font('Courier').fontSize(8);
      // Bottom center arc: center angle at +PI/2 (downwards), span ~ PI
      drawArcTextCentered(doc, 'INDIAN SOCIETY OF WRITERS AND SCREENWRITERS', centerX, centerY, outer - 8, Math.PI / 2, Math.PI * 0.9);
      doc.restore();
    };
    const stampX = doc.page.width - FIRST_PAGE_MARGINS.right - 100;
    const stampY = y + 60;
    drawStamp(doc, stampX, stampY);

    // Optional small note at bottom
    doc.font(labelFont).fontSize(11).fillColor('#444').text(
      'This certificate verifies authorship and issuance for the submitted work.',
      labelX, y + lineHeight,
      { width: doc.page.width - labelX - 70, align: 'left' }
    );

    // Content pages start on a new page with header/footer/watermark
    const rawContent = work.content || '';
    const paragraphs = rawContent
      .replace(/\r\n/g, '\n')
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const pageWidth = () => doc.page.width;
    const pageHeight = () => doc.page.height;
    const margins = () => doc.page.margins || CONTENT_PAGE_MARGINS;
    const contentWidth = () => pageWidth() - (margins().left + margins().right);
    const bottomThreshold = 10; // extra safety before footer area

    doc.addPage({ size: PAGE_SIZE, margins: CONTENT_PAGE_MARGINS });
    // Set starting Y after header area
    // For content pages (not first page), use custom content box
    const CONTENT_START_Y = CONTENT_PAGE_MARGINS.top + HEADER_HEIGHT + 8;
    const CONTENT_END_Y = doc.page.height - CONTENT_PAGE_MARGINS.bottom - FOOTER_HEIGHT - 8;
    doc.y = CONTENT_START_Y;
    doc.font('Courier-Bold').fontSize(14).fillColor('#111').text(
      'Submitted Work',
      margins().left,
      doc.y,
      {
        underline: true,
        width: contentWidth() - 10, // extra padding to prevent clipping
        align: 'left'
      }
    ).moveDown(0.75);
    doc.font('Courier').fontSize(11).fillColor('#222');

    for (const p of paragraphs) {
      // page break guard before paragraph
      if (doc.y > CONTENT_END_Y - 60) {
        doc.addPage({ size: PAGE_SIZE, margins: CONTENT_PAGE_MARGINS });
      }

      // write paragraph inside content box
      doc.text(p, margins().left, doc.y, {
        width: contentWidth() - 10,
        align: 'left',
        lineGap: 3
      });
      doc.moveDown(0.5);
    }

    doc.end();

    // wait for file write to finish
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // save locally under public and serve via /files
    const publicDir = path.join(__dirname, '..', '..', 'public', 'licenses', license.userId);
    fs.mkdirSync(publicDir, { recursive: true });
    const finalPath = path.join(publicDir, `${license.id}.pdf`);
    fs.copyFileSync(tempPath, finalPath);
    try { fs.unlinkSync(tempPath); fs.rmdirSync(tempDir); } catch {}

    const publicUrl = `/files/licenses/${license.userId}/${license.id}.pdf`;
    await licenseService.updateLicenseUrl(license.id, publicUrl);

    // stream file to client
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="license_${license.id}.pdf"`);
    fs.createReadStream(finalPath).pipe(res);
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
