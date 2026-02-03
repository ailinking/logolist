import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) {
          return null
        }

        const user = await prisma.adminUser.findUnique({
          where: { username: credentials.username }
        })

        if (!user) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          return null
        }

        return {
          id: user.id.toString(),
          name: user.username,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role || ""
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string | undefined
          ; (session.user as { role?: string }).role = token.role as string | undefined
      }
      return session
    }
  },
  pages: {
    signIn: "/admin/login"
  }
}
