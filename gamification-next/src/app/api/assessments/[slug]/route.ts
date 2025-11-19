import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Check if user has completed a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.findFirst({
      where: {
        userId,
        slug,
      },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json(
      { hasCompleted: !!assessment, assessment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check assessment error:", error);
    return NextResponse.json(
      { error: "Failed to check assessment" },
      { status: 500 }
    );
  }
}
