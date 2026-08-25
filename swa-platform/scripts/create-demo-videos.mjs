const BASE = process.env.SWA_BASE_URL || "https://swa-platform-1dgo33ptt-vincenzo-s-projects-f69d61cb.vercel.app";
const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) throw new Error("ADMIN_KEY non impostata");

const demos = [
  {
    slug: "realty-navigli",
    tenantSlug: "demo-realty",
    images: [
      "https://picsum.photos/seed/realestate1/1920/1080.jpg",
      "https://picsum.photos/seed/realestate2/1920/1080.jpg",
      "https://picsum.photos/seed/realestate3/1920/1080.jpg",
      "https://picsum.photos/seed/realestate4/1920/1080.jpg",
    ],
    overlays: [
      { text: "Bilocale 75mq — Milano Navigli", from: 0.5, to: 5, size: 68, yRatio: 0.12 },
      { text: "€285.000 — Classe C", from: 5, to: 10.5, size: 84 },
      { text: "Terrazzo 12mq — Richiedi visita", from: 11, to: 16.5, size: 56, yRatio: 0.85 },
    ],
    voiceText: "Bilocale di 75 metri quadri ai Navigli, secondo piano con ascensore, terrazzo di 12 metri, classe energetica C, prezzo 285 mila euro. Contatta l'agenzia per una visita.",
  },
  {
    slug: "dental-milano",
    tenantSlug: "demo-dental",
    images: [
      "https://picsum.photos/seed/dental1/1920/1080.jpg",
      "https://picsum.photos/seed/dental2/1920/1080.jpg",
      "https://picsum.photos/seed/dental3/1920/1080.jpg",
      "https://picsum.photos/seed/dental4/1920/1080.jpg",
    ],
    overlays: [
      { text: "Studio Demo — Milano", from: 0.5, to: 5, size: 72, yRatio: 0.12 },
      { text: "Igiene 89€ — Controllo gratis", from: 5, to: 10.5, size: 80 },
      { text: "Prenota su WhatsApp 24/7", from: 11, to: 16.5, size: 58, yRatio: 0.85 },
    ],
    voiceText: "Studio Dentistico Demo a Milano, igiene professionale a 89 euro, controllo gratuito, prenota su WhatsApp 24 ore su 24 con la nostra receptionist AI.",
  },
  {
    slug: "motors-golf",
    tenantSlug: "demo-motors",
    images: [
      "https://picsum.photos/seed/cars1/1920/1080.jpg",
      "https://picsum.photos/seed/cars2/1920/1080.jpg",
      "https://picsum.photos/seed/cars3/1920/1080.jpg",
      "https://picsum.photos/seed/cars4/1920/1080.jpg",
    ],
    overlays: [
      { text: "VW Golf 7 TDI 2021", from: 0.5, to: 5, size: 72, yRatio: 0.12 },
      { text: "89.000 km — €18.500", from: 5, to: 10.5, size: 88 },
      { text: "Richiedi info su WhatsApp", from: 11, to: 16.5, size: 56, yRatio: 0.85 },
    ],
    voiceText: "Volkswagen Golf 7 TDI, anno 2021, 89 mila chilometri, full optional, prezzo 18.500 euro.",
  },
];

for (const d of demos) {
  const res = await fetch(`${BASE}/api/jobs`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify({ tenantSlug: d.tenantSlug, type: "video_kenburns", payload: { images: d.images, overlays: d.overlays, voiceText: d.voiceText } }),
  });
  const body = await res.json();
  if (!res.ok) {
    console.error(`FAIL ${d.slug}:`, body);
  } else {
    console.log(`OK ${d.slug}: ${body.job.id}`);
  }
}
