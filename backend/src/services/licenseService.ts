import { v4 as uuidv4 } from 'uuid';
import { License } from '../types';
import fs from 'fs';
import path from 'path';
import { workService } from './workService';
import { emailService } from './emailService';

// JSON persistence (dev)
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');

function ensureDataDir() {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function loadLicenses(): License[] {
  try {
    const raw = fs.readFileSync(LICENSES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.map((l: any) => ({
      ...l,
      issuedAt: new Date(l.issuedAt)
    })) as License[];
  } catch {
    return [];
  }
}

function saveLicenses(items: License[]) {
  ensureDataDir();
  fs.writeFileSync(LICENSES_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

// Load at startup
let licenses: License[] = loadLicenses();

export const licenseService = {
  async generateLicense(
    workId: string,
    userId: string,
    userEmail: string,
    details?: Partial<Pick<License, 'authorName' | 'dob' | 'address' | 'mobile' | 'workType'>>
  ): Promise<License> {
    // Check if work exists and belongs to user
    const work = await workService.getWork(workId, userId);
    if (!work) {
      throw new Error('Work not found or access denied');
    }
    
    // Check if work already has a license
    const existingLicense = licenses.find(l => l.workId === workId);
    if (existingLicense) {
      return existingLicense;
    }
    
    // Create new license
    const license: License = {
      id: uuidv4(),
      workId,
      userId,
      issuedAt: new Date(),
      isActive: true,
      ...(details || {})
    };
    
    licenses.push(license);
    saveLicenses(licenses);
    
    // Update work to mark as licensed
    await workService.updateWork(workId, { 
      isLicensed: true, 
      licenseId: license.id 
    });
    
    // Send email notification
    try {
      await emailService.sendLicenseGeneratedNotification(
        userEmail,
        work.title,
        license
      );
    } catch (error) {
      console.error('Failed to send license notification email:', error);
      // Don't fail license generation if email fails
    }
    
    return license;
  },

  async getUserLicenses(userId: string): Promise<License[]> {
    return licenses.filter(license => license.userId === userId);
  },

  async verifyLicense(licenseId: string): Promise<License | null> {
    return licenses.find(license => license.id === licenseId) || null;
  },

  async updateLicenseUrl(licenseId: string, downloadUrl: string): Promise<License | null> {
    const idx = licenses.findIndex(l => l.id === licenseId);
    if (idx === -1) return null;
    licenses[idx] = { ...licenses[idx], downloadUrl };
    saveLicenses(licenses);
    return licenses[idx];
  }
};
