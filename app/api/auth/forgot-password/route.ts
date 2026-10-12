import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetCode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { code, user } = await createPasswordResetCode(email);

    return NextResponse.json({
      success: true,
      message: "Verification code generated successfully.",
      code,
      email: user.email,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process password reset." },
      { status: error.message?.includes("No account found") ? 404 : 500 }
    );
  }
}
