import { mkdir } from "node:fs/promises";
import path from "node:path";
import { buildKenBurnsVideo, runFfmpeg } from "../infra/vps-renderer/src/ffmpeg.js";

async function main() {
  const dir = path.join(process.cwd(), ".cache", "sample-video");
  await mkdir(dir, { recursive: true });
  const images: string[] = [];
  for (let i = 0; i < 6; i++) {
    const img = path.join(dir, `frame-${i}.jpg`);
    await runFfmpeg([
      "-y",
      "-f",
      "lavfi",
      "-i",
      `color=c=0x${(0x2255aa + i * 0x031507).toString(16).padStart(6, "0")}:s=1920x1080:d=1`,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      img,
    ]);
    images.push(img);
  }
  const outPath = path.join(dir, "sample.mp4");
  await buildKenBurnsVideo({
    images,
    outPath,
    overlays: [
      { text: "VW Golf 7 TDI 2021", from: 0.5, to: 5, size: 72, yRatio: 0.12 },
      { text: "89.000 km — EUR 18.500", from: 5, to: 11, size: 88 },
      { text: "Richiedi info su WhatsApp", from: 12, to: 18.5, size: 56, yRatio: 0.85 },
    ],
  });
  console.log(outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
