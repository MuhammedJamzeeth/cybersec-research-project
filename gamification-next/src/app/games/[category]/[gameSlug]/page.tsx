"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  ArrowRight,
  ArrowLeft,
  Brain,
  Zap
} from "lucide-react";

interface GamePageProps {
  params: Promise<{
    category: string;
    gameSlug: string;
  }>;
}

type GamePhase = "intro" | "pre-assessment" | "game" | "post-assessment" | "results";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface ScenarioOption {
  text: string;
  isCorrect: boolean;
  feedback: string;
  points: number;
}

interface GameScenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  options: ScenarioOption[];
  learningPoint: string;
}

export default function GamePage({ params }: GamePageProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState("");
  const [gameSlug, setGameSlug] = useState("");
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [preScore, setPreScore] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [postScore, setPostScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<number, boolean>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    params.then((p) => {
      setCategory(p.category);
      setGameSlug(p.gameSlug);
    });
  }, [params]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/games");
    }
  }, [isAuthenticated, router]);

  // Save results when reaching results phase
  useEffect(() => {
    if (phase === "results" && user) {
      saveGameResults();
    }
  }, [phase, user]);

  // Sample questions for pre/post assessment
  const assessmentQuestions: Question[] = [
    {
      id: "1",
      question: "What is the most dangerous permission an app can request?",
      options: [
        "Access to contacts",
        "Access to camera and microphone",
        "Access to device administrator rights",
        "Access to storage"
      ],
      correctAnswer: 2,
      explanation: "Device administrator rights give apps extensive control over your device and can be used maliciously.",
      points: 10
    },
    {
      id: "2",
      question: "When should you review app permissions?",
      options: [
        "Only when installing the app",
        "Never, they're automatically safe",
        "Regularly, and before installing",
        "Only if the app crashes"
      ],
      correctAnswer: 2,
      explanation: "Regular review helps you maintain control over your data and privacy.",
      points: 10
    },
    {
      id: "3",
      question: "A flashlight app requests access to your contacts. What should you do?",
      options: [
        "Accept it, all apps need contacts",
        "Deny it, a flashlight doesn't need contacts",
        "Only accept if it's a popular app",
        "Ask your friends first"
      ],
      correctAnswer: 1,
      explanation: "Apps should only request permissions necessary for their function. A flashlight doesn't need contacts.",
      points: 10
    }
  ];

  // Sample game scenarios
  const gameScenarios: GameScenario[] = [
    {
      id: "1",
      title: "Suspicious Calculator App",
      description: "You're installing a calculator app",
      situation: "A calculator app is requesting permission to access your SMS messages, contacts, and camera. What should you do?",
      options: [
        {
          text: "Accept all permissions - it's just a calculator",
          isCorrect: false,
          feedback: "❌ Red flag! A calculator has no legitimate need for SMS, contacts, or camera access. This could be malware trying to steal your data.",
          points: 0
        },
        {
          text: "Deny all permissions and don't install the app",
          isCorrect: true,
          feedback: "✅ Excellent decision! These permissions are completely unnecessary for a calculator and indicate malicious intent.",
          points: 20
        },
        {
          text: "Only accept camera permission",
          isCorrect: false,
          feedback: "⚠️ Still risky! A calculator doesn't need camera access. Look for a more trustworthy alternative.",
          points: 5
        }
      ],
      learningPoint: "Always verify that requested permissions match the app's stated function. Unnecessary permissions are a major red flag."
    },
    {
      id: "2",
      title: "Social Media Update",
      description: "Your social media app wants new permissions",
      situation: "Your favorite social media app asks for permission to access your device's administrator rights in a new update. What do you do?",
      options: [
        {
          text: "Accept - they must need it for new features",
          isCorrect: false,
          feedback: "❌ Dangerous! Administrator rights give excessive control. Social media apps don't need this level of access.",
          points: 0
        },
        {
          text: "Research why it's needed before accepting",
          isCorrect: true,
          feedback: "✅ Smart! Always investigate suspicious permission requests. Check the app's update notes and user reviews.",
          points: 20
        },
        {
          text: "Ignore the request and continue using the app",
          isCorrect: false,
          feedback: "⚠️ Partially correct, but better to uninstall if they force this permission. Find alternatives that respect your privacy.",
          points: 10
        }
      ],
      learningPoint: "Device administrator rights are extremely powerful. Legitimate apps rarely need them. Always research before granting."
    },
    {
      id: "3",
      title: "Photo Editor Permissions",
      description: "Installing a photo editing app",
      situation: "A photo editor requests access to your camera, storage, and location. Which permissions should you grant?",
      options: [
        {
          text: "All of them - it needs everything for editing",
          isCorrect: false,
          feedback: "⚠️ Not quite! While camera and storage make sense, location data isn't necessary for photo editing.",
          points: 10
        },
        {
          text: "Only camera and storage",
          isCorrect: true,
          feedback: "✅ Perfect! These permissions are legitimate for a photo editor. Location tracking is unnecessary and invasive.",
          points: 20
        },
        {
          text: "None - deny everything",
          isCorrect: false,
          feedback: "❌ Too restrictive! Some permissions are necessary for the app to function. Be smart about which ones make sense.",
          points: 5
        }
      ],
      learningPoint: "Evaluate each permission individually. Some are necessary for functionality, others are just data collection."
    },
    {
      id: "4",
      title: "Game with Ads",
      description: "Free game requesting permissions",
      situation: "A free mobile game asks for access to your phone calls and SMS. The developer says it's for 'better ad targeting'. Is this okay?",
      options: [
        {
          text: "Yes, it's normal for free apps",
          isCorrect: false,
          feedback: "❌ Never normal! Accessing calls and SMS for ads is excessive and potentially illegal in many jurisdictions.",
          points: 0
        },
        {
          text: "No, this is invasive data collection",
          isCorrect: true,
          feedback: "✅ Absolutely right! This is a massive privacy violation. Report the app and find a more ethical alternative.",
          points: 20
        },
        {
          text: "Accept but disable ads later",
          isCorrect: false,
          feedback: "❌ Bad idea! Once you grant permission, the damage is done. They can access your data immediately.",
          points: 0
        }
      ],
      learningPoint: "Ad-supported apps should never need access to phone calls or messages. This is a sign of predatory data harvesting."
    },
    {
      id: "5",
      title: "Fitness Tracker Setup",
      description: "Setting up a fitness tracking app",
      situation: "A fitness app requests location, motion sensors, and health data access. Are these permissions appropriate?",
      options: [
        {
          text: "Yes, all are necessary for fitness tracking",
          isCorrect: true,
          feedback: "✅ Correct! These permissions are legitimate for a fitness app to track your activities and provide accurate data.",
          points: 20
        },
        {
          text: "No, deny all permissions",
          isCorrect: false,
          feedback: "❌ Too strict! These permissions are actually needed for the app's core functionality. Context matters!",
          points: 0
        },
        {
          text: "Only accept motion sensors",
          isCorrect: false,
          feedback: "⚠️ The app won't work properly without location and health data access. These are legitimate for fitness tracking.",
          points: 10
        }
      ],
      learningPoint: "Context is key! The same permissions might be necessary for one app type but suspicious for another. Always evaluate based on the app's purpose."
    }
  ];

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate score
      let score = 0;
      assessmentQuestions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) {
          score += q.points;
        }
      });

      if (phase === "pre-assessment") {
        setPreScore(score);
        setPhase("game");
        setCurrentScenarioIndex(0);
        setAnswers({});
      } else if (phase === "post-assessment") {
        setPostScore(score);
        setPhase("results");
      }
    }
  };

  const handleScenarioChoice = (optionIndex: number) => {
    const scenario = gameScenarios[currentScenarioIndex];
    const option = scenario.options[optionIndex];
    
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    setScenarioAnswers((prev) => ({
      ...prev,
      [currentScenarioIndex]: option.isCorrect
    }));
    setGameScore((prev) => prev + option.points);
  };

  const handleNextScenario = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    
    if (currentScenarioIndex < gameScenarios.length - 1) {
      setCurrentScenarioIndex((prev) => prev + 1);
    } else {
      setPhase("post-assessment");
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  };

  const calculateImprovement = () => {
    const maxScore = assessmentQuestions.length * 10;
    const prePercentage = (preScore / maxScore) * 100;
    const postPercentage = (postScore / maxScore) * 100;
    return Math.round(postPercentage - prePercentage);
  };

  const saveGameResults = async () => {
    if (!user) return;
    
    try {
      await fetch("/api/games/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          category,
          gameSlug,
          preScore,
          gameScore,
          postScore,
          improvement: calculateImprovement(),
          completedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error("Error saving game results:", error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // Intro Phase
  if (phase === "intro") {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-purple-500">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <PlayCircle className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">
                {gameSlug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </CardTitle>
              <CardDescription className="text-base">
                Master cybersecurity through interactive scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  How This Works
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-semibold">Pre-Assessment (3 questions)</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Test your current knowledge level</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-semibold">Interactive Game ({gameScenarios.length} scenarios)</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Make decisions in real-world situations</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="font-semibold">Post-Assessment (3 questions)</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Measure your improvement</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Earn Points</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Based on your decisions</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Track Growth</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">See your improvement</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/games")} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Games
                </Button>
                <Button 
                  onClick={() => setPhase("pre-assessment")} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Start Game
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pre/Post Assessment Phase
  if (phase === "pre-assessment" || phase === "post-assessment") {
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / assessmentQuestions.length) * 100;
    const isPreAssessment = phase === "pre-assessment";

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">
                {isPreAssessment ? "Pre-Assessment" : "Post-Assessment"}
              </h2>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestionIndex] === idx
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-950/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestionIndex] === idx
                        ? "border-purple-600 bg-purple-600"
                        : "border-zinc-300 dark:border-zinc-700"
                    }`}>
                      {answers[currentQuestionIndex] === idx && (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextQuestion}
                  disabled={answers[currentQuestionIndex] === undefined}
                  className="flex-1"
                >
                  {currentQuestionIndex === assessmentQuestions.length - 1 ? "Finish Assessment" : "Next Question"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Game Phase
  if (phase === "game") {
    const currentScenario = gameScenarios[currentScenarioIndex];
    const progress = ((currentScenarioIndex + 1) / gameScenarios.length) * 100;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-600" />
                Interactive Game
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Scenario {currentScenarioIndex + 1} of {gameScenarios.length}
                </span>
                <span className="font-bold text-purple-600">
                  {gameScore} points
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-2 border-purple-500">
            <CardHeader>
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">{currentScenario.title}</span>
              </div>
              <CardTitle className="text-2xl">{currentScenario.description}</CardTitle>
              <CardDescription className="text-base mt-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                {currentScenario.situation}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showFeedback ? (
                <>
                  <p className="font-semibold">What would you do?</p>
                  <div className="space-y-3">
                    {currentScenario.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleScenarioChoice(idx)}
                        className="w-full text-left p-4 rounded-lg border-2 border-zinc-200 dark:border-zinc-800 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {selectedOption !== null && (
                    <div className={`p-6 rounded-lg ${
                      currentScenario.options[selectedOption].isCorrect
                        ? "bg-green-50 dark:bg-green-950/20 border-2 border-green-500"
                        : "bg-red-50 dark:bg-red-950/20 border-2 border-red-500"
                    }`}>
                      <p className="text-lg font-semibold mb-2">
                        {currentScenario.options[selectedOption].feedback}
                      </p>
                      <p className="text-sm">
                        Points earned: <span className="font-bold">{currentScenario.options[selectedOption].points}</span>
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-500">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Learning Point
                    </p>
                    <p className="text-sm">{currentScenario.learningPoint}</p>
                  </div>

                  <Button onClick={handleNextScenario} className="w-full" size="lg">
                    {currentScenarioIndex === gameScenarios.length - 1 ? "Continue to Post-Assessment" : "Next Scenario"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results Phase
  if (phase === "results") {
    const maxScore = assessmentQuestions.length * 10;
    const improvement = calculateImprovement();
    const prePercentage = (preScore / maxScore) * 100;
    const postPercentage = (postScore / maxScore) * 100;

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">Game Complete!</CardTitle>
              <CardDescription className="text-base">
                Great job! Here's how you improved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Pre-Assessment</p>
                  <p className="text-3xl font-bold">{Math.round(prePercentage)}%</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{preScore}/{maxScore} points</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Game Score</p>
                  <p className="text-3xl font-bold text-purple-600">{gameScore}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">points earned</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Post-Assessment</p>
                  <p className="text-3xl font-bold text-green-600">{Math.round(postPercentage)}%</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{postScore}/{maxScore} points</p>
                </div>
              </div>

              <div className={`p-6 rounded-lg text-center ${
                improvement > 0 
                  ? "bg-green-100 dark:bg-green-900/20 border-2 border-green-500"
                  : improvement < 0
                  ? "bg-orange-100 dark:bg-orange-900/20 border-2 border-orange-500"
                  : "bg-blue-100 dark:bg-blue-900/20 border-2 border-blue-500"
              }`}>
                <TrendingUp className={`h-12 w-12 mx-auto mb-3 ${
                  improvement > 0 ? "text-green-600" : improvement < 0 ? "text-orange-600" : "text-blue-600"
                }`} />
                <p className="text-2xl font-bold mb-2">
                  {improvement > 0 ? "+" : ""}{improvement}% Improvement
                </p>
                <p className="text-sm">
                  {improvement > 0 
                    ? "Excellent progress! You've significantly improved your knowledge."
                    : improvement < 0
                    ? "Keep practicing! Review the learning points and try again."
                    : "You maintained your knowledge level. Try more challenging scenarios!"}
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-500">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <p className="font-semibold">Gamification Points Earned</p>
                </div>
                <p className="text-3xl font-bold text-amber-600 mb-1">
                  {Math.round((preScore + gameScore + postScore) * 1.5)} points
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Added to your total score for leaderboard ranking
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push("/games")} className="flex-1">
                  Back to Games
                </Button>
                <Button onClick={() => router.push("/dashboard")} className="flex-1">
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
