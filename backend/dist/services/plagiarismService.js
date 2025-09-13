"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plagiarismService = void 0;
const workService_1 = require("./workService");
const emailService_1 = require("./emailService");
exports.plagiarismService = {
    async checkPlagiarism(content, currentUserId) {
        // Improved heuristics: n-grams and TF-IDF cosine against other user works (same DB)
        const normalized = content.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
        const tokens = normalized.split(' ').filter(Boolean);
        // Build n-grams (n=3)
        const makeNgrams = (arr, n) => {
            const out = [];
            for (let i = 0; i <= arr.length - n; i++)
                out.push(arr.slice(i, i + n).join(' '));
            return out;
        };
        const trigrams = new Set(makeNgrams(tokens, 3));
        // TF
        const tf = {};
        for (const t of tokens)
            tf[t] = (tf[t] || 0) + 1;
        const allWorks = await workService_1.workService.getAllWorks();
        // Filter out current user's works to avoid self-plagiarism detection
        const otherWorks = currentUserId ? allWorks.filter(w => w.userId !== currentUserId) : allWorks;
        console.log(`Plagiarism check: ${allWorks.length} total works, ${otherWorks.length} other users' works`);
        if (otherWorks.length === 0) {
            console.log('No other works to compare against - returning no plagiarism');
            return { isPlagiarized: false, score: 0, details: 'No plagiarism detected', matches: [] };
        }
        const matches = [];
        for (const w of otherWorks) {
            console.log(`Comparing against work: "${w.title}" by user ${w.userId}`);
            const otherNorm = (w.content || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
            if (!otherNorm)
                continue;
            const otherTokens = otherNorm.split(' ').filter(Boolean);
            const otherTrigrams = new Set(makeNgrams(otherTokens, 3));
            // trigram overlap
            let overlap = 0;
            const overlappingPhrases = [];
            for (const tri of trigrams) {
                if (otherTrigrams.has(tri)) {
                    overlap++;
                    overlappingPhrases.push(tri);
                }
            }
            const denom = Math.max(trigrams.size, 1);
            const trigramSim = overlap / denom; // 0..1
            console.log(`Similarity with "${w.title}": ${(trigramSim * 100).toFixed(1)}%`);
            if (trigramSim > 0.15) {
                console.log(`PLAGIARISM DETECTED: "${w.title}" - ${(trigramSim * 100).toFixed(1)}% similar`);
                matches.push({ workId: w.id, workTitle: w.title, similarity: +trigramSim.toFixed(3), overlappingPhrases: overlappingPhrases.slice(0, 20) });
            }
        }
        // Score: scaled by best match
        const best = matches.reduce((m, p) => Math.max(m, p.similarity), 0);
        const score = Math.round(best * 100);
        const isPlagiarized = score >= 40; // threshold can be tuned
        const details = matches.length ? 'Potential similarities found' : 'No plagiarism detected';
        return { isPlagiarized, score, details, matches };
    },
    async checkPlagiarismWithNotification(content, workId, userId, userEmail, workTitle) {
        const result = await this.checkPlagiarism(content, userId);
        // Send email notification if plagiarism is detected
        if (result.isPlagiarized && result.matches && result.matches.length > 0) {
            try {
                // Get the similar works for the email
                const similarWorkIds = result.matches.map(m => m.workId);
                const similarWorks = await workService_1.workService.getAllWorks();
                const matchingWorks = similarWorks.filter(w => similarWorkIds.includes(w.id));
                await emailService_1.emailService.sendPlagiarismAlert(userEmail, workTitle, workId, result, matchingWorks);
            }
            catch (error) {
                console.error('Failed to send plagiarism alert email:', error);
                // Don't fail the plagiarism check if email fails
            }
        }
        return result;
    }
};
//# sourceMappingURL=plagiarismService.js.map