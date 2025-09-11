import { PlagiarismResult } from '../types';
import { workService } from './workService';

export const plagiarismService = {
  async checkPlagiarism(content: string): Promise<PlagiarismResult> {
    // Basic plagiarism check for MVP
    // This is a simplified version - in production, you'd use a more sophisticated service
    
    const normalizedContent = content.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Check for common plagiarism indicators
    const suspiciousPatterns = [
      /(?:this is a test|sample text|lorem ipsum)/i,
      /(?:copy|paste|stolen|plagiarized)/i,
      /(?:i did not write this|not my work)/i
    ];
    
    let score = 0;
    let details = '';
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        score += 25;
        details += `Suspicious pattern detected: ${pattern.source}\n`;
      }
    }
    
    // Check for very short content (likely not original work)
    if (content.length < 100) {
      score += 20;
      details += 'Content too short to be original work\n';
    }
    
    // Check for repeated phrases (basic check)
    const words = normalizedContent.split(' ');
    const wordCounts: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3) { // Only check words longer than 3 characters
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    const repeatedWords = Object.entries(wordCounts).filter(([_, count]) => count > 3);
    if (repeatedWords.length > 0) {
      score += Math.min(repeatedWords.length * 5, 30);
      details += `Repeated words detected: ${repeatedWords.map(([word, count]) => `${word}(${count})`).join(', ')}\n`;
    }
    
    // For MVP, we'll be lenient - only flag obvious cases
    const isPlagiarized = score > 50;
    
    if (details === '') {
      details = 'No plagiarism detected';
    }
    
    return {
      isPlagiarized,
      score: Math.min(score, 100),
      details: details.trim()
    };
  }
};
