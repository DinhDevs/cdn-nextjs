import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils";
import { NextRequestWithUser } from "@/type";

export async function middleware(req: NextRequest) {
  console.log("middleware run");
  const token = req.cookies.get("token");

  if (!token) {
    if (req.nextUrl.pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }
  const decoded = await verifyToken(token.value);

  if (decoded) {
    (req as NextRequestWithUser).user = decoded;
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else if (req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/(.*)", "/dashboard", "/api/images/:path*", "/"],
};
