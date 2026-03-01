import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth guard disabled — all routes publicly accessible
export function proxy(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
