import NextAuth, { AuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma";

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) return null;

        const existingUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!existingUser || !existingUser.passwordHash) {
          return null; // ❌ No auto create, signup page handles new users
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          existingUser.passwordHash
        );
        if (!isValid) return null;

        return {
          id: existingUser.id,
          email: existingUser.email ?? "",
          name: existingUser.name ?? "",
          role: existingUser.role as Role,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  // ❌ REMOVE signIn redirect — we manually handle admin login
  pages: {
  signIn: "/login", // customer login
  error: "/login",  // customer login handles auth errors
},

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? "";
        token.name = user.name ?? "";
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email ?? "";
        session.user.name = token.name ?? "";
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
