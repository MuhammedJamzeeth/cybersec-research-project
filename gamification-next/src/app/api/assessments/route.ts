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
    const { userId, categoryId, slug, answers, score } = await request.json();

    // Validate input
    if (!userId || !categoryId || !slug || !answers || score === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if assessment already exists for this user and category
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        userId,
        slug,
      },
    });

    let assessment;

    if (existingAssessment) {
      // Update existing assessment
      assessment = await prisma.assessment.update({
        where: { id: existingAssessment.id },
        data: {
          answers,
          score,
          completedAt: new Date(),
        },
      });
    } else {
      // Create new assessment
      assessment = await prisma.assessment.create({
        data: {
          userId,
          categoryId,
          slug,
          answers,
          score,
        },
      });
    }

    return NextResponse.json(
      { assessment, message: "Assessment saved successfully" },
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
