import { mkdtemp, readdir, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildKenBurnsVideo, runFfmpeg } from "../infra/vps-renderer/src/ffmpeg.js";

async function main() {
  const dir = await mkdtemp(path.join(tmpdir(), "kenburns-test-"));
  console.log(`dir: ${dir}`);
  const colors = ["0x2244aa", "0xaa4422", "0x22aa66", "0x8822aa"];
  const images: string[] = [];
  for (let i = 0; i < colors.length; i++) {
    const img = path.join(dir, `test-${i}.jpg`);
    await runFfmpeg([
      "-y",
      "-f",
      "lavfi",
      "-i",
      `color=c=${colors[i]}:s=1920x1080:d=1`,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      img,
    ]);
    images.push(img);
  }
  const outPath = path.join(dir, "out.mp4");
  const start = Date.now();
  await buildKenBurnsVideo({
    images,
    outPath,
    overlays: [
      { text: "VW Golf 7 TDI 2021", from: 0.5, to: 4, size: 72, yRatio: 0.12 },
      { text: "89.000 km — EUR 18.500", from: 4, to: 9, size: 88 },
      { text: "Richiedi info su WhatsApp", from: 9.5, to: 12.5, size: 56, yRatio: 0.85 },
    ],
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const info = await stat(outPath);
  const files = await readdir(dir);
  console.log(`OK: out.mp4 ${(info.size / 1024 / 1024).toFixed(2)} MB in ${elapsed}s`);
  console.log(`file: ${outPath}`);
  console.log(`contenuto dir: ${files.join(", ")}`);
  await rm(dir, { recursive: true, force: true }).catch(() => {});
}

main().catch((err) => {
  console.error("TEST FALLITO:", err);
  process.exit(1);
});
