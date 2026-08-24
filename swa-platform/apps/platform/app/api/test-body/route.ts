import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let rawText = "";
  try {
    rawText = await req.text();
  } catch (e) {
    rawText = `text() failed: ${String(e)}`;
  }
  let jsonBody = null;
  try {
    jsonBody = JSON.parse(rawText);
  } catch (e) {
    jsonBody = { error: "parse failed", message: String(e), rawLength: rawText.length, rawPreview: rawText.substring(0, 50) };
  }
  return NextResponse.json({ 
    rawText: rawText.substring(0, 100),
    rawLength: rawText.length,
    parsed: jsonBody,
    contentType: req.headers.get("content-type"),
    method: req.method
  });
}