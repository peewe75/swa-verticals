import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

async function check(name: string, fn: () => Promise<string>): Promise<CheckResult> {
  try {
    const detail = await fn();
    return { name, ok: true, detail };
  } catch (err) {
    return { name, ok: false, detail: String(err).slice(0, 200) };
  }
}

async function main() {
  const results: CheckResult[] = [];

  results.push(
    await check("env: SUPABASE_URL", async () => {
      if (!process.env.SUPABASE_URL) throw new Error("manca");
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("manca SERVICE_ROLE_KEY");
      return "presenti";
    }),
  );

  results.push(
    await check("supabase: connessione + tabelle", async () => {
      const { adminClient } = await import("@swa/db");
      const { error } = await adminClient().from("tenants").select("slug").limit(1);
      if (error) throw new Error(error.message);
      return "tenants raggiungibile (schema applicato)";
    }),
  );

  results.push(
    await check("llm: structured output (Agnes/OpenAI-compat)", async () => {
      if (!process.env.LLM_API_KEY) throw new Error("LLM_API_KEY manca (skip)");
      const { structured } = await import("@swa/lib-llm");
      const { z } = await import("zod");
      const { data, model } = await structured(
        [
          {
            role: "system",
            content: "Rispondi SOLO con un oggetto JSON valido.",
          },
          { role: "user", content: 'Genera {"titolo": string, "prezzo": number} per un annuncio di una Golf 2021 da 89000 km a 18500 EUR.' },
        ],
        z.object({ titolo: z.string(), prezzo: z.number() }),
      );
      return `${model}: "${data.titolo}" / ${data.prezzo}`;
    }),
  );

  results.push(
    await check("tts: ElevenLabs voce italiana", async () => {
      if (!process.env.ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY manca (skip)");
      const tts = await import("@swa/lib-tts");
      let voiceId = process.env.ELEVENLABS_VOICE_ID;
      if (!voiceId) {
        const voice = await tts.findVoiceByName("Sarah");
        if (!voice) throw new Error("nessuna voce trovata: imposta ELEVENLABS_VOICE_ID");
        voiceId = voice.voice_id;
      }
      const buffer = await tts.synthesize("Ciao, questa è una prova della voce italiana per gli annunci.", { voiceId });
      const dir = path.join(process.cwd(), ".cache", "tts");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, "smoke.mp3"), buffer);
      return `${(buffer.length / 1024).toFixed(0)} KB -> .cache/tts/smoke.mp3`;
    }),
  );

  results.push(
    await check("ffmpeg: disponibile", async () => {
      return new Promise<string>((resolve, reject) => {
        const proc = spawn("ffmpeg", ["-version"]);
        let out = "";
        proc.stdout.on("data", (c) => (out += c));
        proc.on("error", () => reject(new Error("ffmpeg non nel PATH")));
        proc.on("close", (code) => (code === 0 ? resolve(out.split("\n")[0]) : reject(new Error("ffmpeg exit " + code))));
      });
    }),
  );

  results.push(
    await check("gemini: chiave presente", async () => {
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY manca (skip)");
      return "presente (edit image non testato per non consumare quota)";
    }),
  );

  console.log("\nSWA Platform — smoke test\n");
  for (const r of results) {
    const icon = r.ok ? "PASS" : "FAIL";
    console.log(`[${icon}] ${r.name}: ${r.detail}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} check superati\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("smoke error:", err);
  process.exit(1);
});
