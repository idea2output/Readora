import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { logout } from "@/app/auth/actions"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your email and membership details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Member Since</p>
            <p className="text-sm text-muted-foreground">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="pt-4">
            <form action={logout}>
              <Button variant="outline" type="submit">Sign out</Button>
            </form>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional profile settings (Theme, Reading Preferences) will go here */}
      <Card>
        <CardHeader>
          <CardTitle>Reading Preferences</CardTitle>
          <CardDescription>Customize your reading experience (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-md">
            Profile customization features are being built. You will soon be able to set default reader themes, fonts, and manage your library here.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
