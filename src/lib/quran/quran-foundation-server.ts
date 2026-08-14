/**
 * Server-Side Quran Foundation Content API Integration
 * Uses server-only secrets (QF_CLIENT_ID, QF_CLIENT_SECRET, QF_ENV)
 * Never exposes secrets or client tokens to browser code.
 */

import { createClient } from "@supabase/supabase-js";

export interface QuranResource {
  id: string;
  qf_id: number | string;
  name: string;
  author_name: string;
  language_name: string;
  language_code: string;
  resource_type: "translation" | "tafsir" | "reciter" | "language" | "chapter_info";
  source: "Quran Foundation";
  slug?: string;
  is_visible: boolean;
  imported_at: string;
  last_synced_at: string;
  sync_error?: string | null;
  audio_format?: string;
  relative_path?: string;
}

export interface QuranAuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_id: string;
  resource_name: string;
  details: any;
  created_at: string;
}

// Default Seed Resources from Quran Foundation
export const DEFAULT_QF_RESOURCES: QuranResource[] = [
  // Translations
  { id: "tr-131", qf_id: 131, name: "Clear Quran", author_name: "Dr. Mustafa Khattab", language_name: "English", language_code: "en", resource_type: "translation", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-20", qf_id: 20, name: "Saheeh International", author_name: "Saheeh International", language_name: "English", language_code: "en", resource_type: "translation", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-19", qf_id: 19, name: "M.M. Pickthall", author_name: "Marmaduke Pickthall", language_name: "English", language_code: "en", resource_type: "translation", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-84", qf_id: 84, name: "Mufti Taqi Usmani", author_name: "Mufti Taqi Usmani", language_name: "English", language_code: "en", resource_type: "translation", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-234", qf_id: 234, name: "Fath Muhammad Jalandhari", author_name: "Fath Muhammad Jalandhari", language_name: "Urdu", language_code: "ur", resource_type: "translation", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-31", qf_id: 31, name: "Muhammad Hamidullah", author_name: "Muhammad Hamidullah", language_name: "French", language_code: "fr", resource_type: "translation", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  
  // Tafsirs
  { id: "tf-169", qf_id: 169, name: "Tafsir Ibn Kathir (Abridged)", author_name: "Hafiz Ibn Kathir", language_name: "English", language_code: "en", resource_type: "tafsir", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tf-16", qf_id: 16, name: "Tafsir al-Jalalayn", author_name: "Jalal al-Din al-Mahalli & al-Suyuti", language_name: "Arabic", language_code: "ar", resource_type: "tafsir", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tf-14", qf_id: 14, name: "Tafsir Ibn Kathir (Arabic)", author_name: "Hafiz Ibn Kathir", language_name: "Arabic", language_code: "ar", resource_type: "tafsir", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tf-91", qf_id: 91, name: "Tafsir Maarif-ul-Quran", author_name: "Mufti Muhammad Shafi", language_name: "Urdu", language_code: "ur", resource_type: "tafsir", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },

  // Reciters
  { id: "rec-7", qf_id: 7, name: "Mishari Rashid al-`Afasy", author_name: "Mishary Rashid Alafasy", language_name: "Arabic", language_code: "ar", resource_type: "reciter", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString(), relative_path: "Alafasy_128kbps" },
  { id: "rec-4", qf_id: 4, name: "Abu Bakr al-Shatri", author_name: "Abu Bakr al-Shatri", language_name: "Arabic", language_code: "ar", resource_type: "reciter", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString(), relative_path: "Shatri_128kbps" },
  { id: "rec-6", qf_id: 6, name: "Mahmoud Khalil Al-Husary", author_name: "Mahmoud Khalil Al-Husary", language_name: "Arabic", language_code: "ar", resource_type: "reciter", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString(), relative_path: "Husary_128kbps" },
  { id: "rec-1", qf_id: 1, name: "AbdulBaset AbdulSamad (Murattal)", author_name: "AbdulBaset AbdulSamad", language_name: "Arabic", language_code: "ar", resource_type: "reciter", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString(), relative_path: "Abdul_Basit_Murattal_192kbps" },

  // Languages
  { id: "lang-en", qf_id: "en", name: "English", author_name: "Quran Foundation Language Pack", language_name: "English", language_code: "en", resource_type: "language", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "lang-ar", qf_id: "ar", name: "Arabic (العربية)", author_name: "Quran Foundation Language Pack", language_name: "Arabic", language_code: "ar", resource_type: "language", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "lang-ur", qf_id: "ur", name: "Urdu (اردو)", author_name: "Quran Foundation Language Pack", language_name: "Urdu", language_code: "ur", resource_type: "language", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "lang-fr", qf_id: "fr", name: "French (Français)", author_name: "Quran Foundation Language Pack", language_name: "French", language_code: "fr", resource_type: "language", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },

  // Chapter Information
  { id: "ch-info-en", qf_id: "info-en", name: "Surah Historical Context & Summaries (English)", author_name: "Quran.com Editorial Team", language_name: "English", language_code: "en", resource_type: "chapter_info", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "ch-info-ar", qf_id: "info-ar", name: "أسباب النزول ومقاصد السور (Arabic)", author_name: "King Fahd Quran Printing Complex", language_name: "Arabic", language_code: "ar", resource_type: "chapter_info", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
];

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";
  return createClient(url, key);
}

/**
 * Fetch Server Secrets securely (QF_CLIENT_ID / QF_CLIENT_SECRET / QF_ENV)
 */
export function getQuranFoundationServerCredentials() {
  const clientId = process.env.QF_CLIENT_ID || process.env.QURAN_FOUNDATION_CLIENT_ID || "";
  const clientSecret = process.env.QF_CLIENT_SECRET || process.env.QURAN_FOUNDATION_CLIENT_SECRET || "";
  const env = process.env.QF_ENV || "production";

  return { clientId, clientSecret, env };
}

/**
 * Get OAuth token from Quran Foundation API using client credentials flow
 */
export async function getQuranFoundationAccessToken(): Promise<string | null> {
  const { clientId, clientSecret } = getQuranFoundationServerCredentials();
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://oauth2.quran.foundation/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials&scope=openid",
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      return data.access_token || null;
    }
  } catch (err) {
    console.error("Failed OAuth token retrieval from Quran Foundation:", err);
  }
  return null;
}

/**
 * Fetch all resources from DB / Local cache
 */
export async function getQuranResources(): Promise<QuranResource[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("quran_resources")
      .select("*")
      .order("imported_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as QuranResource[];
    }
  } catch (_) {}

  return DEFAULT_QF_RESOURCES;
}

/**
 * Fetch visible public resources only
 */
export async function getVisibleQuranResources(type?: string): Promise<QuranResource[]> {
  const all = await getQuranResources();
  return all.filter((r) => r.is_visible && (!type || r.resource_type === type));
}

/**
 * Toggle visibility of a resource with Audit Logging
 */
export async function toggleQuranResourceVisibility(
  resourceId: string,
  isVisible: boolean,
  adminId: string = "admin"
): Promise<{ success: boolean; resource?: QuranResource; error?: string }> {
  try {
    const all = await getQuranResources();
    const target = all.find((r) => r.id === resourceId);

    if (!target) {
      return { success: false, error: "Resource not found" };
    }

    target.is_visible = isVisible;
    target.last_synced_at = new Date().toISOString();

    const supabase = getSupabaseClient();

    // Upsert into quran_resources
    await supabase.from("quran_resources").upsert([target]);

    // Insert into quran_resource_audit_logs
    await supabase.from("quran_resource_audit_logs").insert([
      {
        admin_id: adminId,
        action: isVisible ? "MARK_VISIBLE" : "MARK_HIDDEN",
        resource_id: resourceId,
        resource_name: target.name,
        details: { previous_state: !isVisible, new_state: isVisible },
        created_at: new Date().toISOString(),
      },
    ]);

    return { success: true, resource: target };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update visibility" };
  }
}

/**
 * Refresh / Sync resources from Quran Foundation Content API v4
 */
export async function refreshQuranFoundationResources(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const res = await fetch("https://api.quran.com/api/v4/resources/translations?language=en");
    if (!res.ok) {
      return { success: false, count: 0, error: `Quran Foundation API returned ${res.status}` };
    }

    const data = await res.json();
    const apiTranslations = data.translations || [];

    const currentResources = await getQuranResources();
    let updatedCount = 0;

    for (const t of apiTranslations.slice(0, 10)) {
      const existing = currentResources.find((r) => r.qf_id === t.id);
      if (!existing) {
        const newResource: QuranResource = {
          id: `tr-${t.id}`,
          qf_id: t.id,
          name: t.name || t.translated_name?.name || "Quran Translation",
          author_name: t.author_name || "Quran Foundation Contributor",
          language_name: t.language_name || "English",
          language_code: t.language_name?.toLowerCase().slice(0, 2) || "en",
          resource_type: "translation",
          source: "Quran Foundation",
          is_visible: false, // Default hidden until admin approves!
          imported_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
        };
        currentResources.unshift(newResource);
        updatedCount++;
      }
    }

    const supabase = getSupabaseClient();
    await supabase.from("quran_resources").upsert(currentResources);

    return { success: true, count: updatedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || "Sync failed" };
  }
}
