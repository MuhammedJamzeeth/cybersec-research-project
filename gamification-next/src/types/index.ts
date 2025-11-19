export interface User {
  id: string;
  username: string;
  email: string;
  gender?: string;
  education_level?: string;
  proficiency?: string;
  organization?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, demographics?: {
    gender?: string;
    education_level?: string;
    proficiency?: string;
    organization?: string;
  }) => Promise<void>;
  logout: () => void;
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export interface Question {
  id: string;
  categoryId: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Assessment {
  id: string;
  userId: string;
  categoryId: string;
  answers: number[];
  score: number;
  completedAt: Date;
}
