import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  department: string | null;
  image: string | null;
};

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
  interface User {
    role: Role;
    department: string | null;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const hash = hashPassword(password);
        if (hash !== user.passwordHash) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.department = token.department as string | null;
      }
      return session;
    },
  },
});

export function canEdit(role: Role): boolean {
  return role === "ADMIN" || role === "PLANNER";
}

export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}
