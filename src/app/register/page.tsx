import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signup } from "@/app/auth/actions"
import { UserPlus } from "lucide-react"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="font-serif text-2xl font-bold">New User Registration</CardTitle>
          <CardDescription className="text-xs">
            Join Literary Harbor. All fields are mandatory.
          </CardDescription>
        </CardHeader>
        <form action={signup}>
          <CardContent className="space-y-3.5">
            {error && (
              <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-xl border border-destructive/20 font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="fullName" className="text-xs font-bold text-foreground">
                Full Name *
              </label>
              <Input id="fullName" name="fullName" placeholder="Sarah Jenkins" required className="rounded-xl py-4 text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="userId" className="text-xs font-bold text-foreground">
                  User ID / Handle *
                </label>
                <Input id="userId" name="userId" placeholder="@scholar123" required className="rounded-xl py-4 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label htmlFor="location" className="text-xs font-bold text-foreground">
                  Location / Country *
                </label>
                <Input id="location" name="location" placeholder="United States, UK..." required className="rounded-xl py-4 text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-foreground">
                Email Address *
              </label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required className="rounded-xl py-4 text-xs" />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-bold text-foreground">
                Password *
              </label>
              <Input id="password" name="password" type="password" required minLength={6} placeholder="At least 6 characters..." className="rounded-xl py-4 text-xs" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button className="w-full rounded-full py-5 text-xs font-bold shadow-md" type="submit">Create Account</Button>
            <div className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
