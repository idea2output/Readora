"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, UserPlus, Mail, ShieldCheck, Trash2 } from "lucide-react";

interface OrgMember {
  id: string;
  email: string;
  name: string;
  role: string;
  joinedAt: string;
}

export default function OrganizationPage() {
  const [orgName, setOrgName] = useState("Oxford Academic Library");
  const [maxSeats, setMaxSeats] = useState(100);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  const [members, setMembers] = useState<OrgMember[]>([
    { id: "1", email: "admin@oxford.edu", name: "Prof. Sarah Jenkins", role: "Owner", joinedAt: "2026-08-01" },
    { id: "2", email: "m.ross@oxford.edu", name: "Michael Ross", role: "Admin", joinedAt: "2026-08-05" },
    { id: "3", email: "e.clarke@oxford.edu", name: "Emma Clarke", role: "Member", joinedAt: "2026-08-10" },
  ]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || sendingInvite) return;

    setSendingInvite(true);
    setInviteMsg("");
    try {
      // Simulate/Send invitation via email service
      await new Promise(r => setTimeout(r, 1000));
      setMembers(prev => [
        ...prev,
        {
          id: String(Date.now()),
          email: inviteEmail.trim(),
          name: inviteEmail.split("@")[0],
          role: "Member",
          joinedAt: "Pending",
        }
      ]);
      setInviteMsg(`✅ Invitation sent to ${inviteEmail}!`);
      setInviteEmail("");
    } catch (err: any) {
      setInviteMsg(`❌ Failed to send invitation.`);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Organization Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge className="bg-primary/20 text-white border-0 font-semibold">
            Institutional Account Portal
          </Badge>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight">
            {orgName}
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            Manage your organization members, invite scholars and students, and monitor seat usage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Seat Usage & Invite Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl shadow-sm border p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Seat Allocation
            </h3>
            <div className="p-4 rounded-2xl bg-muted/50 border space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Occupied Seats</span>
                <span className="text-primary">{members.length} / {maxSeats}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all"
                  style={{ width: `${(members.length / maxSeats) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Your Institutional Subscription includes {maxSeats} member seats.
              </p>
            </div>
          </Card>

          {/* Invite Member Card */}
          <Card className="rounded-3xl shadow-sm border p-6 space-y-4">
            <h3 className="font-serif font-bold text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Invite Member
            </h3>
            <form onSubmit={handleSendInvite} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Institutional Email Address
                </label>
                <Input
                  type="email"
                  placeholder="student@university.edu..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="rounded-xl text-xs py-5"
                />
              </div>

              {inviteMsg && (
                <p className="text-xs font-semibold text-primary">{inviteMsg}</p>
              )}

              <Button type="submit" disabled={sendingInvite} className="w-full rounded-full py-5 text-xs font-bold">
                Send Invitation
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Member List Table (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl shadow-sm border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Active Members ({members.length})
              </h3>
            </div>

            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="p-3.5 rounded-2xl border bg-card flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold">{member.name}</h4>
                    <p className="text-muted-foreground text-[11px]">{member.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={member.role === 'Owner' ? 'default' : 'secondary'} className="text-[10px]">
                      {member.role}
                    </Badge>
                    {member.role !== 'Owner' && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member.id)}
                        className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
