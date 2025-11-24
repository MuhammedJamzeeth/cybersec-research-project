"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssessmentRecommendations from "@/components/AssessmentRecommendations";
import { useAuth } from "@/lib/auth";

export default function AssessmentResultsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categorySlug = searchParams.get("category") || "";
  const score = searchParams.get("score");
  const percentage = searchParams.get("percentage");
  const level = searchParams.get("level");

  const [showRecommendations, setShowRecommendations] = useState(true);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-lg mb-4">Please log in to view your results</p>
          <Button onClick={() => router.push("/login")}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Assessment Complete!</h1>
        
        {/* Initial Results Summary */}
        {score && percentage && level && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Your Results</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                <div className="text-4xl font-bold">{score}</div>
                <div className="text-sm opacity-90">Score</div>
              </div>
              <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                <div className="text-4xl font-bold">{percentage}%</div>
                <div className="text-sm opacity-90">Percentage</div>
              </div>
              <div className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-lg">
                <div className="text-2xl font-bold">{level}</div>
                <div className="text-sm opacity-90">Level</div>
              </div>
            </div>
          </Card>
        )}

        {/* Recommendations and Improvement Tracking */}
        {showRecommendations && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-amber-900">
                🎯 Next Steps to Improve Your Knowledge
              </h3>
              <p className="text-sm text-amber-800">
                Based on your assessment results and weak areas, we've generated 
                personalized game recommendations using our ML model. Play these 
                games to strengthen your knowledge, then retake the assessment to 
                measure your improvement!
              </p>
            </Card>

            <AssessmentRecommendations
              userId={user.id}
              categorySlug={categorySlug}
              showImprovement={true}
            />

            {/* Learning Journey Info */}
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200 shadow-md">
              <h3 className="text-xl font-bold mb-4 text-emerald-900">Your Learning Journey</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold">Assessment Completed ✓</div>
                    <div className="text-sm text-gray-600">
                      Your knowledge level has been evaluated
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold">Play Recommended Games</div>
                    <div className="text-sm text-gray-600">
                      Focus on games that target your weak areas
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold">Retake Assessment</div>
                    <div className="text-sm text-gray-600">
                      Measure your improvement after playing games
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-semibold">Track Progress</div>
                    <div className="text-sm text-gray-600">
                      View your improvement over time
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ML Features Info */}
            <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-violet-900">
                🤖 AI-Powered Learning
              </h3>
              <div className="space-y-2 text-sm text-violet-800">
                <div className="flex items-start gap-2">
                  <span className="font-semibold">✓</span>
                  <span>
                    <strong>ML Analysis:</strong> Your answers are analyzed by our 
                    machine learning model to determine your awareness level
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">✓</span>
                  <span>
                    <strong>Personalized Recommendations:</strong> Game suggestions 
                    are tailored to your profile (education level, proficiency) and 
                    weak areas
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">✓</span>
                  <span>
                    <strong>Improvement Tracking:</strong> The system measures your 
                    knowledge growth and shows which games had the most impact
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold">✓</span>
                  <span>
                    <strong>Adaptive Learning Path:</strong> As you improve, 
                    recommendations evolve to match your advancing skill level
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
