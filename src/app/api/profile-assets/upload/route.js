import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { PROFILE_ASSETS_BUCKET } from "@/lib/supabaseProfile";

const cleanSegment = (value = "") =>
  value
    .toString()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = cleanSegment(formData.get("folder") || "profiles");
    const namePrefix = cleanSegment(formData.get("namePrefix") || "asset");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "A file is required" }, { status: 400 });
    }

    const extension = file.name?.split(".").pop() || "bin";
    const path = `${folder}/${namePrefix}_${Date.now()}_${crypto.randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.storage
      .from(PROFILE_ASSETS_BUCKET)
      .upload(path, buffer, {
        cacheControl: "3600",
        contentType: file.type || undefined,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(PROFILE_ASSETS_BUCKET).getPublicUrl(path);
    return NextResponse.json({ path, publicUrl: data.publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Profile asset upload failed:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
