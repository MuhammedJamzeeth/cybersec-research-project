import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, gender, education_level, proficiency, organization } = await request.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate demographic fields if provided
    if (gender && !['Male', 'Female'].includes(gender)) {
      return NextResponse.json(
        { error: "Gender must be 'Male' or 'Female'" },
        { status: 400 }
      );
    }

    if (education_level && !['O/L', 'A/L', 'HND', 'Degree'].includes(education_level)) {
      return NextResponse.json(
        { error: "Education level must be 'O/L', 'A/L', 'HND', or 'Degree'" },
        { status: 400 }
      );
    }

    if (proficiency && !['School', 'High Education'].includes(proficiency)) {
      return NextResponse.json(
        { error: "Proficiency must be 'School' or 'High Education'" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        gender: gender || null,
        education_level: education_level || null,
        proficiency: proficiency || null,
        organization: organization || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        gender: true,
        education_level: true,
        proficiency: true,
        organization: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { user, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
