"use client";

import { useState, useEffect } from 'react';
import { 
  RefreshCw, GraduationCap, CheckCircle2, Clock, ExternalLink, 
  ShieldCheck, AlertCircle, PlayCircle, FileCheck, Layers, BookOpen, 
  Eye, CheckCircle, HelpCircle, XCircle, RotateCcw, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getOpenStaxBooks, getProviderSyncLogs } from '@/lib/providers/provider-service';

export function OpenStaxAdmin() {
  const [books, setBooks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  const [previewSummary, setPreviewSummary] = useState<any>(null);

  // Publish Confirmation Dialog State
  const [publishingBook, setPublishingBook] = useState<any | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/providers/openstax/sync');
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books || []);
        setLogs(data.logs || []);
      } else {
        const bList = await getOpenStaxBooks();
        const lList = await getProviderSyncLogs();
        setBooks(bList);
        setLogs(lList);
      }
    } catch (e) {
      console.error("Failed to load OpenStax admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePreview = async () => {
    setPreviewing(true);
    setSyncMessage("");
    try {
      const res = await fetch('/api/admin/providers/openstax/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewSummary(data.summary);
        setSyncMessage(`🔍 Catalog Discovery Preview Ready: ${data.summary.total_discovered} total titles (${data.summary.new_count} new, ${data.summary.updated_count} updates available).`);
      } else {
        setSyncMessage(`❌ ${data.error}`);
      }
    } catch (e: any) {
      setSyncMessage(`❌ ${e.message}`);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSync = async (limit?: number, dryRun: boolean = false) => {
    setSyncing(true);
    setSyncMessage("");
    if (!dryRun) setLastSyncResult(null);
    try {
      const res = await fetch('/api/admin/providers/openstax/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          triggered_by: limit ? `Admin (${limit}-Book Controlled Test)` : 'Admin Portal',
          limit,
          dryRun
        })
      });
      const data = await res.json();
      if (data.success) {
        if (dryRun) {
          setPreviewSummary(data.log?.diffSummary || null);
        } else {
          setLastSyncResult(data.log);
        }
        setSyncMessage(`✅ ${data.message}`);
        await loadData();
      } else {
        setSyncMessage(`❌ ${data.error}`);
        if (!dryRun) setLastSyncResult({ status: 'failed', error_message: data.error });
      }
    } catch (e: any) {
      setSyncMessage(`❌ ${e.message}`);
      if (!dryRun) setLastSyncResult({ status: 'failed', error_message: e.message });
    } finally {
      setSyncing(false);
    }
  };

  // Uses the existing secure admin book-status API (/api/admin/books/status)
  const handleExecuteStatusUpdate = async (bookId: string, newStatus: string) => {
    setUpdatingStatusId(bookId);
    try {
      const res = await fetch('/api/admin/books/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update_status', 
          bookId, 
          status: newStatus 
        })
      });

      if (res.ok) {
        setSyncMessage(`✅ Book status changed to ${newStatus.toUpperCase()}`);
        await loadData();
      } else {
        const errData = await res.json();
        setSyncMessage(`❌ Failed to update status: ${errData.error}`);
      }
    } catch (e: any) {
      setSyncMessage(`❌ Status update failed: ${e.message}`);
    } finally {
      setUpdatingStatusId(null);
      setPublishingBook(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* OpenStax Sync Hero Card */}
      <Card className="rounded-3xl border shadow-lg bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-0 font-bold px-3 py-1 text-xs">
                OpenStax Hybrid Architecture
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-0 font-bold px-2 py-0.5 text-[10px]">
                Link/Integrate Model
              </Badge>
            </div>
            <h2 className="font-serif text-3xl font-bold">OpenStax Catalog Discovery &amp; Synchronization</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Discover and synchronize peer-reviewed OpenStax textbooks using repository master manifests and secondary CMS verification. Newly synchronized books enter <strong>Review Pending</strong> status until approved by an administrator.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Preview Changes Button */}
            <Button 
              size="sm" 
              variant="outline"
              onClick={handlePreview} 
              disabled={previewing || syncing}
              className="rounded-full gap-2 font-bold border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs"
            >
              <Eye className={`w-3.5 h-3.5 ${previewing ? "animate-spin" : ""}`} />
              Preview Changes
            </Button>

            {/* Controlled 1-Book Test Button */}
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleSync(1, false)} 
              disabled={syncing}
              className="rounded-full gap-2 font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl text-xs"
            >
              <PlayCircle className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              TEST — Sync 1 Book
            </Button>

            {/* Controlled 5-Book Test Button */}
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleSync(5, false)} 
              disabled={syncing}
              className="rounded-full gap-2 font-bold bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-xl text-xs"
            >
              <PlayCircle className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              TEST — Sync 5 Books
            </Button>

            {/* Full Sync Button */}
            <Button 
              size="sm" 
              onClick={() => handleSync(undefined, false)} 
              disabled={syncing}
              className="rounded-full gap-2 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing Catalog..." : "Sync OpenStax Catalog"}
            </Button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl bg-blue-900/40 border border-blue-500/20 text-xs font-semibold text-blue-200">
            {syncMessage}
          </div>
        )}
      </Card>

      {/* Discovery & Preview Summary Card */}
      {previewSummary && (
        <Card className="rounded-3xl border border-indigo-500/30 bg-indigo-950/20 shadow-md">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-lg font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Catalog Discovery Analysis (Dry-Run Preview)
            </CardTitle>
            <Badge className={`border-0 text-[10px] font-bold ${
              previewSummary.cms_verified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {previewSummary.cms_verified ? 'CMS Verified' : 'Master Catalog Fallback'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 p-4 rounded-2xl bg-background/50 border">
              <div>
                <span className="text-muted-foreground uppercase text-[10px] font-bold">Total Discovered</span>
                <p className="font-bold text-base">{previewSummary.total_discovered}</p>
              </div>
              <div>
                <span className="text-muted-foreground uppercase text-[10px] font-bold">New Titles</span>
                <p className="font-bold text-base text-emerald-500">{previewSummary.new_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground uppercase text-[10px] font-bold">Updates Available</span>
                <p className="font-bold text-base text-blue-400">{previewSummary.updated_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground uppercase text-[10px] font-bold">Unchanged</span>
                <p className="font-bold text-base text-muted-foreground">{previewSummary.unchanged_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground uppercase text-[10px] font-bold">CMS Connection</span>
                <p className="font-medium text-xs text-indigo-300">
                  {previewSummary.cms_verified ? 'Online (HTTP 200)' : (previewSummary.cms_error || 'Offline Fallback')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Result Card */}
      {lastSyncResult && (
        <Card className="rounded-3xl border border-blue-500/30 bg-blue-950/20 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-lg font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-400" />
              Latest Synchronization Execution Result
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-bold">Sync Status</span>
              <div>
                <Badge className={`border-0 text-[10px] font-bold ${
                  lastSyncResult.status === 'success' || lastSyncResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-destructive/20 text-destructive'
                }`}>
                  {String(lastSyncResult.status || (lastSyncResult.success ? 'SUCCESS' : 'FAILED')).toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-bold">Books Found</span>
              <p className="font-bold text-sm">{lastSyncResult.booksFound ?? lastSyncResult.books_found ?? 0}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-bold">Books Created</span>
              <p className="font-bold text-sm text-emerald-500">{lastSyncResult.booksCreated ?? lastSyncResult.books_created ?? 0}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-bold">Books Updated</span>
              <p className="font-bold text-sm text-blue-400">{lastSyncResult.booksUpdated ?? lastSyncResult.books_updated ?? 0}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-bold">CMS Verified</span>
              <p className="font-bold text-xs text-indigo-300">{lastSyncResult.cmsVerified ? 'Yes (Online)' : 'No (Fallback)'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-bold">Triggered By</span>
              <p className="font-medium text-xs line-clamp-1">{lastSyncResult.triggered_by || 'Admin'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Synchronized OpenStax Textbooks Grid */}
      <Card className="rounded-3xl border shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-xl font-bold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            Persisted OpenStax Catalog ({books.length})
          </CardTitle>
          <CardDescription>
            Newly synchronized books enter Review Pending status until approved by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm font-medium">Querying Supabase database...</div>
          ) : books.length === 0 ? (
            <div className="text-center py-14 px-4 border rounded-2xl bg-muted/20 space-y-3">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto" />
              <h3 className="font-serif font-bold text-lg">No OpenStax books have been synchronized yet.</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Use the sync controls above to preview catalog discovery or run a controlled synchronization test. Persisted records will appear here for review.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {books.map(b => (
                <div key={b.id} className="p-5 rounded-2xl border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold">{b.subject}</Badge>
                      
                      {/* Exact Database Status Badge */}
                      <Badge className={`text-[10px] font-bold border-0 ${
                        b.sync_status === 'published' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        b.sync_status === 'rejected' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        b.sync_status === 'draft' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        STATUS: {String(b.sync_status || 'review_pending').toUpperCase().replace('_', ' ')}
                      </Badge>

                      <span className="text-xs text-muted-foreground">• License: {b.license}</span>
                    </div>

                    <h4 className="font-bold text-base leading-snug">{b.title}</h4>
                    <p className="text-xs text-muted-foreground">{b.authors?.join(', ')} • {b.edition || 'Standard Edition'}</p>
                    <p className="text-xs text-muted-foreground/80 line-clamp-1">{b.attribution_text}</p>
                  </div>

                  {/* ADMIN REVIEW / PUBLISH WORKFLOW BUTTONS */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* For Review Pending Books */}
                    {b.sync_status === 'review_pending' && (
                      <>
                        <a href={b.source_url} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1">
                            <ExternalLink className="w-3 h-3" /> Review
                          </Button>
                        </a>

                        <Button 
                          size="sm" 
                          disabled={updatingStatusId === b.id}
                          onClick={() => setPublishingBook(b)}
                          className="rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <CheckCircle className="w-3 h-3 gap-1" /> Publish
                        </Button>
                      </>
                    )}

                    {/* For Published Books */}
                    {b.sync_status === 'published' && (
                      <>
                        <a href={b.reader_url || b.source_url} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1">
                            <ExternalLink className="w-3 h-3" /> View Reader
                          </Button>
                        </a>

                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={updatingStatusId === b.id}
                          onClick={() => handleExecuteStatusUpdate(b.id, 'review_pending')}
                          className="rounded-full text-xs font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                        >
                          Unpublish
                        </Button>
                      </>
                    )}

                    {/* For Rejected Books */}
                    {b.sync_status === 'rejected' && (
                      <>
                        <a href={b.source_url} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="rounded-full text-xs gap-1">
                            <ExternalLink className="w-3 h-3" /> Review
                          </Button>
                        </a>

                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={updatingStatusId === b.id}
                          onClick={() => handleExecuteStatusUpdate(b.id, 'review_pending')}
                          className="rounded-full text-xs font-bold gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore to Review
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Publishing */}
      <Dialog open={Boolean(publishingBook)} onOpenChange={(open) => !open && setPublishingBook(null)}>
        <DialogContent className="rounded-3xl border max-w-md">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="font-serif text-xl font-bold">Confirm Book Publication</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Publish this OpenStax book to the Literary Harbour Academic catalog?
            </DialogDescription>
          </DialogHeader>

          {publishingBook && (
            <div className="p-4 rounded-2xl bg-muted/40 border space-y-1 text-xs">
              <p className="font-bold text-sm">{publishingBook.title}</p>
              <p className="text-muted-foreground">{publishingBook.authors?.join(', ')}</p>
              <p className="text-muted-foreground/80">License: {publishingBook.license}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPublishingBook(null)} className="rounded-full text-xs">
              Cancel
            </Button>
            <Button 
              disabled={Boolean(updatingStatusId)}
              onClick={() => publishingBook && handleExecuteStatusUpdate(publishingBook.id, 'published')} 
              className="rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {updatingStatusId ? 'Publishing...' : 'Publish Book'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
