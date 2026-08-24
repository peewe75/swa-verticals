import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClient, createJob, getTenantBySlug } from "@swa/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  tenantSlug: z.string().optional(),
  type: z.enum(["demo_echo", "video_kenburns"]),
  payload: z.record(z.unknown()).optional(),
});

function authorized(req: Request): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return false;
  return req.headers.get("x-admin-key") === expected;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "non autorizzato" }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "payload non valido", issues: parsed.error.issues }, { status: 400 });
  }
  let tenantId: string | null = null;
  if (parsed.data.tenantSlug) {
    const tenant = await getTenantBySlug(parsed.data.tenantSlug);
    tenantId = tenant?.id ?? null;
  }
  const job = await createJob({
    tenant_id: tenantId,
    type: parsed.data.type,
    payload: parsed.data.payload,
  });
  return NextResponse.json({ job });
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "non autorizzato" }, { status: 401 });
  }
  const limit = Number(new URL(req.url).searchParams.get("limit") || 20);
  const { data, error } = await adminClient()
    .from("jobs")
    .select()
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 100));
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ jobs: data });
}
