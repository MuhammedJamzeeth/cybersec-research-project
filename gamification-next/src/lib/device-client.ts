const API_URL =
  process.env.NEXT_PUBLIC_SAFEBROWSING_API_URL ||
  process.env.NEXT_PUBLIC_DEVICE_API_URL ||
  "http://localhost:8004";

export interface DeviceQuestion {
  id: string;
  question: string;
  options: {
    text: string;
    weight: number;
    level: string;
  }[];
  category: string;
}

export interface UserProfile {
  email: string;
  name: string;
  organization?: string;
  gender: "Male" | "Female";
  education_level: "O/L" | "A/L" | "HND" | "Degree";
  proficiency: "School" | "High Education";
}

export interface UserAnswer {
  question_id: string;
  question_text: string;
  selected_option: string;
  selected_option_index: number;
}

export interface QuestionFeedback {
  question_id: string;
  question_text: string;
  selected_option: string;
  score: number;
  level: string;
  explanation: string;
  enhancement_advice: string;
}

export interface AssessmentResult {
  timestamp: string;
  user_profile: UserProfile;
  total_score: number;
  max_score: number;
  percentage: number;
  overall_knowledge_level: string;
  detailed_feedback: QuestionFeedback[];
  ml_awareness_level?: string;
  ml_confidence?: number;
  ml_recommendations?: string[];
  saved_to_database: boolean;
  message: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  model_loaded: boolean;
  components_status: {
    model_loaded: boolean;
    answer_sheet_loaded: boolean;
    questions_loaded: boolean;
    explanation_bank_loaded: boolean;
  };
}

export const deviceClient = {
  async getQuestions(): Promise<DeviceQuestion[]> {
    const response = await fetch(`${API_URL}/api/questions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Failed to fetch questions" }));
      throw new Error(error.detail || "Failed to fetch questions");
    }

    return response.json();
  },

  async submitAssessment(
    userProfile: UserProfile,
    answers: UserAnswer[]
  ): Promise<AssessmentResult> {
    const response = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_profile: userProfile,
        answers: answers,
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Failed to submit assessment" }));
      throw new Error(error.detail || "Failed to submit assessment");
    }

    return response.json();
  },

  async checkHealth(): Promise<HealthStatus> {
    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    return response.json();
  },
};
