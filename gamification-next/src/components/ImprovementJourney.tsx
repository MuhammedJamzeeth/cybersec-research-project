"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ImprovementJourneyProps {
  attempts: Array<{
    attemptNumber: number;
    score: number;
    percentage: number;
    knowledgeLevel: string;
    completedAt: string;
    weakAreas: string[];
    improvement: number;
  }>;
  totalImprovement: number;
}

export default function ImprovementJourney({
  attempts,
  totalImprovement,
}: ImprovementJourneyProps) {
  const firstAttempt = attempts[0];
  const latestAttempt = attempts[attempts.length - 1];

  const getKnowledgeLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "advanced":
        return "bg-green-500";
      case "intermediate":
        return "bg-blue-500";
      default:
        return "bg-orange-500";
    }
  };

  const getImprovementColor = (improvement: number) => {
    if (improvement > 15) return "text-green-600";
    if (improvement > 5) return "text-blue-600";
    if (improvement > 0) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Your Learning Journey</h2>

      {/* Journey Overview */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Starting Point</div>
            <div className="text-3xl font-bold text-purple-600">
              {firstAttempt.percentage}%
            </div>
            <div className="text-sm text-gray-500">
              {firstAttempt.knowledgeLevel}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Improvement</div>
              <div
                className={`text-4xl font-bold ${getImprovementColor(
                  totalImprovement
                )}`}
              >
                {totalImprovement > 0 ? "+" : ""}
                {totalImprovement}%
              </div>
              <div className="text-sm text-gray-500">
                {attempts.length} attempts
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Current Level</div>
            <div className="text-3xl font-bold text-blue-600">
              {latestAttempt.percentage}%
            </div>
            <div className="text-sm text-gray-500">
              {latestAttempt.knowledgeLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Timeline */}
      <div className="mb-8">
        <h3 className="font-semibold mb-4">Progress Over Time</h3>
        <div className="relative">
          {attempts.map((attempt, index) => {
            const isFirst = index === 0;
            const isLast = index === attempts.length - 1;
            const prevPercentage = index > 0 ? attempts[index - 1].percentage : 0;

            return (
              <div key={attempt.attemptNumber} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getKnowledgeLevelColor(
                        attempt.knowledgeLevel
                      )}`}
                    >
                      {attempt.attemptNumber}
                    </div>
                    <div>
                      <div className="font-medium">
                        Attempt {attempt.attemptNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {attempt.percentage}%
                    </div>
                    {!isFirst && (
                      <div
                        className={`text-sm font-semibold ${
                          attempt.improvement > 0
                            ? "text-green-600"
                            : attempt.improvement < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {attempt.improvement > 0 ? "+" : ""}
                        {attempt.improvement}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-5 pl-5 border-l-2 border-gray-200 pb-2">
                  <Progress value={attempt.percentage} className="h-3 mb-2" />

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${getKnowledgeLevelColor(
                        attempt.knowledgeLevel
                      )} text-white`}
                    >
                      {attempt.knowledgeLevel}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      Score: {attempt.score}
                    </span>
                  </div>

                  {attempt.weakAreas && attempt.weakAreas.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Weak areas: </span>
                      {attempt.weakAreas.join(", ")}
                    </div>
                  )}

                  {!isFirst && attempt.improvement > 0 && (
                    <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      ✓ Improved by {attempt.improvement}% from previous attempt
                    </div>
                  )}

                  {!isFirst && attempt.improvement === 0 && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      → Score remained the same. Try focusing on your weak
                      areas.
                    </div>
                  )}

                  {!isFirst && attempt.improvement < 0 && (
                    <div className="mt-2 text-sm text-orange-700 bg-orange-50 p-2 rounded">
                      ⚠ Score decreased. Take time to review and practice more.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Improvement */}
        {attempts.length > 1 && (
          <Card className="p-4 bg-green-50">
            <h4 className="font-semibold mb-2 text-green-900">
              📈 Best Improvement
            </h4>
            {(() => {
              const bestImprovement = Math.max(
                ...attempts.slice(1).map((a) => a.improvement)
              );
              const bestAttempt = attempts.find(
                (a) => a.improvement === bestImprovement
              );
              return bestAttempt ? (
                <div className="text-sm text-green-800">
                  <div className="font-bold text-lg">+{bestImprovement}%</div>
                  <div>
                    Between attempts {bestAttempt.attemptNumber - 1} and{" "}
                    {bestAttempt.attemptNumber}
                  </div>
                </div>
              ) : null;
            })()}
          </Card>
        )}

        {/* Areas Improved */}
        {attempts.length > 1 && (
          <Card className="p-4 bg-blue-50">
            <h4 className="font-semibold mb-2 text-blue-900">
              ✨ Areas Improved
            </h4>
            {(() => {
              const firstWeakAreas = new Set(firstAttempt.weakAreas || []);
              const latestWeakAreas = new Set(latestAttempt.weakAreas || []);
              const improved = Array.from(firstWeakAreas).filter(
                (area) => !latestWeakAreas.has(area)
              );

              return improved.length > 0 ? (
                <div className="text-sm text-blue-800">
                  <div className="space-y-1">
                    {improved.map((area, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="capitalize">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-blue-800">
                  Keep working on your weak areas!
                </div>
              );
            })()}
          </Card>
        )}
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold mb-2 text-yellow-900">💪 Keep Going!</h4>
        <p className="text-sm text-yellow-800">
          {totalImprovement > 20
            ? "Amazing progress! You're becoming an expert in app permissions security. Keep up the excellent work!"
            : totalImprovement > 10
            ? "Great improvement! You're on the right track. Continue practicing to reach expert level."
            : totalImprovement > 5
            ? "Good progress! Every attempt makes you better. Keep playing games and challenging yourself."
            : attempts.length === 1
            ? "This is your first attempt! Play the recommended games and come back to see how much you've improved."
            : "Keep trying! Learning takes time. Focus on your weak areas and you'll see improvement."}
        </p>
      </div>
    </Card>
  );
}
