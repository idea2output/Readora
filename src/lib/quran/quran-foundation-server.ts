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
  resource_type: "translation" | "tafsir" | "reciter" | "chapter_reciter" | "language" | "chapter_info";
  source: "Quran Foundation";
  slug?: string;
  is_visible: boolean;
  imported_at: string;
  last_synced_at: string;
  sync_error?: string | null;
  audio_format?: string;
  audio_mode?: "ayah_by_ayah" | "full_surah" | "both";
  style?: string | null;
  relative_path?: string;
  is_default?: boolean;
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
  { id: "tr-131", qf_id: 131, name: "Clear Quran", author_name: "Dr. Mustafa Khattab", language_name: "English", language_code: "en", resource_type: "translation", source: "Quran Foundation", is_visible: true, is_default: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-20", qf_id: 20, name: "Saheeh International", author_name: "Saheeh International", language_name: "English", language_code: "en", resource_type: "translation", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-19", qf_id: 19, name: "M.M. Pickthall", author_name: "Marmaduke Pickthall", language_name: "English", language_code: "en", resource_type: "translation", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-84", qf_id: 84, name: "Mufti Taqi Usmani", author_name: "Mufti Taqi Usmani", language_name: "English", language_code: "en", resource_type: "translation", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-234", qf_id: 234, name: "Fath Muhammad Jalandhari", author_name: "Fath Muhammad Jalandhari", language_name: "Urdu", language_code: "ur", resource_type: "translation", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tr-31", qf_id: 31, name: "Muhammad Hamidullah", author_name: "Muhammad Hamidullah", language_name: "French", language_code: "fr", resource_type: "translation", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  
  // Tafsirs
  { id: "tf-169", qf_id: 169, name: "Tafsir Ibn Kathir (Abridged)", author_name: "Hafiz Ibn Kathir", language_name: "English", language_code: "en", resource_type: "tafsir", source: "Quran Foundation", is_visible: true, is_default: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tf-16", qf_id: 16, name: "Tafsir Muyassar", author_name: "King Fahd Quran Printing Complex", language_name: "Arabic", language_code: "ar", resource_type: "tafsir", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "tf-91", qf_id: 91, name: "Tafsir Maarif-ul-Quran", author_name: "Mufti Muhammad Shafi", language_name: "Urdu", language_code: "ur", resource_type: "tafsir", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },

  // Reciters (Ayah-by-Ayah & Full Surah)
  { id: "rec-7", qf_id: 7, name: "Mishari Rashid al-`Afasy", author_name: "Mishary Rashid Alafasy", language_name: "Arabic", language_code: "ar", resource_type: "reciter", audio_mode: "both", style: "Murattal", source: "Quran Foundation", is_visible: true, is_default: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "rec-2", qf_id: 2, name: "AbdulBaset AbdulSamad (Murattal)", author_name: "AbdulBaset AbdulSamad", language_name: "Arabic", language_code: "ar", resource_type: "reciter", audio_mode: "both", style: "Murattal", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "rec-4", qf_id: 4, name: "Abu Bakr al-Shatri", author_name: "Abu Bakr al-Shatri", language_name: "Arabic", language_code: "ar", resource_type: "reciter", audio_mode: "ayah_by_ayah", style: "Murattal", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "rec-6", qf_id: 6, name: "Mahmoud Khalil Al-Husary", author_name: "Mahmoud Khalil Al-Husary", language_name: "Arabic", language_code: "ar", resource_type: "reciter", audio_mode: "both", style: "Murattal", source: "Quran Foundation", is_visible: false, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },

  // Languages
  { id: "lang-en", qf_id: "en", name: "English", author_name: "Quran Foundation Language Pack", language_name: "English", language_code: "en", resource_type: "language", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "lang-ar", qf_id: "ar", name: "Arabic (العربية)", author_name: "Quran Foundation Language Pack", language_name: "Arabic", language_code: "ar", resource_type: "language", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
  { id: "lang-ur", qf_id: "ur", name: "Urdu (اردو)", author_name: "Quran Foundation Language Pack", language_name: "Urdu", language_code: "ur", resource_type: "language", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },

  // Chapter Information
  { id: "ch-info-en", qf_id: "info-en", name: "Surah Context & Historical Summaries (English)", author_name: "Quran.com Editorial Team", language_name: "English", language_code: "en", resource_type: "chapter_info", source: "Quran Foundation", is_visible: true, imported_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
];

let memoryResourceStore: QuranResource[] = [...DEFAULT_QF_RESOURCES];

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
 * Fetch all resources from DB / Local memory store
 */
export async function getQuranResources(): Promise<QuranResource[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("quran_resources")
      .select("*")
      .order("imported_at", { ascending: false });

    if (!error && data && data.length > 0) {
      memoryResourceStore = data as QuranResource[];
      return memoryResourceStore;
    }
  } catch (_) {}

  return memoryResourceStore;
}

/**
 * Fetch visible public resources only
 */
export async function getVisibleQuranResources(type?: string): Promise<QuranResource[]> {
  const all = await getQuranResources();
  return all.filter((r) => r.is_visible && (!type || r.resource_type === type));
}

/**
 * Toggle visibility or default status of a resource with Audit Logging
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
 * Set a resource as default for its resource type
 */
export async function setDefaultQuranResource(
  resourceId: string,
  adminId: string = "admin"
): Promise<{ success: boolean; error?: string }> {
  try {
    const all = await getQuranResources();
    const target = all.find((r) => r.id === resourceId);
    if (!target) return { success: false, error: "Resource not found" };

    for (const r of all) {
      if (r.resource_type === target.resource_type) {
        r.is_default = (r.id === resourceId);
      }
    }

    const supabase = getSupabaseClient();
    await supabase.from("quran_resources").upsert(all);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to set default resource" };
  }
}

/**
 * Refresh / Sync resources from Quran Foundation Content API v4
 */
export async function refreshQuranFoundationResources(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const currentResources = await getQuranResources();
    let updatedCount = 0;

    // 1. Fetch Translations
    try {
      const resTr = await fetch("https://api.quran.com/api/v4/resources/translations");
      if (resTr.ok) {
        const dataTr = await resTr.json();
        for (const t of dataTr.translations || []) {
          const existing = currentResources.find((r) => r.qf_id === t.id && r.resource_type === "translation");
          if (!existing) {
            currentResources.push({
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
            });
            updatedCount++;
          }
        }
      }
    } catch (_) {}

    // 2. Fetch Tafsirs
    try {
      const resTf = await fetch("https://api.quran.com/api/v4/resources/tafsirs");
      if (resTf.ok) {
        const dataTf = await resTf.json();
        for (const tf of dataTf.tafsirs || []) {
          const existing = currentResources.find((r) => r.qf_id === tf.id && r.resource_type === "tafsir");
          if (!existing) {
            currentResources.push({
              id: `tf-${tf.id}`,
              qf_id: tf.id,
              name: tf.name || tf.translated_name?.name || "Quran Tafsir",
              author_name: tf.author_name || "Islamic Scholar",
              language_name: tf.language_name || "Arabic",
              language_code: tf.language_name?.toLowerCase().slice(0, 2) || "ar",
              resource_type: "tafsir",
              source: "Quran Foundation",
              is_visible: false, // Default hidden until admin approves!
              imported_at: new Date().toISOString(),
              last_synced_at: new Date().toISOString(),
            });
            updatedCount++;
          }
        }
      }
    } catch (_) {}

    // 3. Fetch Ayah-by-Ayah Recitations
    try {
      const resRec = await fetch("https://api.quran.com/api/v4/resources/recitations");
      if (resRec.ok) {
        const dataRec = await resRec.json();
        for (const rec of dataRec.recitations || []) {
          const existing = currentResources.find((r) => r.qf_id === rec.id && r.resource_type === "reciter");
          if (!existing) {
            currentResources.push({
              id: `rec-${rec.id}`,
              qf_id: rec.id,
              name: rec.reciter_name || rec.translated_name?.name || "Quran Reciter",
              author_name: rec.reciter_name || "Qari",
              language_name: "Arabic",
              language_code: "ar",
              resource_type: "reciter",
              audio_mode: "both",
              style: rec.style || "Murattal",
              source: "Quran Foundation",
              is_visible: false, // Default hidden until admin approves!
              imported_at: new Date().toISOString(),
              last_synced_at: new Date().toISOString(),
            });
            updatedCount++;
          }
        }
      }
    } catch (_) {}

    memoryResourceStore = [...currentResources];
    const supabase = getSupabaseClient();
    await supabase.from("quran_resources").upsert(currentResources);

    return { success: true, count: updatedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || "Sync failed" };
  }
}
