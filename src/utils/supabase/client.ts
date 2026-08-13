import { createBrowserClient } from "@supabase/ssr"

const DEFAULT_URL = "https://dxtdkmszrgwncxuukpor.supabase.co"
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGRrbXN6cmd3bmN4dXVrcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0Njg2OTgsImV4cCI6MjEwMjA0NDY5OH0.GkFXEllSK-x1Ojpa8ui69gSjRK64YbsGPaAQYRMoeio"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY
  return createBrowserClient(url, key)
}
