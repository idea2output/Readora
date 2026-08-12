import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/app/auth/actions";
import { KeyRound, ArrowLeft } from "lucide-react";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="font-serif text-2xl font-bold">Account Recovery</CardTitle>
          <CardDescription className="text-xs">
            Forgot your Username or Password? Enter your registered email address below to receive password reset & account details.
          </CardDescription>
        </CardHeader>
        <form action={resetPassword}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-xl border border-destructive/20 font-semibold">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400 font-semibold">
                {message}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-foreground">
                Registered Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="scholar@university.edu"
                required
                className="rounded-xl py-5 text-xs"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button className="w-full rounded-full py-5 text-xs font-bold shadow-md" type="submit">
              Send Account Recovery Email
            </Button>
            <div className="text-center text-xs">
              <Link href="/login" className="font-bold text-primary hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
