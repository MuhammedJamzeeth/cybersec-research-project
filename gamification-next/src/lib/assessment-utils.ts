/**
 * Assessment Analysis Utilities
 * Helper functions to analyze assessment results and extract insights
 */

import { QuestionFeedback } from '@/lib/appperm-client';

export interface WeakArea {
  category: string;
  score: number;
  count: number;
  percentage: number;
}

/**
 * Extract category from question text using keyword matching
 */
export function extractCategoryFromQuestion(questionText: string): string {
  const text = questionText.toLowerCase();
  
  // Permission categories mapping
  const categoryKeywords: Record<string, string[]> = {
    location: ['location', 'gps', 'position', 'tracking', 'whereabouts'],
    storage: ['storage', 'file', 'document', 'media', 'save', 'download'],
    camera: ['camera', 'photo', 'picture', 'image capture'],
    contacts: ['contact', 'phonebook', 'address book'],
    microphone: ['microphone', 'audio', 'recording', 'voice', 'sound'],
    calendar: ['calendar', 'event', 'schedule', 'appointment'],
    sms: ['sms', 'text message', 'messaging'],
    phone: ['phone call', 'dialer', 'call log'],
    sensors: ['sensor', 'accelerometer', 'gyroscope', 'biometric'],
    notification: ['notification', 'alert', 'push'],
  };
  
  // Find matching category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}

/**
 * Extract weak areas from detailed feedback
 * Threshold: Questions with score below 60% of max possible score
 */
export function extractWeakAreas(
  detailedFeedback: QuestionFeedback[],
  threshold: number = 0.6
): string[] {
  const weakCategories = new Set<string>();
  
  detailedFeedback.forEach((feedback) => {
    // Assuming max score per question is 5 (adjust if needed)
    const maxScore = 5;
    const scorePercentage = feedback.score / maxScore;
    
    if (scorePercentage < threshold) {
      const category = extractCategoryFromQuestion(feedback.question_text);
      weakCategories.add(category);
    }
  });
  
  return Array.from(weakCategories);
}

/**
 * Analyze weak areas with detailed statistics
 */
export function analyzeWeakAreas(
  detailedFeedback: QuestionFeedback[],
  threshold: number = 0.6
): WeakArea[] {
  const categoryStats: Record<string, { totalScore: number; count: number; maxScore: number }> = {};
  
  detailedFeedback.forEach((feedback) => {
    const category = extractCategoryFromQuestion(feedback.question_text);
    const maxScore = 5; // Assuming max 5 points per question
    
    if (!categoryStats[category]) {
      categoryStats[category] = { totalScore: 0, count: 0, maxScore: 0 };
    }
    
    categoryStats[category].totalScore += feedback.score;
    categoryStats[category].count += 1;
    categoryStats[category].maxScore += maxScore;
  });
  
  // Calculate percentages and filter weak areas
  const weakAreas: WeakArea[] = [];
  
  Object.entries(categoryStats).forEach(([category, stats]) => {
    const percentage = (stats.totalScore / stats.maxScore) * 100;
    const avgScore = stats.totalScore / stats.count;
    
    if (percentage < threshold * 100) {
      weakAreas.push({
        category,
        score: Math.round(avgScore * 10) / 10,
        count: stats.count,
        percentage: Math.round(percentage * 10) / 10,
      });
    }
  });
  
  // Sort by percentage (lowest first - most critical areas)
  return weakAreas.sort((a, b) => a.percentage - b.percentage);
}

/**
 * Calculate knowledge level based on score percentage
 */
export function calculateKnowledgeLevel(percentage: number): string {
  if (percentage >= 80) return 'Advanced';
  if (percentage >= 60) return 'Intermediate';
  return 'Beginner';
}

/**
 * Calculate improvement metrics between two assessments
 */
export interface ImprovementMetrics {
  scoreDifference: number;
  percentageDifference: number;
  improvementPercentage: number;
  levelChange: string | null;
  areasImproved: string[];
  areasStillWeak: string[];
}

export function calculateImprovement(
  previousAssessment: {
    score: number;
    percentage: number;
    weakAreas: string[];
    knowledgeLevel: string;
  },
  currentAssessment: {
    score: number;
    percentage: number;
    weakAreas: string[];
    knowledgeLevel: string;
  }
): ImprovementMetrics {
  const scoreDifference = currentAssessment.score - previousAssessment.score;
  const percentageDifference = currentAssessment.percentage - previousAssessment.percentage;
  
  const improvementPercentage = previousAssessment.percentage > 0
    ? (percentageDifference / previousAssessment.percentage) * 100
    : 0;
  
  const levelChange = previousAssessment.knowledgeLevel !== currentAssessment.knowledgeLevel
    ? `${previousAssessment.knowledgeLevel} → ${currentAssessment.knowledgeLevel}`
    : null;
  
  // Find areas that improved
  const areasImproved = previousAssessment.weakAreas.filter(
    area => !currentAssessment.weakAreas.includes(area)
  );
  
  // Find areas still weak
  const areasStillWeak = currentAssessment.weakAreas.filter(
    area => previousAssessment.weakAreas.includes(area)
  );
  
  return {
    scoreDifference,
    percentageDifference: Math.round(percentageDifference * 10) / 10,
    improvementPercentage: Math.round(improvementPercentage * 10) / 10,
    levelChange,
    areasImproved,
    areasStillWeak,
  };
}

/**
 * Generate improvement message based on metrics
 */
export function generateImprovementMessage(metrics: ImprovementMetrics): string {
  if (metrics.percentageDifference > 20) {
    return '🎉 Outstanding improvement! You\'ve made significant progress!';
  } else if (metrics.percentageDifference > 10) {
    return '🌟 Great job! Your knowledge has noticeably improved!';
  } else if (metrics.percentageDifference > 5) {
    return '👍 Good progress! Keep playing games to improve further.';
  } else if (metrics.percentageDifference > 0) {
    return '📈 You\'re making progress! Continue practicing to see bigger gains.';
  } else if (metrics.percentageDifference === 0) {
    return '🔄 Your score stayed the same. Try different games to target your weak areas.';
  } else {
    return '💪 Don\'t worry! Play more games and try again. Everyone learns at their own pace.';
  }
}

/**
 * Estimate time needed to reach target level
 */
export function estimateTimeToTarget(
  currentPercentage: number,
  targetPercentage: number,
  averageImprovementPerGame: number = 5 // Assume 5% improvement per game
): {
  gamesNeeded: number;
  hoursEstimate: number;
  phases: Array<{ phase: number; focus: string; games: number }>;
} {
  const percentageGap = targetPercentage - currentPercentage;
  const gamesNeeded = Math.max(1, Math.ceil(percentageGap / averageImprovementPerGame));
  const hoursEstimate = gamesNeeded * 0.5; // Assume 30 minutes per game
  
  // Create learning phases
  const phases = [];
  const gamesPerPhase = Math.ceil(gamesNeeded / 3);
  
  if (currentPercentage < 60) {
    phases.push({ phase: 1, focus: 'Build fundamentals', games: gamesPerPhase });
    phases.push({ phase: 2, focus: 'Practice scenarios', games: gamesPerPhase });
    phases.push({ phase: 3, focus: 'Master concepts', games: gamesNeeded - (gamesPerPhase * 2) });
  } else if (currentPercentage < 80) {
    phases.push({ phase: 1, focus: 'Address weak areas', games: Math.ceil(gamesNeeded * 0.6) });
    phases.push({ phase: 2, focus: 'Advanced practice', games: Math.floor(gamesNeeded * 0.4) });
  } else {
    phases.push({ phase: 1, focus: 'Perfect your knowledge', games: gamesNeeded });
  }
  
  return {
    gamesNeeded,
    hoursEstimate: Math.round(hoursEstimate * 10) / 10,
    phases,
  };
}

/**
 * Check if user should retake assessment
 */
export function shouldRetakeAssessment(
  gamesPlayed: number,
  hoursSinceLastAttempt: number,
  minimumGames: number = 3,
  minimumHours: number = 1
): {
  shouldRetake: boolean;
  reason: string;
  gamesRemaining: number;
  hoursRemaining: number;
} {
  const gamesRemaining = Math.max(0, minimumGames - gamesPlayed);
  const hoursRemaining = Math.max(0, minimumHours - hoursSinceLastAttempt);
  
  if (gamesPlayed >= minimumGames && hoursSinceLastAttempt >= minimumHours) {
    return {
      shouldRetake: true,
      reason: 'You\'ve played enough games and sufficient time has passed!',
      gamesRemaining: 0,
      hoursRemaining: 0,
    };
  } else if (gamesPlayed < minimumGames) {
    return {
      shouldRetake: false,
      reason: `Play ${gamesRemaining} more game${gamesRemaining !== 1 ? 's' : ''} before retaking.`,
      gamesRemaining,
      hoursRemaining,
    };
  } else {
    return {
      shouldRetake: false,
      reason: `Wait ${hoursRemaining.toFixed(1)} more hour${hoursRemaining !== 1 ? 's' : ''} before retaking.`,
      gamesRemaining,
      hoursRemaining,
    };
  }
}
