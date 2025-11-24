"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

interface GameRecommendation {
  gameSlug: string;
  gameName: string;
  category: string;
  reason: string;
  priority: number;
  estimatedImpact: string;
}

interface RecommendationsData {
  assessmentId: string;
  score: number;
  percentage: number;
  knowledgeLevel: string;
  weakAreas: string[];
  recommendations: GameRecommendation[];
  totalRecommendations: number;
}

interface ImprovementData {
  totalAttempts: number;
  firstAttempt: {
    score: number;
    percentage: number;
    date: string;
  };
  latestAttempt: {
    score: number;
    percentage: number;
    date: string;
    weakAreas: string[];
  };
  totalImprovement: number;
  improvementPercentage: number;
  improvementData: Array<{
    attemptNumber: number;
    score: number;
    percentage: number;
    knowledgeLevel: string;
    improvement: number;
    completedAt: string;
  }>;
  canRetake: boolean;
  hoursSinceLastAttempt: number;
}

interface Props {
  userId: string;
  categorySlug: string;
  showImprovement?: boolean;
}

export default function AssessmentRecommendations({
  userId,
  categorySlug,
  showImprovement = true,
}: Props) {
  const [recommendations, setRecommendations] =
    useState<RecommendationsData | null>(null);
  const [improvement, setImprovement] = useState<ImprovementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gamesPlayed, setGamesPlayed] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [userId, categorySlug]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch recommendations
      const recResponse = await fetch(
        `/api/recommendations?userId=${userId}&category=${categorySlug}`
      );
      if (recResponse.ok) {
        const recData = await recResponse.json();
        setRecommendations(recData);
      }

      // Fetch improvement data if enabled
      if (showImprovement) {
        const impResponse = await fetch(
          `/api/assessments/improvement?userId=${userId}&category=${categorySlug}`
        );
        if (impResponse.ok) {
          const impData = await impResponse.json();
          setImprovement(impData);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGamePlayed = (gameSlug: string) => {
    setGamesPlayed([...gamesPlayed, gameSlug]);
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "personalized":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getKnowledgeLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "advanced":
        return "text-green-600";
      case "intermediate":
        return "text-blue-600";
      default:
        return "text-orange-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading recommendations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assessment Score Summary */}
      {recommendations && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Your Assessment Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md text-white">
              <div className="text-3xl font-bold">
                {recommendations.score}
              </div>
              <div className="text-sm opacity-90">Total Score</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md text-white">
              <div className="text-3xl font-bold">
                {recommendations.percentage}%
              </div>
              <div className="text-sm opacity-90">Percentage</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-md text-white">
              <div className="text-2xl font-bold">
                {recommendations.knowledgeLevel}
              </div>
              <div className="text-sm opacity-90">Knowledge Level</div>
            </div>
          </div>

          {recommendations.weakAreas.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Areas for Improvement:</h3>
              <div className="flex flex-wrap gap-2">
                {recommendations.weakAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full text-sm font-medium shadow-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Improvement History */}
      {showImprovement && improvement && improvement.totalAttempts > 1 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Your Progress</h2>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Improvement</span>
              <span
                className={`text-lg font-bold ${
                  improvement.totalImprovement > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {improvement.totalImprovement > 0 ? "+" : ""}
                {improvement.totalImprovement}%
              </span>
            </div>
            <Progress
              value={Math.min(
                100,
                Math.max(0, 50 + improvement.totalImprovement)
              )}
              className="h-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-gray-600 mb-1">First Attempt</div>
              <div className="text-2xl font-bold">
                {improvement.firstAttempt.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {new Date(improvement.firstAttempt.date).toLocaleDateString()}
              </div>
            </div>
            <div className="p-4 border-2 border-blue-500 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
              <div className="text-sm text-blue-600 mb-1 font-semibold">Latest Attempt</div>
              <div className="text-2xl font-bold text-blue-600">
                {improvement.latestAttempt.percentage}%
              </div>
              <div className="text-xs text-blue-500">
                {new Date(improvement.latestAttempt.date).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Attempt History */}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Attempt History:</h3>
            <div className="space-y-2">
              {improvement.improvementData.map((attempt) => (
                <div
                  key={attempt.attemptNumber}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">#{attempt.attemptNumber}</div>
                    <div className="text-sm">
                      <span className="font-medium">{attempt.percentage}%</span>
                      <span className="text-gray-500 ml-2">
                        ({attempt.knowledgeLevel})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {attempt.improvement !== 0 && (
                      <span
                        className={`text-sm font-semibold ${
                          attempt.improvement > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {attempt.improvement > 0 ? "+" : ""}
                        {attempt.improvement}%
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Retake Button */}
          {improvement.canRetake ? (
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 rounded-lg shadow-md">
              <p className="text-sm text-emerald-800 font-medium mb-3">
                Ready to test your improved knowledge? Take the assessment again
                to see how much you've learned!
              </p>
              <Link href={`/categories/${categorySlug}`}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">Retake Assessment</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg shadow-md">
              <p className="text-sm text-amber-800 font-medium">
                You can retake the assessment in{" "}
                {Math.max(0, 1 - improvement.hoursSinceLastAttempt).toFixed(1)}{" "}
                hours. Play more games to improve your knowledge!
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Game Recommendations */}
      {recommendations && recommendations.recommendations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            Recommended Games to Improve Your Skills
          </h2>
          <p className="text-gray-600 mb-6">
            Based on your assessment results, we recommend these games to help
            you strengthen your knowledge in weak areas.
          </p>

          <div className="space-y-4">
            {recommendations.recommendations
              .filter((rec) => !gamesPlayed.includes(rec.gameSlug))
              .map((game, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{game.gameName}</h3>
                      <span className="text-sm text-gray-500 capitalize">
                        {game.category} • Priority {game.priority}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getImpactColor(
                        game.estimatedImpact
                      )}`}
                    >
                      {game.estimatedImpact} impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{game.reason}</p>
                  <Link href={`/games/${game.category}/${game.gameSlug}`}>
                    <Button
                      onClick={() => handleGamePlayed(game.gameSlug)}
                      className="w-full"
                    >
                      Play Game
                    </Button>
                  </Link>
                </div>
              ))}
          </div>

          {gamesPlayed.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-md">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Great! You've played {gamesPlayed.length} recommended{" "}
                {gamesPlayed.length === 1 ? "game" : "games"}.
              </p>
              {gamesPlayed.length >= 3 && improvement?.canRetake && (
                <p className="text-sm text-blue-800 font-semibold">
                  You're ready to retake the assessment and measure your
                  improvement!
                </p>
              )}
            </div>
          )}
        </Card>
      )}

      {/* No Recommendations */}
      {recommendations && recommendations.recommendations.length === 0 && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Excellent Work!</h2>
          <p className="text-gray-600 mb-4">
            You have a strong understanding of {categorySlug} permissions. Keep
            practicing with other categories to become a complete security
            expert!
          </p>
          <Link href="/categories">
            <Button>Explore Other Categories</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
