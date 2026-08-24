import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { adminClient, type JobRow } from "@swa/db";
import { buildKenBurnsVideo, type Overlay } from "./ffmpeg.js";
import { synthesize } from "@swa/lib-tts";

export type JobHandler = (job: JobRow) => Promise<{ resultUrl: string | null; costEur?: number }>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function handleEcho(job: JobRow): Promise<{ resultUrl: null }> {
  await sleep(1500);
  console.log(`echo: ${JSON.stringify(job.payload)}`);
  return { resultUrl: null };
}

interface KenBurnsPayload {
  images?: string[];
  overlays?: Overlay[];
  voiceText?: string;
  voiceUrl?: string;
  musicUrl?: string;
}

async function uploadRender(jobId: string, filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  const db = adminClient();
  const key = `${jobId}.mp4`;
  const { error } = await db.storage.from("renders").upload(key, buffer, {
    contentType: "video/mp4",
    upsert: true,
  });
  if (error) throw new Error(`Upload storage fallito: ${error.message}`);
  const { data } = db.storage.from("renders").getPublicUrl(key);
  return data.publicUrl;
}

async function handleKenBurns(job: JobRow): Promise<{ resultUrl: string; costEur: number }> {
  const payload = (job.payload ?? {}) as KenBurnsPayload;
  if (!payload.images?.length) throw new Error("payload.images mancante");
  const dir = await mkdtemp(path.join(tmpdir(), `job-${job.id.slice(0, 8)}-`));
  try {
    let voicePath: string | undefined;
    if (payload.voiceText) {
      const buffer = await synthesize(payload.voiceText);
      const { writeFile } = await import("node:fs/promises");
      voicePath = path.join(dir, "voice.mp3");
      await writeFile(voicePath, buffer);
    } else if (payload.voiceUrl) {
      const { download } = await import("./ffmpeg.js");
      voicePath = path.join(dir, "voice.mp3");
      await download(payload.voiceUrl, voicePath);
    }
    const musicPath = payload.musicUrl ? path.join(dir, "music.mp3") : undefined;
    if (payload.musicUrl) {
      const { download } = await import("./ffmpeg.js");
      await download(payload.musicUrl, musicPath!);
    }
    const outPath = path.join(dir, "out.mp4");
    await buildKenBurnsVideo({
      images: payload.images,
      overlays: payload.overlays,
      voicePath,
      musicPath,
      outPath,
    });
    const resultUrl = await uploadRender(job.id, outPath);
    return { resultUrl, costEur: 0 };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

const handlers: Record<string, JobHandler> = {
  demo_echo: handleEcho,
  video_kenburns: handleKenBurns,
};

export function getHandler(type: string): JobHandler | null {
  return handlers[type] ?? null;
}
