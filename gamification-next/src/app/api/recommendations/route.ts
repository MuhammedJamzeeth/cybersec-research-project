import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface GameRecommendation {
  gameSlug: string;
  gameName: string;
  category: string;
  reason: string;
  priority: number;
  estimatedImpact: string;
}

// Game mapping based on weak areas
const GAME_RECOMMENDATIONS: Record<string, GameRecommendation[]> = {
  "location": [
    {
      gameSlug: "privacy-guardian",
      gameName: "Privacy Guardian",
      category: "location",
      reason: "Practice making decisions about location permissions in real scenarios",
      priority: 1,
      estimatedImpact: "high"
    },
    {
      gameSlug: "permission-defender",
      gameName: "Permission Defender",
      category: "location",
      reason: "Learn to identify and block risky location permission requests",
      priority: 2,
      estimatedImpact: "medium"
    }
  ],
  "storage": [
    {
      gameSlug: "data-vault",
      gameName: "Data Vault Challenge",
      category: "storage",
      reason: "Understand storage permissions and data protection strategies",
      priority: 1,
      estimatedImpact: "high"
    },
    {
      gameSlug: "file-guardian",
      gameName: "File Guardian",
      category: "storage",
      reason: "Practice securing file access and storage permissions",
      priority: 2,
      estimatedImpact: "medium"
    }
  ],
  "camera": [
    {
      gameSlug: "camera-shield",
      gameName: "Camera Shield",
      category: "camera",
      reason: "Learn when and why to grant camera access",
      priority: 1,
      estimatedImpact: "high"
    }
  ],
  "contacts": [
    {
      gameSlug: "contact-protector",
      gameName: "Contact Protector",
      category: "contacts",
      reason: "Master protecting your contacts from unauthorized access",
      priority: 1,
      estimatedImpact: "high"
    }
  ],
  "microphone": [
    {
      gameSlug: "audio-defender",
      gameName: "Audio Defender",
      category: "microphone",
      reason: "Learn to protect against unauthorized audio recording",
      priority: 1,
      estimatedImpact: "high"
    }
  ],
  "general": [
    {
      gameSlug: "permission-master",
      gameName: "Permission Master",
      category: "general",
      reason: "Comprehensive training across all permission types",
      priority: 1,
      estimatedImpact: "high"
    }
  ]
};

/**
 * Calculate game recommendations based on assessment results
 */
function calculateRecommendations(
  assessment: any,
  mlRecommendations?: string[]
): GameRecommendation[] {
  const recommendations: GameRecommendation[] = [];
  
  // Add games for weak areas
  if (assessment.weakAreas && assessment.weakAreas.length > 0) {
    assessment.weakAreas.forEach((area: string) => {
      const areaGames = GAME_RECOMMENDATIONS[area.toLowerCase()] || [];
      recommendations.push(...areaGames);
    });
  }
  
  // Add general recommendations if score is below 70%
  if (assessment.percentage < 70) {
    const generalGames = GAME_RECOMMENDATIONS["general"] || [];
    recommendations.push(...generalGames);
  }
  
  // Incorporate ML recommendations if available
  if (mlRecommendations && mlRecommendations.length > 0) {
    mlRecommendations.forEach((rec, index) => {
      recommendations.push({
        gameSlug: `ml-recommended-${index}`,
        gameName: "ML Recommended Game",
        category: "ml-personalized",
        reason: rec,
        priority: 3,
        estimatedImpact: "personalized"
      });
    });
  }
  
  // Sort by priority and remove duplicates
  const uniqueRecs = recommendations.filter((rec, index, self) =>
    index === self.findIndex((r) => r.gameSlug === rec.gameSlug)
  );
  
  return uniqueRecs.sort((a, b) => a.priority - b.priority);
}

// GET: Get game recommendations for a user based on their assessment
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

    // Get the most recent assessment for this category
    const whereClause: any = { userId };
    if (categorySlug) {
      whereClause.slug = categorySlug;
    }

    const latestAssessment = await prisma.assessment.findFirst({
      where: whereClause,
      orderBy: { completedAt: "desc" },
    });

    if (!latestAssessment) {
      return NextResponse.json(
        { error: "No assessment found", recommendations: [] },
        { status: 404 }
      );
    }

    // Calculate recommendations
    const recommendations = calculateRecommendations(
      latestAssessment,
      latestAssessment.mlRecommendations as string[] | undefined
    );

    return NextResponse.json({
      assessmentId: latestAssessment.id,
      score: latestAssessment.score,
      percentage: latestAssessment.percentage,
      knowledgeLevel: latestAssessment.knowledgeLevel,
      weakAreas: latestAssessment.weakAreas,
      recommendations,
      totalRecommendations: recommendations.length,
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

// POST: Update game recommendations after user plays games
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, categorySlug, gamesPlayed } = body;

    if (!userId || !categorySlug) {
      return NextResponse.json(
        { error: "User ID and category are required" },
        { status: 400 }
      );
    }

    // Get the latest assessment
    const latestAssessment = await prisma.assessment.findFirst({
      where: {
        userId,
        slug: categorySlug,
      },
      orderBy: { completedAt: "desc" },
    });

    if (!latestAssessment) {
      return NextResponse.json(
        { error: "No assessment found" },
        { status: 404 }
      );
    }

    // Filter out already played games from recommendations
    const currentRecommendations = calculateRecommendations(latestAssessment);
    const updatedRecommendations = currentRecommendations.filter(
      (rec) => !gamesPlayed.includes(rec.gameSlug)
    );

    return NextResponse.json({
      message: "Recommendations updated",
      remainingRecommendations: updatedRecommendations,
      gamesPlayed,
      shouldRetakeAssessment: gamesPlayed.length >= 3, // Suggest retake after 3+ games
    });
  } catch (error) {
    console.error("Update recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to update recommendations" },
      { status: 500 }
    );
  }
}
