import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const adminKey = process.env.ADMIN_KEY;
  const len = adminKey?.length ?? 0;
  const preview = adminKey?.substring(0, 8) ?? "undefined";
  return NextResponse.json({ 
    hasAdminKey: !!adminKey, 
    adminKeyLength: len,
    adminKeyPreview: preview,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("ADMIN") || k.includes("SUPABASE")).sort()
  });
}