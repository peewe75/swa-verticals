import { NextResponse } from "next/server";
import type { ChatMsg } from "@swa/lib-llm";
import { adminClient, getTenantBySlug, type TenantRow } from "@swa/db";
import { markRead, parseWebhook, sendText, verifySignature, verifyTokenQuery } from "@swa/lib-wa";
import { dentalTurn, type DentalConfig } from "@/lib/dental-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  if (verifyTokenQuery(mode, token)) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "firma non valida" }, { status: 401 });
  }
  const incoming = parseWebhook(JSON.parse(raw));
  if (!incoming.length) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const tenant = await getTenantBySlug("demo-dental");
  if (!tenant) {
    return NextResponse.json({ error: "tenant non trovato" }, { status: 500 });
  }
  const db = adminClient();

  for (const msg of incoming) {
    const { data: conversation } = await db
      .from("conversations")
      .upsert(
        {
          tenant_id: tenant.id,
          channel: "whatsapp",
          wa_id: msg.from,
        },
        { onConflict: "tenant_id,channel,wa_id" }
      )
      .select()
      .single();

    const conversationId = conversation.id;
    const { data: historyRows } = await db
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("ts", { ascending: true })
      .limit(20);
    const history: ChatMsg[] = (historyRows ?? []).map((r) => ({
      role: r.role as ChatMsg["role"],
      content: r.content,
    }));

    await db.from("messages").insert({ conversation_id: conversationId, role: "user", content: msg.text });
    await markRead(msg.messageId).catch(() => {});

    let turn;
    try {
      turn = await dentalTurn(dentalConfig(tenant), history, msg.text, history.length === 0);
    } catch {
      turn = {
        reply: "Mi dispiace, in questo momento riscontro un problema tecnico. Provo subito a farsi richiamare dallo staff.",
        escalated: true,
      };
    }

    await db.from("messages").insert({ conversation_id: conversationId, role: "assistant", content: turn.reply });
    if (turn.escalated) {
      await db.from("conversations").update({ escalated: true }).eq("id", conversationId);
      await db.from("leads").insert({
        tenant_id: tenant.id,
        vertical: "dental",
        source: "whatsapp-urgency",
        name: msg.name ?? null,
        phone: msg.from,
        intent: { last_message: msg.text },
        score: 80,
      });
    }
    await db
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    await sendText(msg.from, turn.reply).catch((err) => {
      console.error("invio WhatsApp fallito:", err);
    });
  }

  return NextResponse.json({ ok: true, processed: incoming.length });
}
