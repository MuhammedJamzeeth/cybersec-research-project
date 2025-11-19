/**
 * Example: Integrating FastAPI App Permissions Service
 * 
 * This file shows the key changes needed to integrate the FastAPI service
 * with your existing Next.js category page.
 * 
 * File: src/app/categories/[slug]/page.tsx
 */

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { appPermClient, type AppPermQuestion, type QuestionFeedback } from "@/lib/appperm-client";

// Add these imports to your existing file
// ... existing imports ...

export default function CategoryPage() {
  const { slug } = useParams();
  
  // Existing state
  const [questions, setQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  
  // NEW: Add these state variables
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [detailedFeedback, setDetailedFeedback] = useState<QuestionFeedback[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MODIFIED: Load questions - add FastAPI integration
  useEffect(() => {
    async function loadQuestions() {
      if (slug === "mobile-app-permissions") {
        // Use FastAPI for App Permissions
        setIsLoadingQuestions(true);
        setApiError(null);
        
        try {
          const appPermQuestions = await appPermClient.getQuestions();
          
          // Transform to match your existing Question interface
          const transformed = appPermQuestions.map((q) => ({
            id: q.id,
            categoryId: "5",
            question: q.question,
            options: q.options.map(opt => opt.text),
            correctAnswer: 0, // Will be determined by ML model
            _rawOptions: q.options, // Store for later use
          }));
          
          setQuestions(transformed);
        } catch (error) {
          console.error("Error loading questions from FastAPI:", error);
          setApiError("Failed to load questions from service. Using fallback.");
          
          // Fallback to static questions
          const { questionsData } = await import("@/lib/questions");
          setQuestions(questionsData[slug as string] || []);
        } finally {
          setIsLoadingQuestions(false);
        }
      } else {
        // Use existing logic for other categories
        const { questionsData } = await import("@/lib/questions");
        setQuestions(questionsData[slug as string] || []);
      }
      
      // Initialize answers array
      setUserAnswers(new Array(questions.length).fill(-1));
    }

    loadQuestions();
  }, [slug]);

  // MODIFIED: Handle submit - add FastAPI integration
  const handleSubmit = async () => {
    if (slug === "mobile-app-permissions") {
      // Use FastAPI for App Permissions assessment
      setIsSubmitting(true);
      
      try {
        // Prepare user profile (get from your auth context)
        const userProfile = {
          email: user?.email || "user@example.com",
          name: user?.name || "User",
          organization: user?.organization || "UOR",
          gender: (user?.gender || "Male") as "Male" | "Female",
          education_level: (user?.education || "Degree") as "O/L" | "A/L" | "HND" | "Degree",
          proficiency: (user?.proficiency || "High Education") as "School" | "High Education",
        };

        // Prepare answers
        const answers = questions.map((q, idx) => ({
          question_id: q.id,
          question_text: q.question,
          selected_option: q.options[userAnswers[idx]],
          selected_option_index: userAnswers[idx],
        }));

        // Submit to FastAPI
        const result = await appPermClient.submitAssessment(userProfile, answers);

        // Display results
        setScore(result.percentage);
        setDetailedFeedback(result.detailed_feedback);
        setShowResults(true);

        // Also save to your Next.js database for consistency
        await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            categoryId: "5",
            slug: "mobile-app-permissions",
            answers: userAnswers,
            score: result.percentage,
          }),
        });

      } catch (error) {
        console.error("Error submitting assessment:", error);
        alert("Failed to submit assessment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Use existing logic for other categories
      // ... your existing submit code ...
    }
  };

  // Render loading state
  if (isLoadingQuestions) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading questions...</p>
      </div>
    );
  }

  // Display API error if any
  {apiError && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <p className="text-yellow-800">⚠️ {apiError}</p>
    </div>
  )}

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Your existing UI */}
      
      {/* Questions */}
      {!showResults && questions.map((question, qIdx) => (
        <div key={question.id} className="mb-6 p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {qIdx + 1}. {question.question}
          </h3>
          
          <div className="space-y-2">
            {question.options.map((option: string, oIdx: number) => (
              <label
                key={oIdx}
                className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name={`question-${qIdx}`}
                  value={oIdx}
                  checked={userAnswers[qIdx] === oIdx}
                  onChange={() => {
                    const newAnswers = [...userAnswers];
                    newAnswers[qIdx] = oIdx;
                    setUserAnswers(newAnswers);
                  }}
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Submit button */}
      {!showResults && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || userAnswers.some(a => a === -1)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
        >
          {isSubmitting ? "Submitting..." : "Submit Assessment"}
        </button>
      )}

      {/* Results with detailed feedback */}
      {showResults && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Assessment Results</h2>
          
          <div className="mb-6">
            <p className="text-4xl font-bold text-blue-600">{score.toFixed(1)}%</p>
            <p className="text-gray-600">Your Score</p>
          </div>

          {/* Detailed Feedback (only for App Permissions) */}
          {slug === "mobile-app-permissions" && detailedFeedback.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="text-xl font-bold">Detailed Feedback</h3>
              
              {detailedFeedback.map((feedback, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                  <p className="font-semibold">{feedback.question_text}</p>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    Your answer: {feedback.selected_option}
                  </p>
                  
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      feedback.level === "advanced" ? "bg-green-100 text-green-800" :
                      feedback.level === "intermediate" ? "bg-blue-100 text-blue-800" :
                      feedback.level === "basic" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {feedback.level.toUpperCase()} - {feedback.score} points
                    </span>
                  </div>
                  
                  <p className="mt-3 text-sm italic">{feedback.explanation}</p>
                  
                  <p className="mt-2 text-sm text-blue-600">
                    💡 <strong>Enhancement:</strong> {feedback.enhancement_advice}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
