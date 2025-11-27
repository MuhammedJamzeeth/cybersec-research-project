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
  // App Permission areas
  location: [
    {
      gameSlug: "privacy-guardian",
      gameName: "Privacy Guardian",
      category: "location",
      reason:
        "Practice making decisions about location permissions in real scenarios",
      priority: 1,
      estimatedImpact: "high",
    },
    {
      gameSlug: "permission-defender",
      gameName: "Permission Defender",
      category: "location",
      reason: "Learn to identify and block risky location permission requests",
      priority: 2,
      estimatedImpact: "medium",
    },
  ],
  storage: [
    {
      gameSlug: "data-vault",
      gameName: "Data Vault Challenge",
      category: "storage",
      reason: "Understand storage permissions and data protection strategies",
      priority: 1,
      estimatedImpact: "high",
    },
    {
      gameSlug: "file-guardian",
      gameName: "File Guardian",
      category: "storage",
      reason: "Practice securing file access and storage permissions",
      priority: 2,
      estimatedImpact: "medium",
    },
  ],
  camera: [
    {
      gameSlug: "camera-shield",
      gameName: "Camera Shield",
      category: "camera",
      reason: "Learn when and why to grant camera access",
      priority: 1,
      estimatedImpact: "high",
    },
  ],
  contacts: [
    {
      gameSlug: "contact-protector",
      gameName: "Contact Protector",
      category: "contacts",
      reason: "Master protecting your contacts from unauthorized access",
      priority: 1,
      estimatedImpact: "high",
    },
  ],
  microphone: [
    {
      gameSlug: "audio-defender",
      gameName: "Audio Defender",
      category: "microphone",
      reason: "Learn to protect against unauthorized audio recording",
      priority: 1,
      estimatedImpact: "high",
    },
  ],
  permissions: [
    {
      gameSlug: "permission-master",
      gameName: "Permission Master",
      category: "permissions",
      reason: "Comprehensive training on app permission management",
      priority: 1,
      estimatedImpact: "high",
    },
  ],

  // Phishing Detection areas
  phishing: [
    {
      gameSlug: "phishing-detective",
      gameName: "Phishing Detective",
      category: "phishing",
      reason:
        "Improve your ability to identify phishing emails and scam attempts",
      priority: 1,
      estimatedImpact: "high",
    },
    {
      gameSlug: "email-security-challenge",
      gameName: "Email Security Challenge",
      category: "phishing",
      reason: "Practice spotting suspicious emails and links",
      priority: 2,
      estimatedImpact: "high",
    },
  ],
  email: [
    {
      gameSlug: "email-security-challenge",
      gameName: "Email Security Challenge",
      category: "email",
      reason: "Master safe email practices and threat detection",
      priority: 1,
      estimatedImpact: "high",
    },
  ],

  // Password Security areas
  password: [
    {
      gameSlug: "password-fortress",
      gameName: "Password Fortress",
      category: "password",
      reason: "Learn to create and manage strong, secure passwords",
      priority: 1,
      estimatedImpact: "high",
    },
    {
      gameSlug: "credential-guardian",
      gameName: "Credential Guardian",
      category: "password",
      reason:
        "Practice password security best practices and password manager usage",
      priority: 2,
      estimatedImpact: "medium",
    },
  ],

  // Social Engineering areas
  social: [
    {
      gameSlug: "social-engineering-defense",
      gameName: "Social Engineering Defense",
      category: "social",
      reason: "Recognize and defend against social engineering tactics",
      priority: 1,
      estimatedImpact: "high",
    },
    {
      gameSlug: "manipulation-awareness",
      gameName: "Manipulation Awareness",
      category: "social",
      reason: "Learn to identify psychological manipulation techniques",
      priority: 2,
      estimatedImpact: "high",
    },
  ],
  privacy: [
    {
      gameSlug: "privacy-guardian",
      gameName: "Privacy Guardian",
      category: "privacy",
      reason:
        "Protect your personal information from social engineering attacks",
      priority: 1,
      estimatedImpact: "high",
    },
  ],

  // Device Security areas
  device: [
    {
      gameSlug: "device-lockdown",
      gameName: "Device Lockdown",
      category: "device",
      reason: "Secure your devices against unauthorized access and malware",
      priority: 1,
      estimatedImpact: "high",
    },
    {
      gameSlug: "security-settings-master",
      gameName: "Security Settings Master",
      category: "device",
      reason: "Configure optimal security settings for your devices",
      priority: 2,
      estimatedImpact: "medium",
    },
  ],
  security: [
    {
      gameSlug: "security-fundamentals",
      gameName: "Security Fundamentals",
      category: "security",
      reason: "Build a strong foundation in device and network security",
      priority: 1,
      estimatedImpact: "high",
    },
  ],

  // General fallback
  general: [
    {
      gameSlug: "cybersecurity-essentials",
      gameName: "Cybersecurity Essentials",
      category: "general",
      reason: "Comprehensive training across all security domains",
      priority: 1,
      estimatedImpact: "high",
    },
  ],
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
        estimatedImpact: "personalized",
      });
    });
  }

  // Sort by priority and remove duplicates
  const uniqueRecs = recommendations.filter(
    (rec, index, self) =>
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
