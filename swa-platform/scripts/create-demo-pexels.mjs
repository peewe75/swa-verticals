import { createJob } from "../packages/db/src/index.js";

const PEXELS_KEY = process.env.PEXELS_API_KEY || "YkBdBGVF3hPm5IlYk4AJOotJDC4jvNXLWFawnF5ALKe7i18clo0Q1HJn";

async function pexels(query, perPage = 4) {
  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`, {
    headers: { Authorization: PEXELS_KEY },
  });
  if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.photos.map((p) => p.src.large2x || p.src.large);
}

const demos = [
  {
    slug: "realty-navigli-v2",
    tenantSlug: "demo-realty",
    query: "modern apartment interior luxury",
    overlays: [
      { text: "Bilocale 75mq — Navigli", from: 0.5, to: 5, size: 52, yRatio: 0.12 },
      { text: "€285.000 — Classe C", from: 5, to: 10.5, size: 64 },
      { text: "Terrazzo 12mq — Visita su appuntamento", from: 11, to: 16.5, size: 46, yRatio: 0.85 },
    ],
    voiceText: "Bilocale di 75 metri quadri ai Navigli, secondo piano con ascensore, terrazzo di 12 metri, classe energetica C, prezzo 285 mila euro. Contatta l'agenzia per una visita.",
  },
  {
    slug: "dental-milano-v2",
    tenantSlug: "demo-dental",
    query: "dental clinic modern",
    overlays: [
      { text: "Studio Demo — Milano", from: 0.5, to: 5, size: 56, yRatio: 0.12 },
      { text: "Igiene 89€ — Controllo gratis", from: 5, to: 10.5, size: 52 },
      { text: "Prenota su WhatsApp 24/7", from: 11, to: 16.5, size: 48, yRatio: 0.85 },
    ],
    voiceText: "Studio Dentistico Demo a Milano, igiene professionale a 89 euro, controllo gratuito, prenota su WhatsApp 24 ore su 24 con la nostra receptionist AI.",
  },
  {
    slug: "motors-golf-v2",
    tenantSlug: "demo-motors",
    query: "vw golf gti car",
    overlays: [
      { text: "VW Golf 7 TDI 2021", from: 0.5, to: 5, size: 56, yRatio: 0.12 },
      { text: "89.000 km — €18.500", from: 5, to: 10.5, size: 64 },
      { text: "Richiedi info su WhatsApp", from: 11, to: 16.5, size: 48, yRatio: 0.85 },
    ],
    voiceText: "Volkswagen Golf 7 TDI, anno 2021, 89 mila chilometri, full optional, prezzo 18.500 euro.",
  },
];

const only = process.argv[2]; // es: realty / dental / motors
const toRun = only ? demos.filter((d) => d.slug.startsWith(only)) : demos;

for (const d of toRun) {
  console.log(`\n>> ${d.slug}: cerco Pexels "${d.query}"...`);
  let images;
  try {
    images = await pexels(d.query, 4);
    console.log(`   trovate ${images.length} immagini`);
  } catch (e) {
    console.error(`   Pexels fallito, uso picsum: ${e.message}`);
    images = [1, 2, 3, 4].map((i) => `https://picsum.photos/seed/${d.slug}${i}/1920/1080.jpg`);
  }
  const job = await createJob({
    tenant_id: d.tenantSlug === "demo-realty" ? "22222222-2222-2222-2222-222222222222" : d.tenantSlug === "demo-dental" ? "11111111-1111-1111-1111-111111111111" : "33333333-3333-3333-3333-333333333333",
    type: "video_kenburns",
    payload: { images, overlays: d.overlays, voiceText: d.voiceText },
  });
  console.log(`   OK job ${job.id} (${d.slug})`);
}
