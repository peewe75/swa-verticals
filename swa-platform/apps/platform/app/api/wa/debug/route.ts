import { NextResponse } from "next/server";
import { verifyTokenQuery } from "@swa/lib-wa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  const expected = process.env.WA_VERIFY_TOKEN;
  return NextResponse.json({
    mode,
    token,
    challenge,
    expectedToken: expected,
    tokenMatch: token === expected,
    tokenLen: token?.length,
    expectedLen: expected?.length,
    envKeys: Object.keys(process.env).filter(k => k.startsWith("WA_")).sort(),
  });
}