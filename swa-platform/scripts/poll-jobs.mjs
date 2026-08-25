import { adminClient } from "../packages/db/src/index.js";
const ids = [
  "3edd3160-159d-49e6-ad3b-8de9bda2ce0c",
  "f79537b4-592a-41f4-a97e-0d7b0444e8e6",
  "889fdd9e-df5b-4ea1-8442-133bb118c53f",
];
for (let i = 0; i < 12; i++) {
  await new Promise((r) => setTimeout(r, 5000));
  const { data } = await adminClient().from("jobs").select("id,status,result_url").in("id", ids);
  const line = data.map((j) => `${j.id.slice(0, 8)}:${j.status}${j.result_url ? " -> " + j.result_url.slice(-30) : ""}`).join(" | ");
  console.log(new Date().toISOString().slice(11, 19) + " " + line);
  if (data.every((j) => j.status === "done" || j.status === "failed")) break;
}
