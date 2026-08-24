import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

export interface Overlay {
  text: string;
  from: number;
  to: number;
  size?: number;
  yRatio?: number;
}

export interface KenBurnsOptions {
  images: string[];
  overlays?: Overlay[];
  voicePath?: string;
  musicPath?: string;
  outPath: string;
  width?: number;
  height?: number;
  clipDuration?: number;
  fade?: number;
  fps?: number;
}

const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const FONT_FALLBACK = "C\\:/Windows/Fonts/arialbd.ttf";

export async function download(url: string, dest: string): Promise<string> {
  if (!/^https?:\/\//i.test(url)) return url;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download fallito ${url}: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const { writeFile } = await import("node:fs/promises");
  await writeFile(dest, buffer);
  return dest;
}

function fontFile(): string {
  return process.platform === "win32" ? FONT_FALLBACK : FONT;
}

export function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\u2019")
    .replace(/%/g, "\\%");
}

function runFfmpeg(args: string[], timeoutMs = 600_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    const timer = setTimeout(() => {
      proc.kill("SIGKILL");
      reject(new Error(`ffmpeg timeout dopo ${timeoutMs}ms`));
    }, timeoutMs);
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 20_000) stderr = stderr.slice(-10_000);
    });
    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    proc.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-2000)}`));
    });
  });
}

export async function buildKenBurnsVideo(opts: KenBurnsOptions): Promise<string> {
  const width = opts.width ?? 1080;
  const height = opts.height ?? 1920;
  const fps = opts.fps ?? 30;
  const clipDuration = opts.clipDuration ?? 3.6;
  const fade = opts.fade ?? 0.4;
  const frames = Math.round(clipDuration * fps);
  const total = opts.images.length * clipDuration - (opts.images.length - 1) * fade;

  const tmpDir = path.dirname(opts.outPath);
  await mkdir(tmpDir, { recursive: true });

  const localImages: string[] = [];
  for (let i = 0; i < opts.images.length; i++) {
    const ext = path.extname(new URL(opts.images[i]).pathname) || ".jpg";
    const dest = path.join(tmpDir, `img-${i}${ext}`);
    localImages.push(await download(opts.images[i], dest));
  }

  const args: string[] = ["-y"];
  for (const img of localImages) {
    args.push("-loop", "1", "-t", String(clipDuration), "-i", img);
  }
  if (opts.voicePath) args.push("-i", opts.voicePath);
  if (opts.musicPath) args.push("-i", opts.musicPath);

  const filters: string[] = [];
  const bigW = width * 2;
  const bigH = height * 2;

  localImages.forEach((_, i) => {
    const zoomIn = i % 2 === 0;
    const zExpr = zoomIn
      ? `min(1+0.12*on/${frames},1.12)`
      : `max(1.12-0.12*on/${frames},1.0)`;
    filters.push(
      `[${i}:v]scale=${bigW}:${bigH}:force_original_aspect_ratio=increase,crop=${bigW}:${bigH},` +
        `zoompan=z='${zExpr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=${fps},` +
        `format=yuv420p,setsar=1[v${i}]`,
    );
  });

  let lastLabel = "v0";
  for (let i = 1; i < localImages.length; i++) {
    const offset = i * (clipDuration - fade);
    const outLabel = `x${i}`;
    filters.push(`[${lastLabel}][v${i}]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(2)}[${outLabel}]`);
    lastLabel = outLabel;
  }

  const overlays = opts.overlays ?? [];
  let videoOut = lastLabel;
  if (overlays.length) {
    videoOut = "vover";
    const chain = overlays
      .map((ov) => {
        const size = ov.size ?? 64;
        const y = `h*${(ov.yRatio ?? 0.78).toFixed(2)}`;
        return (
          `drawtext=fontfile='${fontFile()}':text='${escapeDrawtext(ov.text)}':` +
          `fontsize=${size}:fontcolor=white:borderw=4:bordercolor=black@0.85:box=1:boxcolor=black@0.45:boxborderw=24:` +
          `x=(w-text_w)/2:y=${y}:enable='between(t,${ov.from},${ov.to})'`
        );
      })
      .join(",");
    filters.push(`[${lastLabel}]${chain}[${videoOut}]`);
  }

  const voiceIndex = localImages.length;
  const musicIndex = voiceIndex + (opts.voicePath ? 1 : 0);
  let audioOut: string | null = null;
  if (opts.voicePath && opts.musicPath) {
    audioOut = "a";
    filters.push(
      `[${voiceIndex}:a]apad[vp]`,
      `[${musicIndex}:a]volume=0.22[mu]`,
      `[vp][mu]amix=inputs=2:duration=longest,atrim=0:${total.toFixed(2)}[${audioOut}]`,
    );
  } else if (opts.voicePath) {
    audioOut = "a";
    filters.push(`[${voiceIndex}:a]apad,atrim=0:${total.toFixed(2)}[${audioOut}]`);
  } else if (opts.musicPath) {
    audioOut = "a";
    filters.push(`[${musicIndex}:a]volume=0.22,atrim=0:${total.toFixed(2)}[${audioOut}]`);
  }

  args.push("-filter_complex", filters.join(";"));
  if (audioOut) args.push("-map", `[${videoOut}]`, "-map", `[${audioOut}]`);
  else args.push("-map", `[${videoOut}]`);
  args.push(
    "-t",
    total.toFixed(2),
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "21",
    "-pix_fmt",
    "yuv420p",
    "-r",
    String(fps),
  );
  if (audioOut) args.push("-c:a", "aac", "-b:a", "192k");
  args.push("-movflags", "+faststart", opts.outPath);

  await runFfmpeg(args, 10 * 60_000);
  const info = await stat(opts.outPath);
  if (info.size < 10_000) throw new Error(`Output sospetto: ${info.size} bytes`);
  return opts.outPath;
}

export async function ffmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn("ffmpeg", ["-version"]);
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
}

export { runFfmpeg };
