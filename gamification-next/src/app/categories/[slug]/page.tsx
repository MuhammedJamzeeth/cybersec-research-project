"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { questionsData } from "@/lib/questions";
import { appPermClient, type AppPermQuestion, type UserAnswer } from "@/lib/appperm-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const categoryTitles: Record<string, string> = {
  "password-management": "Password Management",
  "social-media-privacy": "Social Media Privacy",
  "safe-browsing": "Safe Browsing",
  "phishing-awareness": "Phishing Awareness",
  "mobile-app-permissions": "Mobile App Permissions",
};

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [slug, setSlug] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [appPermQuestions, setAppPermQuestions] = useState<AppPermQuestion[]>([]);
  const [detailedFeedback, setDetailedFeedback] = useState<any[]>([]);
  const [mlAwarenessLevel, setMlAwarenessLevel] = useState<string>("");
  const [mlConfidence, setMlConfidence] = useState<number>(0);
  const [mlRecommendations, setMlRecommendations] = useState<string[]>([]);

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
      // Check if user has completed this category
      if (user) {
        checkCompletion(p.slug);
      }
      // Load questions from FastAPI for mobile-app-permissions
      if (p.slug === "mobile-app-permissions") {
        loadAppPermQuestions();
      }
    });
  }, [params, user]);

  const loadAppPermQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const questions = await appPermClient.getQuestions();
      setAppPermQuestions(questions);
    } catch (error) {
      console.error("Error loading app permissions questions:", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const checkCompletion = async (categorySlug: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/assessments/${categorySlug}?userId=${user.id}`
      );
      if (response.ok) {
        const { hasCompleted, assessment } = await response.json();
        setHasCompleted(hasCompleted);
        if (hasCompleted && assessment) {
          // Pre-populate with previous score if needed
        }
      }
    } catch (error) {
      console.error("Error checking completion:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/categories/${slug}`);
    }
  }, [isAuthenticated, router, slug]);

  if (!slug || !isAuthenticated) {
    return null;
  }

  const questions = slug === "mobile-app-permissions" && appPermQuestions.length > 0 
    ? appPermQuestions.map((q, idx) => ({
        id: q.id,
        question: q.question,
        options: q.options.map(opt => opt.text),
        correctAnswer: 0, // Not used for ML-based assessment
        categoryId: "mobile-app-permissions"
      }))
    : (questionsData[slug] || []);
  const categoryTitle = categoryTitles[slug] || "Assessment";

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Special handling for mobile-app-permissions with FastAPI
    if (slug === "mobile-app-permissions" && appPermQuestions.length > 0) {
      try {
        // Prepare answers for FastAPI
        const userAnswers: UserAnswer[] = appPermQuestions.map((q, index) => ({
          question_id: q.id,
          question_text: q.question,
          selected_option: q.options[answers[index]]?.text || "",
          selected_option_index: answers[index] || 0,
        }));

        // Submit to FastAPI with user demographics for ML personalization
        const result = await appPermClient.submitAssessment(
          {
            email: user?.email || "",
            name: user?.username || user?.email || "",
            organization: user?.organization || "",
            gender: (user?.gender as 'Male' | 'Female') || 'Male',
            education_level: (user?.education_level as 'O/L' | 'A/L' | 'HND' | 'Degree') || 'Degree',
            proficiency: (user?.proficiency as 'School' | 'High Education') || 'High Education',
          },
          userAnswers
        );

        setScore(Math.round(result.percentage));
        setDetailedFeedback(result.detailed_feedback);
        setMlAwarenessLevel(result.ml_awareness_level || "");
        setMlConfidence(result.ml_confidence || 0);
        setMlRecommendations(result.ml_recommendations || []);
        setSubmitted(true);
        setHasCompleted(true);
        
        // Also save to your MongoDB
        await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            categoryId: "mobile-app-permissions",
            slug: slug,
            answers: Object.values(answers),
            score: Math.round(result.percentage),
          }),
        });
        
        return;
      } catch (error) {
        console.error("Error submitting to FastAPI:", error);
        // Fall through to regular handling
      }
    }

    // Regular handling for other categories
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    // Save to database
    if (user) {
      try {
        const response = await fetch("/api/assessments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            categoryId: questions[0]?.categoryId || "1",
            slug: slug,
            answers: Object.values(answers),
            score: finalScore,
          }),
        });

        if (response.ok) {
          setHasCompleted(true);
        } else {
          console.error("Failed to save assessment");
        }
      } catch (error) {
        console.error("Error saving assessment:", error);
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (hasCompleted && !submitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>{categoryTitle}</CardTitle>
            <CardDescription>You've already completed this assessment!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-lg">
                You've already taken this assessment. Your knowledge in this area has been
                recorded.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push("/")}>Back to Home</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setHasCompleted(false);
                    setAnswers({});
                  }}
                >
                  Retake Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Assessment Complete!</CardTitle>
            <CardDescription>Here are your results for {categoryTitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="mb-2 text-lg">Your Score</p>
                <p className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}%</p>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {score >= 80
                    ? "Excellent! You have strong knowledge in this area."
                    : score >= 60
                    ? "Good job! There's room for improvement."
                    : "Keep learning! Review the topics and try again."}
                </p>
              </div>

              {/* ML-Based Awareness Level */}
              {mlAwarenessLevel && slug === "mobile-app-permissions" && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
                  <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-100">
                    🤖 ML-Powered Analysis
                  </h3>
                  <p className="text-sm mb-2">
                    <span className="font-semibold">Awareness Level:</span> {mlAwarenessLevel}
                    {mlConfidence > 0 && (
                      <span className="ml-2 text-xs">
                        (Confidence: {(mlConfidence * 100).toFixed(1)}%)
                      </span>
                    )}
                  </p>
                  {mlRecommendations && mlRecommendations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">📊 Personalized Recommendations:</p>
                      <ul className="space-y-2">
                        {mlRecommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm pl-4 border-l-2 border-purple-300 dark:border-purple-700">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-semibold">Answer Review:</h3>
                {slug === "mobile-app-permissions" && detailedFeedback.length > 0 ? (
                  // Enhanced feedback from FastAPI for mobile-app-permissions
                  detailedFeedback.map((feedback, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/20"
                    >
                      <p className="mb-2 font-medium">
                        {index + 1}. {feedback.question_text}
                      </p>
                      <p className="text-sm mb-2">
                        Your answer: {feedback.selected_option}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-semibold">Score:</span> {feedback.score} | 
                        <span className="font-semibold"> Level:</span> {feedback.level}
                      </p>
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold mb-1">💡 Explanation:</p>
                        <p className="text-sm">{feedback.explanation}</p>
                      </div>
                      {feedback.enhancement_advice && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                          <p className="text-sm font-semibold mb-1">📚 Enhancement Advice:</p>
                          <p className="text-sm">{feedback.enhancement_advice}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Regular feedback for other categories
                  questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === question.correctAnswer;
                    return (
                      <div
                        key={question.id}
                        className={`rounded-lg border p-4 ${
                          isCorrect
                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        }`}
                      >
                        <p className="mb-2 font-medium">
                          {index + 1}. {question.question}
                        </p>
                        <p className="text-sm">
                          Your answer: {question.options[userAnswer]}
                          {!isCorrect && (
                            <span className="ml-2">
                              (Correct: {question.options[question.correctAnswer]})
                            </span>
                          )}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-center">
                <Button onClick={() => router.push("/")}>Back to Home</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{categoryTitle} Assessment</CardTitle>
          <CardDescription>
            Answer the following questions to test your knowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((question, questionIndex) => (
              <div key={question.id} className="space-y-4">
                <Label className="text-base font-semibold">
                  {questionIndex + 1}. {question.question}
                </Label>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="flex cursor-pointer items-center space-x-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                        className="h-4 w-4"
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <Button type="submit" className="w-full">
              Submit Assessment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
