import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category, gameSlug, preScore, gameScore, postScore, improvement, completedAt } = body;

    // Save game result
    const gameResult = await prisma.gameResult.create({
      data: {
        userId,
        category,
        gameSlug,
        preScore,
        gameScore,
        postScore,
        improvement,
        completedAt: new Date(completedAt),
      },
    });

    // Update user's total points in assessment (for leaderboard)
    const totalPoints = Math.round((preScore + gameScore + postScore) * 1.5);
    
    // Find or create a "game-progress" assessment entry
    const existingProgress = await prisma.assessment.findFirst({
      where: {
        userId,
        slug: "game-progress"
      }
    });

    if (existingProgress) {
      await prisma.assessment.update({
        where: { id: existingProgress.id },
        data: {
          score: existingProgress.score + totalPoints,
        }
      });
    } else {
      await prisma.assessment.create({
        data: {
          userId,
          categoryId: "games",
          slug: "game-progress",
          score: totalPoints,
          answers: [],
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      gameResult,
      pointsEarned: totalPoints 
    }, { status: 201 });
  } catch (error) {
    console.error("Save game result error:", error);
    return NextResponse.json(
      { error: "Failed to save game result" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const gameResults = await prisma.gameResult.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });

    return NextResponse.json({ gameResults }, { status: 200 });
  } catch (error) {
    console.error("Get game results error:", error);
    return NextResponse.json(
      { error: "Failed to fetch game results" },
      { status: 500 }
    );
  }
}
