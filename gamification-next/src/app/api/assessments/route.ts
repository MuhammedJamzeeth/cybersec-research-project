import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Retrieve assessments for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const assessments = await prisma.assessment.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({ assessments }, { status: 200 });
  } catch (error) {
    console.error("Get assessments error:", error);
    return NextResponse.json(
      { error: "Failed to get assessments" },
      { status: 500 }
    );
  }
}

// POST: Create a new assessment
export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      categoryId, 
      slug, 
      answers, 
      score,
      percentage,
      knowledgeLevel,
      weakAreas,
      mlData 
    } = await request.json();

    // Validate input
    if (!userId || !categoryId || !slug || !answers || score === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Calculate percentage if not provided (assuming max score of 50 for 10 questions)
    const calculatedPercentage = percentage !== undefined 
      ? percentage 
      : (score / 50) * 100;

    // Determine knowledge level if not provided
    const calculatedKnowledgeLevel = knowledgeLevel || 
      (calculatedPercentage >= 80 ? 'Advanced' : 
       calculatedPercentage >= 60 ? 'Intermediate' : 'Beginner');

    // Check if this is a retake
    const previousAssessment = await prisma.assessment.findFirst({
      where: {
        userId,
        slug,
      },
      orderBy: { completedAt: 'desc' },
    });

    let assessment;

    if (previousAssessment) {
      // This is a retake - calculate improvement
      const improvement = calculatedPercentage - previousAssessment.percentage;
      const attemptNumber = previousAssessment.attemptNumber + 1;

      assessment = await prisma.assessment.create({
        data: {
          userId,
          categoryId,
          slug,
          answers,
          score,
          percentage: calculatedPercentage,
          knowledgeLevel: calculatedKnowledgeLevel,
          weakAreas: weakAreas || [],
          recommendedGames: [],
          attemptNumber,
          previousAttemptId: previousAssessment.id,
          previousScore: previousAssessment.score,
          improvement: Math.round(improvement * 100) / 100,
          mlRecommendations: mlData?.recommendations || [],
          mlAwarenessLevel: mlData?.awarenessLevel,
          mlConfidence: mlData?.confidence,
          detailedFeedback: mlData?.detailedFeedback || {},
        },
      });
    } else {
      // First attempt - create new assessment
      assessment = await prisma.assessment.create({
        data: {
          userId,
          categoryId,
          slug,
          answers,
          score,
          percentage: calculatedPercentage,
          knowledgeLevel: calculatedKnowledgeLevel,
          weakAreas: weakAreas || [],
          recommendedGames: [],
          attemptNumber: 1,
          mlRecommendations: mlData?.recommendations || [],
          mlAwarenessLevel: mlData?.awarenessLevel,
          mlConfidence: mlData?.confidence,
          detailedFeedback: mlData?.detailedFeedback || {},
        },
      });
    }

    return NextResponse.json(
      { 
        assessment, 
        message: "Assessment saved successfully",
        isRetake: !!previousAssessment,
        improvement: previousAssessment ? assessment.improvement : 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save assessment error:", error);
    return NextResponse.json(
      { error: "Failed to save assessment" },
      { status: 500 }
    );
  }
}
