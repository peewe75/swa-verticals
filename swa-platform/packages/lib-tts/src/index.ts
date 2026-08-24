import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface TtsOptions {
  voiceId?: string;
  model?: string;
  stability?: number;
  similarity?: number;
}

export function ttsModel(): string {
  return process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2";
}

export function cacheDir(): string {
  return path.join(process.cwd(), ".cache", "tts");
}

function cacheKey(text: string, opts: TtsOptions): string {
  const parts = [ttsModel(), opts.voiceId ?? process.env.ELEVENLABS_VOICE_ID ?? "default", text];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function synthesize(text: string, opts: TtsOptions = {}): Promise<Buffer> {
  const key = cacheKey(text, opts);
  const file = path.join(cacheDir(), `${key}.mp3`);
  try {
    return await readFile(file);
  } catch {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY non impostata");
    const voiceId = opts.voiceId ?? process.env.ELEVENLABS_VOICE_ID;
    if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID non impostata (o usa listVoices per sceglierne una)");
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "content-type": "application/json", accept: "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: ttsModel(),
        voice_settings: {
          stability: opts.stability ?? 0.45,
          similarity_boost: opts.similarity ?? 0.75,
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`ElevenLabs HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await mkdir(cacheDir(), { recursive: true });
    await writeFile(file, buffer);
    return buffer;
  }
}

export interface Voice {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
}

export async function listVoices(): Promise<Voice[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY non impostata");
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });
  if (!res.ok) throw new Error(`ElevenLabs voices HTTP ${res.status}`);
  const body = (await res.json()) as { voices?: Voice[] };
  return body.voices ?? [];
}

export async function findVoiceByName(name: string): Promise<Voice | null> {
  const voices = await listVoices();
  const lower = name.toLowerCase();
  return voices.find((v) => v.name.toLowerCase().includes(lower)) ?? null;
}
