import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const adminKey = process.env.ADMIN_KEY;
  const len = adminKey?.length ?? 0;
  return NextResponse.json({ 
    hasAdminKey: !!adminKey, 
    adminKeyLength: len,
    adminKeyFull: adminKey,
    adminKeyChars: adminKey?.split('').map((c, i) => `${i}: '${c}' (${c.charCodeAt(0)})`).join(', ')
  });
}