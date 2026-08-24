import http from "node:http";
import { claimNextJob, completeJob, failJob } from "@swa/db";
import { getHandler } from "./handlers.js";

const PORT = Number(process.env.RENDERER_PORT || 8080);
const POLL_MS = Number(process.env.RENDERER_POLL_MS || 5000);

let busy = false;

async function tick(): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    const job = await claimNextJob();
    if (!job) return;
    console.log(`[${new Date().toISOString()}] job ${job.id} tipo=${job.type} claim (tentativo ${job.attempts})`);
    const handler = getHandler(job.type);
    if (!handler) {
      await failJob(job.id, `Nessun handler per tipo "${job.type}"`);
      return;
    }
    try {
      const { resultUrl, costEur } = await handler(job);
      await completeJob(job.id, resultUrl ?? null, costEur ?? 0);
      console.log(`[${new Date().toISOString()}] job ${job.id} completato -> ${resultUrl ?? "ok"}`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] job ${job.id} fallito:`, err);
      if (job.attempts < 2) {
        const { adminClient } = await import("@swa/db");
        await adminClient()
          .from("jobs")
          .update({ status: "queued", error: String(err).slice(0, 2000) })
          .eq("id", job.id);
      } else {
        await failJob(job.id, String(err));
      }
    }
  } catch (err) {
    console.error("tick error:", err);
  } finally {
    busy = false;
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, busy, ts: new Date().toISOString() }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`renderer in ascolto su :${PORT} (poll ogni ${POLL_MS}ms)`);
  setInterval(tick, POLL_MS);
  tick();
});
