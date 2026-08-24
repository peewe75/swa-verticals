import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body = null;
  try {
    body = await req.json();
  } catch (e) {
    body = { error: "parse failed", message: String(e) };
  }
  return NextResponse.json({ 
    received: body,
    contentType: req.headers.get("content-type"),
    method: req.method
  });
}