"use client";

import { useState, useEffect } from 'react';
import { BookOpenText, ShieldAlert, CheckCircle2, Ban, Trash2, ShieldCheck, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminCommunityReports } from '@/lib/community/community-service';

export function CommunityAdmin() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getAdminCommunityReports();
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="space-y-8">
      {/* Community Moderation Header */}
      <Card className="rounded-3xl border shadow-lg bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white p-6 md:p-8">
        <div className="space-y-2">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-0 font-bold px-3 py-1 text-xs">
            Academic Community Moderation
          </Badge>
          <h2 className="font-serif text-3xl font-bold">Community Reports &amp; Content Governance</h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Review reported questions, answers, and comments. Ensure discussions remain strictly academic and compliant with community policy.
          </p>
        </div>
      </Card>

      {/* Reports Queue */}
      <Card className="rounded-3xl border shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl font-bold flex items-center gap-2">
            <Flag className="w-5 h-5 text-indigo-500" />
            Moderation Queue ({reports.length})
          </CardTitle>
          <CardDescription>
            Reported items needing administrator or moderator review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground text-sm font-medium">Loading moderation queue...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 border rounded-2xl bg-muted/20 text-muted-foreground text-sm font-medium">
              🎉 Moderation queue is clear! No active community reports.
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map(r => (
                <div key={r.id} className="p-5 rounded-2xl border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold text-destructive border-destructive">Reason: {r.reason}</Badge>
                      <Badge variant="outline" className="text-[10px] font-bold">Item: {r.item_type}</Badge>
                      <span className="text-xs text-muted-foreground">• Reported on {new Date(r.created_at).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-bold text-sm">Target ID: {r.item_id}</h4>
                    {r.details && <p className="text-xs text-muted-foreground">{r.details}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="rounded-full text-xs gap-1">
                      Dismiss
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full text-xs font-bold gap-1 text-destructive border-destructive">
                      <Trash2 className="w-3 h-3" /> Remove Content
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
