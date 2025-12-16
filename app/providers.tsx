"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress NextAuth errors in console during development
    const originalError = console.error
    const originalWarn = console.warn
    
    const shouldSuppress = (message: any) => {
      const msgStr = message?.toString() || ""
      return (
        msgStr.includes("ClientFetchError") ||
        msgStr.includes("Unexpected end of JSON input") ||
        msgStr.includes("autherror") ||
        msgStr.includes("Failed to execute 'json' on 'Response'") ||
        msgStr.includes("errors.authjs.dev")
      )
    }

    console.error = (...args) => {
      if (shouldSuppress(args[0])) {
        // Silently handle NextAuth errors - they're expected when NEXTAUTH_SECRET is missing
        return
      }
      originalError(...args)
    }

    console.warn = (...args) => {
      if (shouldSuppress(args[0])) {
        // Silently handle NextAuth warnings
        return
      }
      originalWarn(...args)
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      {children}
    </SessionProvider>
  )
}

