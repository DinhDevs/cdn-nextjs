import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "@/lib/utils";
import users from "./credential.json";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = users.find((u) => u.email === email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = await generateToken({ email: user.email });

  const response = NextResponse.json({ message: "Login successful" });
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 60 * 60 * 24 * 3, // 3 days
    sameSite: "strict",
    path: "/",
  });

  return response;
}
