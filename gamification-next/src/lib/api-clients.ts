// Centralized API clients for all assessment services
export { appPermClient } from "./appperm-client";
export { phishingClient } from "./phishing-client";
export { passwordClient } from "./password-client";
export { socialClient } from "./social-client";
export { deviceClient } from "./device-client";

// Category to client mapping
export const assessmentClients = {
  "mobile-app-permissions": "appPermClient",
  "phishing-detection": "phishingClient",
  "password-security": "passwordClient",
  "social-engineering": "socialClient",
  "safe-browsing": "deviceClient",
} as const;

// Get client by category
export function getClientByCategory(category: string) {
  const clientMap: Record<string, any> = {
    "mobile-app-permissions": require("./appperm-client").appPermClient,
    "phishing-detection": require("./phishing-client").phishingClient,
    "password-security": require("./password-client").passwordClient,
    "social-engineering": require("./social-client").socialClient,
    "safe-browsing": require("./device-client").deviceClient,
  };

  return clientMap[category] || null;
}

// Common types
export type AssessmentCategory =
  | "mobile-app-permissions"
  | "phishing-detection"
  | "password-security"
  | "social-engineering"
  | "safe-browsing";

export interface CommonUserProfile {
  email: string;
  name: string;
  organization?: string;
  gender: "Male" | "Female";
  education_level: "O/L" | "A/L" | "HND" | "Degree";
  proficiency: "School" | "High Education";
}

export interface CommonUserAnswer {
  question_id: string;
  question_text: string;
  selected_option: string;
  selected_option_index: number;
}

export interface CommonAssessmentResult {
  timestamp: string;
  user_profile: CommonUserProfile;
  total_score: number;
  max_score: number;
  percentage: number;
  overall_knowledge_level: string;
  detailed_feedback: any[];
  ml_awareness_level?: string;
  ml_confidence?: number;
  ml_recommendations?: string[];
  saved_to_database: boolean;
  message: string;
}
