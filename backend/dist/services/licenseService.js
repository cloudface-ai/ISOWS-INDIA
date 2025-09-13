"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.licenseService = void 0;
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const workService_1 = require("./workService");
const emailService_1 = require("./emailService");
// JSON persistence (dev)
const DATA_DIR = path_1.default.join(__dirname, '..', '..', 'data');
const LICENSES_FILE = path_1.default.join(DATA_DIR, 'licenses.json');
function ensureDataDir() {
    try {
        fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
    }
    catch { }
}
function loadLicenses() {
    try {
        const raw = fs_1.default.readFileSync(LICENSES_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed.map((l) => ({
            ...l,
            issuedAt: new Date(l.issuedAt)
        }));
    }
    catch {
        return [];
    }
}
function saveLicenses(items) {
    ensureDataDir();
    fs_1.default.writeFileSync(LICENSES_FILE, JSON.stringify(items, null, 2), 'utf-8');
}
// Load at startup
let licenses = loadLicenses();
exports.licenseService = {
    async generateLicense(workId, userId, userEmail, details) {
        // Check if work exists and belongs to user
        const work = await workService_1.workService.getWork(workId, userId);
        if (!work) {
            throw new Error('Work not found or access denied');
        }
        // Check if work already has a license
        const existingLicense = licenses.find(l => l.workId === workId);
        if (existingLicense) {
            return existingLicense;
        }
        // Create new license
        const license = {
            id: (0, uuid_1.v4)(),
            workId,
            userId,
            issuedAt: new Date(),
            isActive: true,
            ...(details || {})
        };
        licenses.push(license);
        saveLicenses(licenses);
        // Update work to mark as licensed
        await workService_1.workService.updateWork(workId, {
            isLicensed: true,
            licenseId: license.id
        });
        // Send email notification
        try {
            await emailService_1.emailService.sendLicenseGeneratedNotification(userEmail, work.title, license);
        }
        catch (error) {
            console.error('Failed to send license notification email:', error);
            // Don't fail license generation if email fails
        }
        return license;
    },
    async getUserLicenses(userId) {
        return licenses.filter(license => license.userId === userId);
    },
    async verifyLicense(licenseId) {
        return licenses.find(license => license.id === licenseId) || null;
    },
    async updateLicenseUrl(licenseId, downloadUrl) {
        const idx = licenses.findIndex(l => l.id === licenseId);
        if (idx === -1)
            return null;
        licenses[idx] = { ...licenses[idx], downloadUrl };
        saveLicenses(licenses);
        return licenses[idx];
    }
};
//# sourceMappingURL=licenseService.js.map