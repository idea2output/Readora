import type { Metadata } from "next"
import { Inter, Merriweather } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Prevent Next.js 16 setImmediate assignment TypeError on Cloudflare Workers
if (typeof globalThis !== "undefined") {
  try {
    const orig = globalThis.setImmediate;
    Object.defineProperty(globalThis, "setImmediate", {
      value: orig || ((fn: Function, ...args: any[]) => setTimeout(fn, 0, ...args)),
      writable: true,
      configurable: true,
    });
  } catch (_) {}
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Literary Harbor — Safe Harbor for the World's Literature",
  description: "A global, rights-aware digital library providing lawful access to public-domain literature, open-access academic books, and open educational resources.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://literaryharbor.org",
    title: "Literary Harbor — Safe Harbor for the World's Literature",
    description: "Discover, read, study, and request legally reusable literature and open academic knowledge.",
    siteName: "Literary Harbor",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${merriweather.variable} min-h-screen bg-background font-sans antialiased flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
