import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import AppleProvider from "next-auth/providers/apple"

// Check for required environment variables
const envSecret = process.env.NEXTAUTH_SECRET?.trim()
if (!envSecret || envSecret === "") {
  console.error(
    "❌ ERROR: NEXTAUTH_SECRET is not set or is empty. Please add it to your .env.local file."
  )
  console.error(
    "   Generate one with: openssl rand -base64 32"
  )
}

// Create a fallback secret for development if missing or empty (not recommended for production)
// This allows the app to run without crashing, but authentication won't work properly
const secret = (envSecret && envSecret !== "") 
  ? envSecret 
  : (process.env.NODE_ENV === "development" 
      ? "development-secret-key-change-in-production-min-32-chars-long-enough" 
      : undefined)

const authOptions = {
  secret: secret,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || "",
      clientSecret: process.env.APPLE_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/', // Use the home page as sign-in page
  },
  callbacks: {
    async session({ session, token }) {
      // You can add custom data to the session here if needed
      return session
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

