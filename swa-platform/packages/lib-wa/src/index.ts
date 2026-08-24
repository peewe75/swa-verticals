import { createHmac, timingSafeEqual } from "node:crypto";

const GRAPH_VERSION = "v21.0";

export interface WaIncoming {
  from: string;
  messageId: string;
  text: string;
  timestamp: string;
  name?: string;
}

function apiUrl(): string {
  const phoneId = process.env.WA_PHONE_NUMBER_ID;
  if (!phoneId) throw new Error("WA_PHONE_NUMBER_ID non impostata");
  return `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`;
}

async function waPost(body: unknown): Promise<unknown> {
  const token = process.env.WA_ACCESS_TOKEN;
  if (!token) throw new Error("WA_ACCESS_TOKEN non impostata");
  const res = await fetch(apiUrl(), {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`WhatsApp send HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

export async function sendText(to: string, body: string): Promise<unknown> {
  return waPost({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body },
  });
}

export async function sendButtons(
  to: string,
  body: string,
  buttons: { id: string; title: string }[],
): Promise<unknown> {
  return waPost({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({ type: "reply", reply: b })),
      },
    },
  });
}

export async function markRead(messageId: string): Promise<unknown> {
  return waPost({ messaging_product: "whatsapp", status: "read", message_id: messageId });
}

export function verifyTokenQuery(mode: string | null, token: string | null): boolean {
  const expected = process.env.WA_VERIFY_TOKEN;
  if (!expected) return false;
  return mode === "subscribe" && token === expected;
}

export function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.WA_APP_SECRET;
  if (!secret) return true;
  if (!header?.startsWith("sha256=")) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const received = header.slice(7);
  if (received.length !== digest.length) return false;
  return timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(digest, "hex"));
}

export function parseWebhook(payload: unknown): WaIncoming[] {
  const out: WaIncoming[] = [];
  const root = payload as { entry?: unknown[] };
  for (const entry of root.entry ?? []) {
    const changes = (entry as { changes?: unknown[] }).changes ?? [];
    for (const change of changes) {
      const value = (change as { value?: { messages?: unknown[]; contacts?: unknown[] } }).value;
      const contacts = value?.contacts ?? [];
      const name = (contacts[0] as { profile?: { name?: string } } | undefined)?.profile?.name;
      for (const msg of value?.messages ?? []) {
        const m = msg as {
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
          button?: { text?: string };
          interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
        };
        const text =
          m.text?.body ??
          m.button?.text ??
          m.interactive?.button_reply?.title ??
          m.interactive?.list_reply?.title;
        if (m.from && m.id && text) {
          out.push({
            from: m.from,
            messageId: m.id,
            text,
            timestamp: m.timestamp ?? String(Math.floor(Date.now() / 1000)),
            name,
          });
        }
      }
    }
  }
  return out;
}
