/**
 * Unified Assessment Service Client
 * Dynamically routes to appropriate service based on category
 */

import { appPermClient } from "./appperm-client";
import { phishingClient } from "./phishing-client";
import { passwordClient } from "./password-client";
import { socialClient } from "./social-client";
import { deviceClient } from "./device-client";
import type {
  CommonUserProfile,
  CommonUserAnswer,
  CommonAssessmentResult,
} from "./api-clients";

export type AssessmentCategory =
  | "mobile-app-permissions"
  | "phishing-detection"
  | "password-security"
  | "social-engineering"
  | "device-security";

export interface AssessmentClient {
  getQuestions: () => Promise<any[]>;
  submitAssessment: (
    userProfile: CommonUserProfile,
    answers: CommonUserAnswer[]
  ) => Promise<CommonAssessmentResult>;
  checkHealth: () => Promise<any>;
}

/**
 * Get the appropriate API client for a given category
 */
export function getAssessmentClient(
  category: AssessmentCategory
): AssessmentClient {
  const clientMap: Record<AssessmentCategory, AssessmentClient> = {
    "mobile-app-permissions": appPermClient as AssessmentClient,
    "phishing-detection": phishingClient as AssessmentClient,
    "password-security": passwordClient as AssessmentClient,
    "social-engineering": socialClient as AssessmentClient,
    "device-security": deviceClient as AssessmentClient,
  };

  const client = clientMap[category];

  if (!client) {
    throw new Error(`Unknown assessment category: ${category}`);
  }

  return client;
}

/**
 * Get questions for a specific category
 */
export async function getQuestionsByCategory(category: AssessmentCategory) {
  const client = getAssessmentClient(category);
  return await client.getQuestions();
}

/**
 * Submit assessment for a specific category
 */
export async function submitAssessmentByCategory(
  category: AssessmentCategory,
  userProfile: CommonUserProfile,
  answers: CommonUserAnswer[]
): Promise<CommonAssessmentResult> {
  const client = getAssessmentClient(category);
  return await client.submitAssessment(userProfile, answers);
}

/**
 * Check health of a specific service
 */
export async function checkServiceHealth(category: AssessmentCategory) {
  const client = getAssessmentClient(category);
  return await client.checkHealth();
}

/**
 * Check health of all services
 */
export async function checkAllServicesHealth() {
  const categories: AssessmentCategory[] = [
    "mobile-app-permissions",
    "phishing-detection",
    "password-security",
    "social-engineering",
    "device-security",
  ];

  const healthChecks = await Promise.allSettled(
    categories.map(async (category) => {
      try {
        const health = await checkServiceHealth(category);
        return { category, ...health };
      } catch (error) {
        return {
          category,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return healthChecks.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return {
        category: categories[index],
        status: "error",
        error: result.reason,
      };
    }
  });
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: AssessmentCategory): string {
  const displayNames: Record<AssessmentCategory, string> = {
    "mobile-app-permissions": "Mobile App Permissions",
    "phishing-detection": "Phishing Detection",
    "password-security": "Password Security",
    "social-engineering": "Social Engineering",
    "device-security": "Device Security",
  };

  return displayNames[category] || category;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: AssessmentCategory): string {
  const icons: Record<AssessmentCategory, string> = {
    "mobile-app-permissions": "📱",
    "phishing-detection": "🎣",
    "password-security": "🔐",
    "social-engineering": "🎭",
    "device-security": "🛡️",
  };

  return icons[category] || "📋";
}

/**
 * Get category description
 */
export function getCategoryDescription(category: AssessmentCategory): string {
  const descriptions: Record<AssessmentCategory, string> = {
    "mobile-app-permissions":
      "Test your knowledge about mobile app permissions and privacy",
    "phishing-detection": "Learn to identify and avoid phishing attacks",
    "password-security":
      "Assess your password security practices and knowledge",
    "social-engineering": "Understand social engineering tactics and defenses",
    "device-security": "Evaluate your device security awareness",
  };

  return descriptions[category] || "Assessment";
}

/**
 * Get all available categories
 */
export function getAllCategories(): AssessmentCategory[] {
  return [
    "mobile-app-permissions",
    "phishing-detection",
    "password-security",
    "social-engineering",
    "device-security",
  ];
}

/**
 * Parse category from route or slug
 */
export function parseCategoryFromSlug(slug: string): AssessmentCategory | null {
  const slugMap: Record<string, AssessmentCategory> = {
    "mobile-app-permissions": "mobile-app-permissions",
    "app-permissions": "mobile-app-permissions",
    "phishing-detection": "phishing-detection",
    phishing: "phishing-detection",
    "password-security": "password-security",
    password: "password-security",
    "social-engineering": "social-engineering",
    social: "social-engineering",
    "device-security": "device-security",
    device: "device-security",
  };

  return slugMap[slug] || null;
}
