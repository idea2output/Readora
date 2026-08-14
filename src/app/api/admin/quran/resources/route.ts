import { NextResponse } from "next/server";
import {
  getQuranResources,
  toggleQuranResourceVisibility,
  setDefaultQuranResource,
  refreshQuranFoundationResources,
  getQuranFoundationServerCredentials,
} from "@/lib/quran/quran-foundation-server";

export async function GET() {
  try {
    const resources = await getQuranResources();
    const creds = getQuranFoundationServerCredentials();
    return NextResponse.json({
      success: true,
      resources,
      hasCredentials: Boolean(creds.clientId && creds.clientSecret),
      env: creds.env,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, resourceId, isVisible, adminId } = body;

    if (action === "toggle_visibility") {
      const result = await toggleQuranResourceVisibility(resourceId, isVisible, adminId || "admin");
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, resource: result.resource });
    }

    if (action === "set_default") {
      const result = await setDefaultQuranResource(resourceId, adminId || "admin");
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const updated = await getQuranResources();
      return NextResponse.json({ success: true, resources: updated });
    }

    if (action === "refresh") {
      const result = await refreshQuranFoundationResources();
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      const updated = await getQuranResources();
      return NextResponse.json({ success: true, count: result.count, resources: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
