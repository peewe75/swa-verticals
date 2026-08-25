import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { adminClient, type JobRow } from "@swa/db";
import { buildKenBurnsVideo, download, labelImage, type Overlay } from "./ffmpeg.js";
import { synthesize } from "@swa/lib-tts";
import { enhanceRealEstate, virtualStaging } from "@swa/lib-gemini";

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

async function uploadToStorage(key: string, filePath: string, contentType: string): Promise<string> {
  const buffer = await readFile(filePath);
  const db = adminClient();
  const { error } = await db.storage.from("renders").upload(key, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload storage fallito: ${error.message}`);
  const { data } = db.storage.from("renders").getPublicUrl(key);
  return data.publicUrl;
}

async function uploadRender(jobId: string, filePath: string): Promise<string> {
  return uploadToStorage(`${jobId}.mp4`, filePath, "video/mp4");
}

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
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

interface EnhancePayload {
  imageUrl?: string;
}

async function handleEnhance(job: JobRow): Promise<{ resultUrl: string; costEur: number }> {
  const payload = (job.payload ?? {}) as EnhancePayload;
  if (!payload.imageUrl) throw new Error("payload.imageUrl mancante");
  const dir = await mkdtemp(path.join(tmpdir(), `job-${job.id.slice(0, 8)}-`));
  try {
    const srcPath = path.join(dir, "src.jpg");
    await download(payload.imageUrl, srcPath);
    const imageBase64 = (await readFile(srcPath)).toString("base64");
    const { buffer, mime } = await enhanceRealEstate(imageBase64);
    const ext = extFromMime(mime);
    const outPath = path.join(dir, `out.${ext}`);
    await writeFile(outPath, buffer);
    const resultUrl = await uploadToStorage(`${job.id}.${ext}`, outPath, mime);
    return { resultUrl, costEur: 0 };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

interface StagingPayload {
  imageUrl?: string;
  roomType?: string;
  style?: string;
}

const AI_ACT_LABEL = "Immagine arredata virtualmente con AI — a scopo illustrativo";

async function handleStaging(job: JobRow): Promise<{ resultUrl: string; costEur: number }> {
  const payload = (job.payload ?? {}) as StagingPayload;
  if (!payload.imageUrl) throw new Error("payload.imageUrl mancante");
  const roomType = payload.roomType ?? "stanza";
  const style = payload.style ?? "modern-minimal";
  const dir = await mkdtemp(path.join(tmpdir(), `job-${job.id.slice(0, 8)}-`));
  try {
    const srcPath = path.join(dir, "src.jpg");
    await download(payload.imageUrl, srcPath);
    const imageBase64 = (await readFile(srcPath)).toString("base64");
    const { buffer, mime } = await virtualStaging(imageBase64, roomType, style);
    const ext = extFromMime(mime);
    const rawPath = path.join(dir, `raw.${ext}`);
    await writeFile(rawPath, buffer);
    const labeledPath = path.join(dir, `out.${ext}`);
    await labelImage(rawPath, labeledPath, AI_ACT_LABEL);
    const resultUrl = await uploadToStorage(`${job.id}.${ext}`, labeledPath, mime);
    return { resultUrl, costEur: 0 };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

const handlers: Record<string, JobHandler> = {
  demo_echo: handleEcho,
  video_kenburns: handleKenBurns,
  enhance: handleEnhance,
  staging: handleStaging,
};

export function getHandler(type: string): JobHandler | null {
  return handlers[type] ?? null;
}
