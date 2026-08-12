"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/app/auth/actions";
import { SignupModal } from "@/components/auth/signup-modal";
import { LogIn, UserPlus, KeyRound, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <Card className="w-full max-w-md rounded-3xl shadow-xl border">
      <CardHeader className="space-y-1 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
          <LogIn className="w-6 h-6" />
        </div>
        <CardTitle className="font-serif text-2xl font-bold">Existing User Sign In</CardTitle>
        <CardDescription className="text-xs">
          Enter your account email and password to access your User Area.
        </CardDescription>
      </CardHeader>
      <form action={login}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400">
              {message}
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-bold text-foreground">
              Email Address *
            </label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required className="rounded-xl py-5 text-xs" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-bold text-foreground">
                Password *
              </label>
              <Link href="/reset-password" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Forgot Username / Password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required className="rounded-xl py-5 text-xs" />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button className="w-full rounded-full py-5 text-xs font-bold shadow-md" type="submit">
            Sign In to User Area
          </Button>
          <div className="text-center text-xs text-muted-foreground pt-2 border-t">
            New User?{" "}
            <button
              type="button"
              onClick={() => setSignupOpen(true)}
              className="font-bold text-primary hover:underline inline-flex items-center gap-1 ml-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> Create Account (Signup)
            </button>
          </div>
        </CardFooter>
      </form>

      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Suspense fallback={
        <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          <span>Loading Sign In...</span>
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
