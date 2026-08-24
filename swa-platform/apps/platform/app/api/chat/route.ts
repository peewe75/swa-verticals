import { NextResponse } from "next/server";
import { z } from "zod";
import type { ChatMsg } from "@swa/lib-llm";
import { getTenantBySlug, type TenantRow } from "@swa/db";
import { dentalTurn, type DentalConfig } from "@/lib/dental-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  tenantSlug: z.string().default("demo-dental"),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(20)
    .default([]),
  message: z.string().min(1).max(2000),
});

function dentalConfig(tenant: TenantRow): DentalConfig {
  const cfg = tenant.config_json as Partial<DentalConfig>;
  return {
    studio_name: cfg.studio_name ?? tenant.name,
    city: cfg.city ?? "Italia",
    orari: cfg.orari ?? "lun-ven 9:00-13:00 e 14:30-19:00",
    servizi: cfg.servizi ?? ["Controllo", "Igiene"],
    prezzi_indicativi: cfg.prezzi_indicativi ?? {},
    tono: cfg.tono ?? "professionale",
  };
}

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "payload non valido" }, { status: 400 });
  }
  const tenant = await getTenantBySlug(parsed.data.tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "tenant non trovato" }, { status: 404 });
  }
  try {
    const history: ChatMsg[] = parsed.data.history;
    const isFirstTurn = history.length === 0;
    const turn = await dentalTurn(dentalConfig(tenant), history, parsed.data.message, isFirstTurn);
    return NextResponse.json(turn);
  } catch (err) {
    return NextResponse.json(
      { error: "errore agente", detail: String(err).slice(0, 300) },
      { status: 500 },
    );
  }
}
