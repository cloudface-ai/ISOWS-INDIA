"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRoutes = void 0;
const express_1 = require("express");
const licenseService_1 = require("../services/licenseService");
const workService_1 = require("../services/workService");
const router = (0, express_1.Router)();
exports.publicRoutes = router;
// Public API for license verification (no authentication required)
router.get('/verify/:licenseId', async (req, res) => {
    try {
        const { licenseId } = req.params;
        if (!licenseId) {
            return res.status(400).json({
                error: 'License ID is required',
                success: false
            });
        }
        const license = await licenseService_1.licenseService.verifyLicense(licenseId);
        if (!license) {
            return res.status(404).json({
                error: 'License not found',
                success: false,
                licenseId
            });
        }
        // Get the associated work
        const work = await workService_1.workService.getWork(license.workId, license.userId);
        if (!work) {
            return res.status(404).json({
                error: 'Associated work not found',
                success: false,
                licenseId
            });
        }
        // Return public license information
        const publicLicenseInfo = {
            success: true,
            license: {
                id: license.id,
                workId: license.workId,
                issuedAt: license.issuedAt,
                isActive: license.isActive,
                authorName: license.authorName,
                workType: license.workType,
                // Don't expose sensitive user information
            },
            work: {
                id: work.id,
                title: work.title,
                // Don't expose work content for security
                submittedAt: work.submittedAt,
                isLicensed: work.isLicensed,
            },
            verification: {
                verified: true,
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'ISOWS-INDIA API v1.0'
            }
        };
        res.json(publicLicenseInfo);
    }
    catch (error) {
        console.error('Public license verification error:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});
// Public API health check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'ISOWS-INDIA Public API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Public API documentation endpoint
router.get('/docs', (req, res) => {
    res.json({
        service: 'ISOWS-INDIA Public API',
        version: '1.0.0',
        description: 'Public API for license verification and work authentication',
        endpoints: {
            'GET /api/public/verify/:licenseId': {
                description: 'Verify a license and get public work information',
                parameters: {
                    licenseId: {
                        type: 'string',
                        required: true,
                        description: 'The license ID to verify'
                    }
                },
                response: {
                    success: 'boolean',
                    license: 'object',
                    work: 'object',
                    verification: 'object'
                },
                example: {
                    url: '/api/public/verify/abc123-def456-ghi789',
                    response: {
                        success: true,
                        license: {
                            id: 'abc123-def456-ghi789',
                            workId: 'work-123',
                            issuedAt: '2024-01-15T10:30:00Z',
                            isActive: true,
                            authorName: 'John Doe',
                            workType: 'poem'
                        },
                        work: {
                            id: 'work-123',
                            title: 'My Creative Work',
                            submittedAt: '2024-01-15T10:00:00Z',
                            isLicensed: true
                        },
                        verification: {
                            verified: true,
                            verifiedAt: '2024-01-15T10:35:00Z',
                            verifiedBy: 'ISOWS-INDIA API v1.0'
                        }
                    }
                }
            },
            'GET /api/public/health': {
                description: 'Check API health status',
                response: {
                    status: 'string',
                    service: 'string',
                    version: 'string',
                    timestamp: 'string'
                }
            }
        },
        rateLimits: {
            'verify': '100 requests per hour per IP',
            'health': '1000 requests per hour per IP'
        },
        contact: {
            support: 'support@isows-india.com',
            documentation: 'https://api.isows-india.com/docs'
        }
    });
});
//# sourceMappingURL=public.js.map