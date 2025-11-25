"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImprovementDashboard from "@/components/ImprovementDashboard";
import {
  Trophy,
  Target,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Star,
  Zap,
  Shield,
  Medal,
  Crown,
  Brain,
  Gamepad2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface AssessmentResult {
  id: string;
  categoryId: string;
  slug: string;
  score: number;
  percentage: number;
  knowledgeLevel: string;
  attemptNumber: number;
  improvement: number | null;
  answers: number[];
  completedAt: string;
  user: {
    username: string;
  };
}

interface LeaderboardEntry {
  username: string;
  totalScore: number;
  assessmentCount: number;
  averageScore: number;
  rank: number;
}

interface GameResult {
  id: string;
  category: string;
  gameSlug: string;
  preScore: number;
  gameScore: number;
  postScore: number;
  improvement: number;
  completedAt: string;
}

interface Stats {
  totalAssessments: number;
  averageScore: number;
  highestScore: number;
  completedCategories: number;
  totalPoints: number;
  currentStreak: number;
  level: number;
  nextLevelPoints: number;
}

const categoryNames: Record<string, string> = {
  "password-management": "Password Management",
  "social-media-privacy": "Social Media Privacy",
  "safe-browsing": "Safe Browsing",
  "phishing-awareness": "Phishing Awareness",
  "mobile-app-permissions": "Mobile App Permissions",
};

const getBadgeForScore = (score: number) => {
  if (score >= 90)
    return { icon: Crown, color: "text-yellow-500", label: "Master" };
  if (score >= 80)
    return { icon: Medal, color: "text-purple-500", label: "Expert" };
  if (score >= 70)
    return { icon: Award, color: "text-blue-500", label: "Advanced" };
  if (score >= 60)
    return { icon: Star, color: "text-green-500", label: "Intermediate" };
  return { icon: Shield, color: "text-gray-500", label: "Beginner" };
};

const getLevel = (points: number) => {
  return Math.floor(points / 500) + 1;
};

const getNextLevelPoints = (level: number) => {
  return level * 500;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "games" | "leaderboard"
  >("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard");
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      // Load user assessments
      const assessmentsRes = await fetch(`/api/assessments?userId=${user?.id}`);
      if (assessmentsRes.ok) {
        const data = await assessmentsRes.json();
        setAssessments(data.assessments || []);

        // Calculate stats
        const totalAssessments = data.assessments.length;
        const totalScore = data.assessments.reduce(
          (sum: number, a: AssessmentResult) => sum + a.score,
          0
        );
        const averageScore =
          totalAssessments > 0 ? Math.round(totalScore / totalAssessments) : 0;
        const highestScore =
          totalAssessments > 0
            ? Math.max(
                ...data.assessments.map((a: AssessmentResult) => a.score)
              )
            : 0;
        const completedCategories = new Set(
          data.assessments.map((a: AssessmentResult) => a.slug)
        ).size;
        const totalPoints = totalScore * 10; // 10 points per score percentage
        const level = getLevel(totalPoints);

        setStats({
          totalAssessments,
          averageScore,
          highestScore,
          completedCategories,
          totalPoints,
          currentStreak: Math.min(totalAssessments, 7), // Simplified streak calculation
          level,
          nextLevelPoints: getNextLevelPoints(level),
        });
      }

      // Load leaderboard
      const leaderboardRes = await fetch("/api/leaderboard");
      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.leaderboard || []);
      }

      // Load game results
      const gameResultsRes = await fetch(
        `/api/games/results?userId=${user?.id}`
      );
      if (gameResultsRes.ok) {
        const data = await gameResultsRes.json();
        setGameResults(data.gameResults || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
            <p className="text-zinc-600 dark:text-zinc-400">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const progressToNextLevel = stats
    ? ((stats.totalPoints % 500) / 500) * 100
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.username}!
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Track your cybersecurity learning progress and compete with others
        </p>
      </div>

      {/* Level & Progress */}
      {stats && (
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="h-10 w-10" />
                <div>
                  <p className="text-sm opacity-90">Current Level</p>
                  <p className="text-3xl font-bold">Level {stats.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Total Points</p>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {stats.level + 1}</span>
                <span>{Math.round(progressToNextLevel)}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
              <p className="text-xs opacity-75">
                {stats.nextLevelPoints - stats.totalPoints} points to next level
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("games")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "games"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Games
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "leaderboard"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          {/* Improvement Charts by Category */}
          <Card>
            <CardHeader>
              <CardTitle>📈 Your Learning Progress</CardTitle>
              <CardDescription>
                Track your improvement across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImprovementDashboard
                userId={user.id}
                assessments={assessments}
              />
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Assessments
                </CardTitle>
                <Target className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalAssessments}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {stats.completedCategories}/5 categories completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getScoreColor(
                    stats.averageScore
                  )}`}
                >
                  {stats.averageScore}%
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Across all assessments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Highest Score
                </CardTitle>
                <Trophy className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.highestScore}%
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Personal best
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Streak
                </CardTitle>
                <Zap className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.currentStreak}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Assessments completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Achievements
              </CardTitle>
              <CardDescription>
                Badges earned based on your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {assessments.slice(0, 5).map((assessment) => {
                  const badge = getBadgeForScore(assessment.score);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={assessment.id}
                      className="flex flex-col items-center p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900"
                    >
                      <BadgeIcon className={`h-8 w-8 mb-2 ${badge.color}`} />
                      <p className="text-xs font-medium text-center mb-1">
                        {categoryNames[assessment.slug] || assessment.slug}
                      </p>
                      <p
                        className={`text-sm font-bold ${getScoreColor(
                          assessment.score
                        )}`}
                      >
                        {assessment.score}%
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {badge.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {assessments.length === 0 && (
                <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Complete assessments to earn badges!</p>
                  <Button asChild className="mt-4">
                    <a href="/">Start Your First Assessment</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                Keep improving your cybersecurity knowledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button asChild className="h-auto py-4" variant="outline">
                  <a href="/" className="flex items-center gap-3">
                    <Target className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">Browse Categories</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Explore all cybersecurity topics
                      </p>
                    </div>
                  </a>
                </Button>
                <Button asChild className="h-auto py-4" variant="outline">
                  <a href="/profile" className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">View Progress</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Track your improvement over time
                      </p>
                    </div>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Assessment History
            </CardTitle>
            <CardDescription>Your complete assessment record</CardDescription>
          </CardHeader>
          <CardContent>
            {assessments.length > 0 ? (
              <div className="space-y-3">
                {assessments.map((assessment) => {
                  const badge = getBadgeForScore(assessment.score);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <BadgeIcon className={`h-6 w-6 ${badge.color}`} />
                        <div>
                          <p className="font-semibold">
                            {categoryNames[assessment.slug] || assessment.slug}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Completed{" "}
                            {new Date(
                              assessment.completedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${getScoreColor(
                            assessment.score
                          )}`}
                        >
                          {assessment.score}%
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {badge.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No assessments completed yet</p>
                <p className="text-sm mb-4">
                  Start your cybersecurity learning journey today!
                </p>
                <Button asChild>
                  <a href="/">Take Your First Assessment</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Games Tab */}
      {activeTab === "games" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-purple-600" />
              Game Completion History
            </CardTitle>
            <CardDescription>
              Track your learning progress through interactive games
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gameResults.length > 0 ? (
              <div className="space-y-4">
                {gameResults.map((game) => {
                  const prePercent = (game.preScore / 30) * 100;
                  const postPercent = (game.postScore / 30) * 100;
                  const improvementPercent = (postPercent - prePercent).toFixed(
                    1
                  );
                  const isImproved = game.improvement > 0;
                  const improvementColor = isImproved
                    ? "text-green-600 dark:text-green-400"
                    : game.improvement < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-600 dark:text-zinc-400";

                  return (
                    <div
                      key={game.id}
                      className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg capitalize">
                            {game.gameSlug.replace(/-/g, " ")}
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {categoryNames[game.category] || game.category}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                            {new Date(game.completedAt).toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 font-bold ${improvementColor}`}
                        >
                          {isImproved ? (
                            <ArrowUp className="h-5 w-5" />
                          ) : (
                            <ArrowDown className="h-5 w-5" />
                          )}
                          {isImproved ? "+" : ""}
                          {improvementPercent}%
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                            Pre-Assessment
                          </p>
                          <p
                            className={`text-xl font-bold ${getScoreColor(
                              (game.preScore / 30) * 100
                            )}`}
                          >
                            {game.preScore}/30
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500">
                            {Math.round((game.preScore / 30) * 100)}%
                          </p>
                        </div>

                        <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                            Game Score
                          </p>
                          <p
                            className={`text-xl font-bold ${getScoreColor(
                              game.gameScore
                            )}`}
                          >
                            {game.gameScore}/100
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-400">
                            {game.gameScore}%
                          </p>
                        </div>

                        <div className="text-center p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                            Post-Assessment
                          </p>
                          <p
                            className={`text-xl font-bold ${getScoreColor(
                              (game.postScore / 30) * 100
                            )}`}
                          >
                            {game.postScore}/30
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500">
                            {Math.round((game.postScore / 30) * 100)}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">
                            Knowledge Improvement:
                          </span>
                          <span className={`font-semibold ${improvementColor}`}>
                            {isImproved ? "+" : ""}
                            {improvementPercent} percentage points
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
                <Gamepad2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No games completed yet</p>
                <p className="text-sm mb-4">
                  Play interactive games to enhance your cybersecurity
                  knowledge!
                </p>
                <Button asChild>
                  <a href="/games">Explore Games</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Global Leaderboard
            </CardTitle>
            <CardDescription>
              Top performers in cybersecurity knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.username === user.username;
                  const rankColors = [
                    "text-yellow-600",
                    "text-gray-400",
                    "text-orange-600",
                  ];
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCurrentUser
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`text-2xl font-bold ${
                            rankColors[index] ||
                            "text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          #{entry.rank}
                        </div>
                        <div>
                          <p
                            className={`font-semibold ${
                              isCurrentUser
                                ? "text-blue-600 dark:text-blue-400"
                                : ""
                            }`}
                          >
                            {entry.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {entry.assessmentCount} assessments completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {entry.totalScore} pts
                        </p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Avg: {Math.round(entry.averageScore)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No leaderboard data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
