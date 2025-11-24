"use client";

import { useState, useEffect } from "react";
import { ImprovementChart } from "./ImprovementChart";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Assessment {
  id: string;
  slug: string;
  score: number;
  percentage: number;
  knowledgeLevel: string;
  attemptNumber: number;
  improvement: number | null;
  completedAt: string;
}

interface ImprovementDashboardProps {
  userId: string;
  assessments: Assessment[];
}

const categoryNames: Record<string, string> = {
  "password-management": "Password Management",
  "social-media-privacy": "Social Media Privacy",
  "safe-browsing": "Safe Browsing",
  "phishing-awareness": "Phishing Awareness",
  "mobile-app-permissions": "Mobile App Permissions",
};

export default function ImprovementDashboard({ userId, assessments }: ImprovementDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Group assessments by category
  const assessmentsByCategory = assessments.reduce((acc, assessment) => {
    if (!acc[assessment.slug]) {
      acc[assessment.slug] = [];
    }
    acc[assessment.slug].push(assessment);
    return acc;
  }, {} as Record<string, Assessment[]>);

  // Sort each category's assessments by attempt number
  Object.keys(assessmentsByCategory).forEach(slug => {
    assessmentsByCategory[slug].sort((a, b) => a.attemptNumber - b.attemptNumber);
  });

  // Select first category with multiple attempts by default
  useEffect(() => {
    if (!selectedCategory) {
      const categoryWithMultiple = Object.keys(assessmentsByCategory).find(
        slug => assessmentsByCategory[slug].length > 1
      );
      setSelectedCategory(categoryWithMultiple || Object.keys(assessmentsByCategory)[0] || null);
    }
  }, [assessments]);

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No assessments completed yet</p>
        <p className="text-sm text-gray-400">Complete an assessment to see your progress here</p>
      </div>
    );
  }

  const categories = Object.keys(assessmentsByCategory);
  const selectedData = selectedCategory ? assessmentsByCategory[selectedCategory] : [];

  return (
    <div className="space-y-6">
      {/* Category Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(slug => {
          const categoryAssessments = assessmentsByCategory[slug];
          const latest = categoryAssessments[categoryAssessments.length - 1];
          const first = categoryAssessments[0];
          const totalImprovement = categoryAssessments.length > 1 
            ? latest.percentage - first.percentage 
            : 0;
          
          return (
            <Card
              key={slug}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                selectedCategory === slug 
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : ''
              }`}
              onClick={() => setSelectedCategory(slug)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-sm">{categoryNames[slug] || slug}</h4>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {categoryAssessments.length} attempt{categoryAssessments.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Latest:</span>
                  <span className="text-2xl font-bold text-blue-600">{latest.percentage}%</span>
                </div>
                
                {categoryAssessments.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Improvement:</span>
                    <div className="flex items-center gap-1">
                      {totalImprovement > 0 ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">
                            +{totalImprovement.toFixed(1)}%
                          </span>
                        </>
                      ) : totalImprovement < 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-semibold text-red-600">
                            {totalImprovement.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <Minus className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-600">No change</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Level: <span className="font-medium">{latest.knowledgeLevel}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Chart for Selected Category */}
      {selectedCategory && selectedData.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold">
              {categoryNames[selectedCategory] || selectedCategory}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedData.length} assessment{selectedData.length !== 1 ? 's' : ''} completed
            </p>
          </div>
          
          <ImprovementChart
            data={selectedData.map(a => ({
              attemptNumber: a.attemptNumber,
              score: a.score,
              percentage: a.percentage,
              knowledgeLevel: a.knowledgeLevel,
              completedAt: a.completedAt,
            }))}
            category={selectedCategory}
          />

          {/* Recommendations */}
          {selectedData.length > 0 && (
            <div className="mt-6 relative overflow-hidden">
              {selectedData.length === 1 ? (
                <div className="p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🎯</span>
                      <h4 className="font-bold text-lg">Keep Going!</h4>
                    </div>
                    <p className="text-sm leading-relaxed opacity-95">
                      Complete more attempts to see your improvement trend! Play the recommended 
                      games for this category and retake the assessment.
                    </p>
                  </div>
                </div>
              ) : selectedData[selectedData.length - 1].percentage < 80 ? (
                <div className="p-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">💪</span>
                      <h4 className="font-bold text-lg">Keep Practicing!</h4>
                    </div>
                    <p className="text-sm leading-relaxed opacity-95">
                      Play more games related to {categoryNames[selectedCategory]} 
                      to improve your score further. You're making progress!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg text-white relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🏆</span>
                      <h4 className="font-bold text-lg">Excellent Work!</h4>
                    </div>
                    <p className="text-sm leading-relaxed opacity-95">
                      You've mastered {categoryNames[selectedCategory]}! Consider 
                      exploring other categories to continue your cybersecurity learning journey.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Overall Statistics */}
      <Card className="p-6 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-purple-950 dark:to-blue-950 border-violet-200 shadow-md">
        <h3 className="text-lg font-bold mb-4 text-violet-900 dark:text-violet-100">📊 Overall Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Categories Attempted
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {assessments.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Attempts
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              {Math.round(
                assessments.reduce((sum, a) => sum + a.percentage, 0) / assessments.length
              )}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Score
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {categories.filter(slug => 
                assessmentsByCategory[slug].length > 1
              ).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Retaken Categories
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
