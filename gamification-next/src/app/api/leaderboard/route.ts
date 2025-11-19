import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get all assessments grouped by user
    const assessments = await prisma.assessment.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Calculate leaderboard statistics
    const userStats = new Map<string, {
      username: string;
      totalScore: number;
      assessmentCount: number;
      averageScore: number;
    }>();

    assessments.forEach((assessment: any) => {
      const username = assessment.user.username;
      const current = userStats.get(username) || {
        username,
        totalScore: 0,
        assessmentCount: 0,
        averageScore: 0,
      };

      current.totalScore += assessment.score * 10; // 10 points per percentage
      current.assessmentCount += 1;
      current.averageScore = assessment.score;

      userStats.set(username, current);
    });

    // Convert to array and calculate average scores
    const leaderboard = Array.from(userStats.values())
      .map((user) => ({
        ...user,
        averageScore: Math.round(user.totalScore / (user.assessmentCount * 10)),
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 100) // Top 100
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
