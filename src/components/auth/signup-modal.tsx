"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CheckCircle2, ShieldCheck, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !userId.trim() || !email.trim() || !password.trim() || !location.trim() || submitting) {
      setErrorMsg("All fields (Full Name, User ID, Email, Password, Location) are mandatory.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            user_id_handle: userId.trim(),
            location: location.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Account created! Please check your email to verify your account before logging in.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="space-y-1 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <DialogTitle className="font-serif text-2xl font-bold">New User Signup</DialogTitle>
          <DialogDescription className="text-xs">
            Join Literary Harbor to save bookmarks, notes, and request publications. All fields are mandatory.
          </DialogDescription>
        </DialogHeader>

        {successMsg ? (
          <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <h4 className="font-bold text-sm text-green-800 dark:text-green-300">Registration Complete</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{successMsg}</p>
            <Button onClick={onClose} className="rounded-full px-6 text-xs font-bold mt-2">
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3.5 py-2">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Full Name *</label>
              <Input
                required
                placeholder="e.g. Sarah Jenkins"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-xl py-4 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">User ID / Handle *</label>
                <Input
                  required
                  placeholder="@scholar123"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="rounded-xl py-4 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Location / Country *</label>
                <Input
                  required
                  placeholder="United States, UK..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="rounded-xl py-4 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Email Address *</label>
              <Input
                required
                type="email"
                placeholder="scholar@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl py-4 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Password *</label>
              <Input
                required
                type="password"
                placeholder="At least 6 characters..."
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl py-4 text-xs"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full rounded-full py-5 text-xs font-bold gap-2 shadow-md">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create Account & Send Verification Email
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
