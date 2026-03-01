import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Lightweight config — no Prisma, safe to use in Edge middleware
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [
    // Credentials provider stub — full authorize logic lives in auth.ts
    Credentials({ credentials: {}, authorize: async () => null }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/api/auth");

      if (isPublic) return true;
      if (isLoggedIn) return true;
      return false; // redirect to login
    },
  },
};
