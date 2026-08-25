import { adminClient } from "../packages/db/src/index.js";
const id = process.argv[2] || "f0cd6464-4b0a-4a1b-987b-672ffbed8998";
for (let i = 0; i < 12; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const { data } = await adminClient().from("jobs").select("status,result_url").eq("id", id).single();
  console.log(new Date().toISOString().slice(11, 19), data.status, (data.result_url || "").slice(-40));
  if (data.status === "done" || data.status === "failed") break;
}
