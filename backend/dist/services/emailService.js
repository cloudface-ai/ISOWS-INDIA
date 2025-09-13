"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Email configuration
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});
exports.emailService = {
    async sendPlagiarismAlert(userEmail, workTitle, workId, plagiarismResult, similarWorks) {
        const matches = plagiarismResult.matches || [];
        const topMatches = matches.slice(0, 3); // Show top 3 matches
        const similarWorksList = topMatches.map(match => {
            const work = similarWorks.find(w => w.id === match.workId);
            return `• "${work?.title || 'Unknown Work'}" (${Math.round(match.similarity * 100)}% similar)`;
        }).join('\n');
        const overlappingPhrases = topMatches.flatMap(match => match.overlappingPhrases.slice(0, 3));
        const phrasesList = overlappingPhrases.length > 0
            ? `\n\nOverlapping phrases detected:\n${overlappingPhrases.map(phrase => `• "${phrase}"`).join('\n')}`
            : '';
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@isows-india.com',
            to: userEmail,
            subject: `🚨 Plagiarism Alert: "${workTitle}"`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #dc3545; margin: 0;">Plagiarism Alert</h2>
            <p style="color: #666; margin: 10px 0 0 0;">ISOWS-INDIA Work Licensing System</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e1e5e9; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Your work has been flagged for potential plagiarism</h3>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <strong>Work Details:</strong><br>
              <strong>Title:</strong> ${workTitle}<br>
              <strong>Similarity Score:</strong> ${plagiarismResult.score}%<br>
              <strong>Work ID:</strong> ${workId}
            </div>
            
            <h4 style="color: #333;">Similar Works Found:</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif;">${similarWorksList}</pre>
            </div>
            
            ${phrasesList ? `
            <h4 style="color: #333;">Overlapping Content:</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif;">${phrasesList}</pre>
            </div>
            ` : ''}
            
            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <strong>What should you do?</strong><br>
              • Review the similar works listed above<br>
              • Check if you have proper attribution for any borrowed content<br>
              • Consider revising your work if necessary<br>
              • Contact us if you believe this is a false positive
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-works" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Your Works
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
            <p>This is an automated message from ISOWS-INDIA Work Licensing System.</p>
            <p>If you have questions, please contact us at support@isows-india.com</p>
          </div>
        </div>
      `
        };
        try {
            await transporter.sendMail(mailOptions);
            console.log(`Plagiarism alert email sent to ${userEmail} for work ${workId}`);
        }
        catch (error) {
            console.error('Failed to send plagiarism alert email:', error);
            throw error;
        }
    },
    async sendLicenseGeneratedNotification(userEmail, workTitle, license) {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@isows-india.com',
            to: userEmail,
            subject: `✅ License Generated: "${workTitle}"`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #155724; margin: 0;">License Generated Successfully!</h2>
            <p style="color: #155724; margin: 10px 0 0 0;">ISOWS-INDIA Work Licensing System</p>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #e1e5e9; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Your work has been licensed</h3>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <strong>Work Details:</strong><br>
              <strong>Title:</strong> ${workTitle}<br>
              <strong>License ID:</strong> ${license.id}<br>
              <strong>Author:</strong> ${license.authorName || 'Not specified'}<br>
              <strong>Work Type:</strong> ${license.workType || 'Not specified'}<br>
              <strong>Issued:</strong> ${new Date(license.issuedAt).toLocaleString()}
            </div>
            
            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <strong>Next Steps:</strong><br>
              • Download your license PDF from the "My Works" page<br>
              • Share your work with confidence using the license<br>
              • Keep your license ID for verification purposes
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-works" 
                 style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Your Works
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
            <p>This is an automated message from ISOWS-INDIA Work Licensing System.</p>
          </div>
        </div>
      `
        };
        try {
            await transporter.sendMail(mailOptions);
            console.log(`License generated notification sent to ${userEmail} for work ${workTitle}`);
        }
        catch (error) {
            console.error('Failed to send license notification email:', error);
            throw error;
        }
    }
};
//# sourceMappingURL=emailService.js.map