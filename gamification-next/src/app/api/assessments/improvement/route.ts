import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Get assessment history and improvement metrics for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const categorySlug = searchParams.get("category");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Build query
    const whereClause: any = { userId };
    if (categorySlug) {
      whereClause.slug = categorySlug;
    }

    // Get all assessments for the user, ordered by completion date
    const assessments = await prisma.assessment.findMany({
      where: whereClause,
      orderBy: { completedAt: "asc" },
    });

    if (assessments.length === 0) {
      return NextResponse.json({
        message: "No assessments found",
        assessments: [],
        canRetake: false,
      });
    }

    // Calculate improvement metrics
    const firstAttempt = assessments[0];
    const latestAttempt = assessments[assessments.length - 1];
    const totalImprovement = latestAttempt.percentage - firstAttempt.percentage;

    // Calculate improvement between consecutive attempts
    const improvementData = assessments.map((assessment, index) => {
      if (index === 0) {
        return {
          attemptNumber: assessment.attemptNumber,
          score: assessment.score,
          percentage: assessment.percentage,
          knowledgeLevel: assessment.knowledgeLevel,
          improvement: 0,
          completedAt: assessment.completedAt,
        };
      }

      const previousAssessment = assessments[index - 1];
      const improvement = assessment.percentage - previousAssessment.percentage;

      return {
        attemptNumber: assessment.attemptNumber,
        score: assessment.score,
        percentage: assessment.percentage,
        knowledgeLevel: assessment.knowledgeLevel,
        improvement: Math.round(improvement * 100) / 100,
        completedAt: assessment.completedAt,
      };
    });

    // Check if user can retake (e.g., after 24 hours or after playing games)
    const lastAttemptDate = new Date(latestAttempt.completedAt);
    const hoursSinceLastAttempt = 
      (Date.now() - lastAttemptDate.getTime()) / (1000 * 60 * 60);
    const canRetake = hoursSinceLastAttempt >= 1; // Allow retake after 1 hour for demo

    return NextResponse.json({
      totalAttempts: assessments.length,
      firstAttempt: {
        score: firstAttempt.score,
        percentage: firstAttempt.percentage,
        date: firstAttempt.completedAt,
      },
      latestAttempt: {
        score: latestAttempt.score,
        percentage: latestAttempt.percentage,
        date: latestAttempt.completedAt,
        weakAreas: latestAttempt.weakAreas,
      },
      totalImprovement: Math.round(totalImprovement * 100) / 100,
      improvementPercentage: firstAttempt.percentage > 0 
        ? Math.round((totalImprovement / firstAttempt.percentage) * 100 * 100) / 100
        : 0,
      improvementData,
      canRetake,
      hoursSinceLastAttempt: Math.round(hoursSinceLastAttempt * 10) / 10,
    });
  } catch (error) {
    console.error("Get improvement data error:", error);
    return NextResponse.json(
      { error: "Failed to get improvement data" },
      { status: 500 }
    );
  }
}

// POST: Submit a retake assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      categorySlug,
      score,
      percentage,
      knowledgeLevel,
      weakAreas,
      answers,
      mlData, // ML model predictions and recommendations
    } = body;

    if (!userId || !categorySlug || score === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the previous assessment
    const previousAssessment = await prisma.assessment.findFirst({
      where: {
        userId,
        slug: categorySlug,
      },
      orderBy: { completedAt: "desc" },
    });

    // Calculate attempt number and improvement
    const attemptNumber = previousAssessment 
      ? previousAssessment.attemptNumber + 1 
      : 1;
    
    const improvement = previousAssessment
      ? percentage - previousAssessment.percentage
      : 0;

    // Create new assessment record
    const newAssessment = await prisma.assessment.create({
      data: {
        userId,
        categoryId: categorySlug,
        slug: categorySlug,
        answers: answers || [],
        score,
        percentage,
        knowledgeLevel: knowledgeLevel || "Beginner",
        weakAreas: weakAreas || [],
        recommendedGames: [], // Will be calculated by recommendation endpoint
        attemptNumber,
        previousAttemptId: previousAssessment?.id,
        previousScore: previousAssessment?.score,
        improvement: Math.round(improvement * 100) / 100,
        mlRecommendations: mlData?.recommendations || [],
        mlAwarenessLevel: mlData?.awarenessLevel,
        mlConfidence: mlData?.confidence,
        detailedFeedback: mlData?.detailedFeedback || {},
      },
    });

    // Calculate if user has improved
    const hasImproved = improvement > 0;
    const significantImprovement = improvement >= 10; // 10% or more

    return NextResponse.json({
      success: true,
      assessment: newAssessment,
      attemptNumber,
      improvement: Math.round(improvement * 100) / 100,
      hasImproved,
      significantImprovement,
      message: hasImproved
        ? `Great job! You improved by ${Math.round(improvement)}%`
        : attemptNumber > 1
        ? "Keep practicing! Try playing more games to improve your knowledge."
        : "This is your first attempt. Play games to improve!",
      previousScore: previousAssessment?.percentage,
      currentScore: percentage,
    });
  } catch (error) {
    console.error("Submit retake assessment error:", error);
    return NextResponse.json(
      { error: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}
