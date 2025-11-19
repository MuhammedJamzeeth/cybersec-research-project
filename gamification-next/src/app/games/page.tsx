"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Target, 
  Trophy,
  Shield,
  Smartphone,
  Lock,
  Mail,
  Globe,
  Share2,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Brain
} from "lucide-react";

interface UserLevel {
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  lastScore: number;
  gamesPlayed: number;
  improvementRate: number;
}

interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: string;
  estimatedTime: string;
  skills: string[];
  isLocked: boolean;
}

const categoryIcons: Record<string, any> = {
  "password-management": Lock,
  "social-media-privacy": Share2,
  "safe-browsing": Globe,
  "phishing-awareness": Mail,
  "mobile-app-permissions": Smartphone,
};

const categoryGames: Record<string, Game[]> = {
  "mobile-app-permissions": [
    {
      id: "1",
      slug: "permission-detective",
      title: "Permission Detective",
      description: "Investigate suspicious app permissions and identify security risks",
      icon: "🔍",
      difficulty: "Beginner",
      estimatedTime: "5-10 min",
      skills: ["Permission Recognition", "Risk Assessment"],
      isLocked: false,
    },
    {
      id: "2",
      slug: "secure-app-builder",
      title: "Secure App Builder",
      description: "Build a secure app by selecting appropriate permissions",
      icon: "🏗️",
      difficulty: "Intermediate",
      estimatedTime: "10-15 min",
      skills: ["Permission Management", "Security Design"],
      isLocked: false,
    },
    {
      id: "3",
      slug: "privacy-defender",
      title: "Privacy Defender",
      description: "Defend against malicious apps trying to steal your data",
      icon: "🛡️",
      difficulty: "Advanced",
      estimatedTime: "15-20 min",
      skills: ["Threat Detection", "Privacy Protection"],
      isLocked: false,
    },
  ],
  "password-management": [
    {
      id: "4",
      slug: "password-strength-trainer",
      title: "Password Strength Trainer",
      description: "Learn to create unbreakable passwords",
      icon: "💪",
      difficulty: "Beginner",
      estimatedTime: "5-10 min",
      skills: ["Password Creation", "Strength Assessment"],
      isLocked: false,
    },
    {
      id: "5",
      slug: "breach-defense",
      title: "Breach Defense",
      description: "Prevent password breaches and secure your accounts",
      icon: "🔒",
      difficulty: "Intermediate",
      estimatedTime: "10-15 min",
      skills: ["Security Practices", "Breach Prevention"],
      isLocked: false,
    },
  ],
  "phishing-awareness": [
    {
      id: "6",
      slug: "email-detective",
      title: "Email Detective",
      description: "Spot phishing emails before they catch you",
      icon: "📧",
      difficulty: "Beginner",
      estimatedTime: "5-10 min",
      skills: ["Phishing Recognition", "Email Analysis"],
      isLocked: false,
    },
    {
      id: "7",
      slug: "scam-buster",
      title: "Scam Buster",
      description: "Identify and report various online scams",
      icon: "🚫",
      difficulty: "Intermediate",
      estimatedTime: "10-15 min",
      skills: ["Scam Detection", "Reporting Procedures"],
      isLocked: false,
    },
  ],
  "social-media-privacy": [
    {
      id: "8",
      slug: "privacy-settings-master",
      title: "Privacy Settings Master",
      description: "Configure optimal privacy settings for social platforms",
      icon: "⚙️",
      difficulty: "Beginner",
      estimatedTime: "5-10 min",
      skills: ["Privacy Configuration", "Data Control"],
      isLocked: false,
    },
  ],
  "safe-browsing": [
    {
      id: "9",
      slug: "web-safety-navigator",
      title: "Web Safety Navigator",
      description: "Navigate the web safely and avoid dangerous sites",
      icon: "🧭",
      difficulty: "Beginner",
      estimatedTime: "5-10 min",
      skills: ["Safe Browsing", "Threat Avoidance"],
      isLocked: false,
    },
  ],
};

export default function GamesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [userLevels, setUserLevels] = useState<Record<string, UserLevel>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/games");
      return;
    }

    if (user) {
      loadUserProgress();
    }
  }, [isAuthenticated, user, router]);

  const loadUserProgress = async () => {
    try {
      const res = await fetch(`/api/assessments?userId=${user?.id}`);
      if (res.ok) {
        const data = await res.json();
        const assessments = data.assessments || [];
        
        // Calculate user level for each category
        const levels: Record<string, UserLevel> = {};
        
        Object.keys(categoryGames).forEach((category) => {
          const categoryAssessments = assessments.filter((a: any) => a.slug === category);
          
          if (categoryAssessments.length > 0) {
            const lastScore = categoryAssessments[0].score;
            const avgScore = categoryAssessments.reduce((sum: number, a: any) => sum + a.score, 0) / categoryAssessments.length;
            
            let level: "beginner" | "intermediate" | "advanced" = "beginner";
            if (avgScore >= 80) level = "advanced";
            else if (avgScore >= 60) level = "intermediate";
            
            levels[category] = {
              category,
              level,
              lastScore,
              gamesPlayed: 0, // Will be tracked separately
              improvementRate: 0,
            };
          } else {
            levels[category] = {
              category,
              level: "beginner",
              lastScore: 0,
              gamesPlayed: 0,
              improvementRate: 0,
            };
          }
        });
        
        setUserLevels(levels);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedGame = (category: string): Game | null => {
    const games = categoryGames[category] || [];
    const userLevel = userLevels[category]?.level || "beginner";
    
    // Recommend game based on user level
    if (userLevel === "beginner") {
      return games.find(g => g.difficulty === "Beginner") || games[0];
    } else if (userLevel === "intermediate") {
      return games.find(g => g.difficulty === "Intermediate") || games[1];
    } else {
      return games.find(g => g.difficulty === "Advanced") || games[games.length - 1];
    }
  };

  const getLevelBadge = (level: string) => {
    const badges = {
      beginner: { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200", label: "Beginner" },
      intermediate: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Intermediate" },
      advanced: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", label: "Advanced" },
    };
    return badges[level as keyof typeof badges] || badges.beginner;
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">Loading games...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Gamepad2 className="h-8 w-8 text-purple-600" />
          Cybersecurity Learning Games
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Play personalized games to improve your knowledge. Games are tailored to your skill level!
        </p>
      </div>

      {/* Feature Banner */}
      <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Brain className="h-12 w-12" />
              <div>
                <h3 className="text-xl font-bold mb-1">Personalized Learning</h3>
                <p className="text-sm opacity-90">
                  Games adapt to your knowledge level. Complete pre and post assessments to track improvement!
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" size="lg">
              <a href="/dashboard">View Progress</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Games by Category */}
      <div className="space-y-8">
        {Object.entries(categoryGames).map(([category, games]) => {
          const IconComponent = categoryIcons[category];
          const userLevel = userLevels[category];
          const recommendedGame = getRecommendedGame(category);
          const levelBadge = getLevelBadge(userLevel?.level || "beginner");
          
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {IconComponent && <IconComponent className="h-6 w-6 text-blue-600" />}
                  <h2 className="text-2xl font-bold capitalize">
                    {category.replace(/-/g, " ")}
                  </h2>
                  {userLevel && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelBadge.color}`}>
                      {levelBadge.label} Level
                    </span>
                  )}
                </div>
                {userLevel && (
                  <div className="text-right text-sm text-zinc-600 dark:text-zinc-400">
                    <p>Last Score: <span className="font-bold">{userLevel.lastScore}%</span></p>
                  </div>
                )}
              </div>

              {/* Recommended Game Highlight */}
              {recommendedGame && (
                <Card className="mb-4 border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-semibold">Recommended for You</span>
                    </div>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-3xl">{recommendedGame.icon}</span>
                      {recommendedGame.title}
                    </CardTitle>
                    <CardDescription>{recommendedGame.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold">{recommendedGame.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span>⏱️ {recommendedGame.estimatedTime}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">Skills you'll practice:</p>
                      <div className="flex flex-wrap gap-2">
                        {recommendedGame.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white dark:bg-zinc-900 rounded-full text-xs border border-zinc-200 dark:border-zinc-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button asChild size="lg" className="w-full">
                      <a href={`/games/${category}/${recommendedGame.slug}`}>
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Play Now
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* All Games Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => {
                  const isRecommended = game.id === recommendedGame?.id;
                  
                  return (
                    <Card key={game.id} className={isRecommended ? "opacity-50" : ""}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-2xl">{game.icon}</span>
                          {game.title}
                        </CardTitle>
                        <CardDescription className="text-sm">{game.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Difficulty:</span>
                            <span className="font-semibold">{game.difficulty}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Time:</span>
                            <span>{game.estimatedTime}</span>
                          </div>
                          <Button 
                            asChild 
                            variant={isRecommended ? "outline" : "default"} 
                            className="w-full"
                            disabled={game.isLocked}
                          >
                            <a href={`/games/${category}/${game.slug}`}>
                              {isRecommended ? "Already Playing" : "Play Game"}
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            How Learning Games Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Pre-Assessment</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Take a quick quiz to determine your current knowledge level
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Play & Learn</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Engage with interactive scenarios tailored to your level
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
              </div>
              <h3 className="font-semibold mb-2">Post-Assessment</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Measure your improvement and earn points for progress
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
