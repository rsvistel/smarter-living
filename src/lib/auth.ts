import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth/next"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your backend to authenticate user
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            return {
              id: data.user?.id?.toString() || data.userId?.toString(),
              email: data.user?.email || data.email,
              name: data.user?.name || data.name || data.user?.email || data.email,
              backendToken: data.token, // Store the backend JWT token
            }
          }
        } catch (error) {
          console.error('Authentication error:', error)
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn() {
      return true
    },
    async session({ session, token }) {
      // Add userId and backend token to session
      if (token.sub) {
        session.userId = parseInt(token.sub)
      }
      if (token.backendToken) {
        (session as any).backendToken = token.backendToken
      }
      return session
    },
    async jwt({ token, user }) {
      // Persist the user id and backend token right after signin
      if (user) {
        token.sub = user.id
        token.backendToken = (user as any).backendToken
      }
      return token
    }
  },
  session: {
    strategy: "jwt",
  },
}

export const getAuthSession = () => getServerSession(authOptions)

declare module "next-auth" {
  interface Session {
    userId?: number
  }
}