"use client";

import { useCallback, useEffect, useState } from "react";

interface Job {
  id: string;
  type: string;
  status: string;
  result_url: string | null;
  error: string | null;
  created_at: string;
}

const JOB_TYPES = [
  { value: "demo_echo", label: "demo_echo (test catena)" },
  { value: "video_kenburns", label: "video_kenburns (video 9:16)" },
];

export default function Console() {
  const [adminKey, setAdminKey] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [type, setType] = useState("demo_echo");
  const [message, setMessage] = useState("hello dalla console");
  const [images, setImages] = useState("");
  const [overlays, setOverlays] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [musicUrl, setMusicUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("adminKey");
    if (saved) setAdminKey(saved);
  }, []);

  const loadJobs = useCallback(async () => {
    if (!adminKey) return;
    const res = await fetch("/api/jobs?limit=20", { headers: { "x-admin-key": adminKey } });
    if (res.ok) {
      const body = await res.json();
      setJobs(body.jobs ?? []);
    }
  }, [adminKey]);

  useEffect(() => {
    loadJobs();
    const timer = setInterval(loadJobs, 5000);
    return () => clearInterval(timer);
  }, [loadJobs]);

  async function createJob() {
    setBusy(true);
    setNotice("");
    try {
      let payload: Record<string, unknown> = {};
      if (type === "demo_echo") {
        payload = { message };
      } else {
        const imgs = images.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
        if (!imgs.length) throw new Error("Serve almeno un URL immagine");
        payload = {
          images: imgs,
          ...(overlays.trim() ? { overlays: JSON.parse(overlays) } : {}),
          ...(voiceText.trim() ? { voiceText } : {}),
          ...(musicUrl.trim() ? { musicUrl } : {}),
        };
      }
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ tenantSlug: "demo-motors", type, payload }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? String(body));
      setNotice(`Job creato: ${body.job.id}`);
      await loadJobs();
    } catch (err) {
      setNotice(`Errore: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1>SWA Console</h1>
      <p className="sub">
        Pipeline verticale: crea job → worker li esegue → risultati su Supabase Storage. Demo dental:{" "}
        <a href="/dental">/dental</a>
      </p>

      <div className="card">
        <label>ADMIN_KEY (salvata solo nel browser)</label>
        <input
          type="password"
          value={adminKey}
          onChange={(e) => {
            setAdminKey(e.target.value);
            localStorage.setItem("adminKey", e.target.value);
          }}
          placeholder="ADMIN_KEY da .env"
        />
      </div>

      <div className="card">
        <label>Tipo job</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {JOB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {type === "demo_echo" ? (
          <>
            <label>Messaggio</label>
            <input value={message} onChange={(e) => setMessage(e.target.value)} />
          </>
        ) : (
          <>
            <label>URL immagini (uno per riga, 8-12 consigliate)</label>
            <textarea
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder={"https://esempio.com/foto1.jpg\nhttps://esempio.com/foto2.jpg"}
            />
            <label>Overlays JSON (opzionale)</label>
            <textarea
              value={overlays}
              onChange={(e) => setOverlays(e.target.value)}
              placeholder={'[{"text":"EUR 18.500","from":3,"to":8,"size":84}]'}
            />
            <label>Voce (testo TTS, opzionale)</label>
            <textarea
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              placeholder="Golf 7 TDI, 2021, 89 mila chilometri, full optional..."
            />
            <label>URL musica (opzionale)</label>
            <input value={musicUrl} onChange={(e) => setMusicUrl(e.target.value)} placeholder="https://.../music.mp3" />
          </>
        )}

        <button onClick={createJob} disabled={busy || !adminKey}>
          {busy ? "Creazione..." : "Crea job"}
        </button>
        {notice && <p style={{ marginTop: 12, fontSize: 13, color: "#8b95b8" }}>{notice}</p>}
      </div>

      <h2>Job recenti</h2>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>creato</th>
              <th>tipo</th>
              <th>stato</th>
              <th>risultato</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>{new Date(j.created_at).toLocaleTimeString("it-IT")}</td>
                <td>{j.type}</td>
                <td>
                  <span className={`badge ${j.status}`}>{j.status}</span>
                  {j.error && <div style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{j.error.slice(0, 120)}</div>}
                </td>
                <td>
                  {j.result_url ? (
                    <a href={j.result_url} target="_blank" rel="noreferrer">
                      mp4
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {!jobs.length && (
              <tr>
                <td colSpan={4} style={{ color: "#8b95b8" }}>
                  Nessun job. Imposta ADMIN_KEY e crea il primo (demo_echo).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
