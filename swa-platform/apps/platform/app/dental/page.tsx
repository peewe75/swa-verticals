"use client";

import { useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
  escalated?: boolean;
}

export default function DentalChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    const history = messages;
    setMessages([...history, { role: "user", content: text }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tenantSlug: "demo-dental", history, message: text }),
      });
      const body = await res.json();
      const reply = body.reply ?? body.error ?? "Errore imprevisto";
      setMessages([...history, { role: "user", content: text }, { role: "assistant", content: reply, escalated: body.escalated }]);
    } catch (err) {
      setMessages([
        ...history,
        { role: "user", content: text },
        { role: "assistant", content: `Errore di rete: ${String(err)}` },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 50);
    }
  }

  return (
    <main className="chat">
      <h1>Receptionist AI — Studio Demo</h1>
      <p className="sub">
        Prova: &quot;quanto costa una pulizia?&quot; poi &quot;mi fa male un dente&quot; per vedere l&apos;escalation.
      </p>
      <div className="chat-log" ref={logRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.content}
            {m.escalated && <div className="esc">→ escalation allo staff registrata</div>}
          </div>
        ))}
        {busy && <div className="bubble assistant">…</div>}
        {!messages.length && !busy && (
          <div className="bubble assistant">
            Ciao! Sono l&apos;assistente virtuale dello Studio Dentistico Demo. Come posso aiutarti?
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Scrivi un messaggio..."
          disabled={busy}
        />
        <button onClick={send} disabled={busy || !input.trim()} style={{ marginTop: 0 }}>
          Invia
        </button>
      </div>
    </main>
  );
}
