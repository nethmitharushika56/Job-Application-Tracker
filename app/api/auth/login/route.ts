import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const userRecord = await findUserByEmail(email);
    if (!userRecord) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, userRecord.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      createdAt: userRecord.createdAt,
    };

    const sessionToken = createSessionToken(user);

    const response = NextResponse.json({
      user,
      message: "Logged in successfully!",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to sign in. Please check your credentials." },
      { status: 500 }
    );
  }
}
