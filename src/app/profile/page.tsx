import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { logout } from "@/app/auth/actions"
import { User, MapPin, Mail, Calendar, ShieldCheck, LogOut, BookOpen } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const meta = user.user_metadata || {};
  const fullName = meta.full_name || "Scholar Reader";
  const userHandle = meta.user_id_handle || `@user_${user.id.substring(0, 6)}`;
  const location = meta.location || "Global";

  return (
    <div className="container mx-auto max-w-4xl p-4 py-10 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Badge className="bg-primary/20 text-white border-0 font-semibold px-3 py-1 text-xs">
            User Area & Personal Harbor
          </Badge>
          <h1 className="font-serif text-3xl font-bold tracking-tight">{fullName}</h1>
          <p className="text-xs text-slate-300 font-mono">{userHandle}</p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit" className="rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-bold gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-serif font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Mandatory User Profile Data
            </CardTitle>
            <CardDescription className="text-xs">Your verified registration parameters</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 pt-2 text-xs">
            <div className="flex justify-between p-3 rounded-2xl bg-muted/40 border">
              <span className="text-muted-foreground font-semibold">Full Name:</span>
              <span className="font-bold text-foreground">{fullName}</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-muted/40 border">
              <span className="text-muted-foreground font-semibold">User ID / Handle:</span>
              <span className="font-bold text-primary font-mono">{userHandle}</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-muted/40 border">
              <span className="text-muted-foreground font-semibold flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location / Country:</span>
              <span className="font-bold text-foreground">{location}</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-muted/40 border">
              <span className="text-muted-foreground font-semibold flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email Address:</span>
              <span className="font-bold text-foreground truncate max-w-[160px]">{user.email}</span>
            </div>
            <div className="flex justify-between p-3 rounded-2xl bg-muted/40 border">
              <span className="text-muted-foreground font-semibold flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Account Activated:</span>
              <span className="font-bold text-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-serif font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Personal Library & Rights
            </CardTitle>
            <CardDescription className="text-xs">Your reading bookmarks and research activity</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span>Verification Status</span>
                <Badge className="bg-green-500 text-white text-[10px]">Verified Account</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your email address has been verified. You can access all public-domain literature, open-access academic publications, and submit book requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
