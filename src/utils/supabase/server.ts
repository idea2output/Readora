import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const DEFAULT_URL = "https://dxtdkmszrgwncxuukpor.supabase.co"
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGRrbXN6cmd3bmN4dXVrcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Njg2OTgsImV4cCI6MjEwMjA0NDY5OH0.GkFXEllSK-x1Ojpa8ui69gSjRK64YbsGPaAQYRMoeio"

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}
