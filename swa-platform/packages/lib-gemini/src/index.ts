export function imageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
}

interface GeminiPart {
  inline_data?: { mime_type?: string; data?: string };
  text?: string;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

export interface EditImageOptions {
  prompt: string;
  imageBase64: string;
  imageMime?: string;
  model?: string;
}

export async function editImage(opts: EditImageOptions): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY non impostata");
  const model = opts.model ?? imageModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: opts.prompt },
            { inline_data: { mime_type: opts.imageMime ?? "image/jpeg", data: opts.imageBase64 } },
          ],
        },
      ],
    }),
  });
  const body = (await res.json()) as GeminiResponse;
  if (!res.ok || body.error) {
    throw new Error(`Gemini HTTP ${res.status}: ${body.error?.message ?? res.statusText}`);
  }
  const parts = body.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => p.inline_data?.data);
  if (!imagePart?.inline_data?.data) {
    throw new Error("Gemini non ha restituito immagini");
  }
  return Buffer.from(imagePart.inline_data.data, "base64");
}

export async function enhanceRealEstate(imageBase64: string): Promise<Buffer> {
  return editImage({
    imageBase64,
    prompt: [
      "Migliora questa foto immobiliare per un annuncio professionale:",
      "correggi esposizione, bilanciamento del bianco, colori naturali;",
      "raddrizza le linee verticali (prospettiva); riduci rumore, aumenta nitidezza in modo naturale.",
      "NON aggiungere o rimuovere oggetti, NON alterare strutture, finestre o finiture.",
      "Output fotorealistico professionale.",
    ].join(" "),
  });
}

export async function virtualStaging(imageBase64: string, roomType: string, style: string): Promise<Buffer> {
  return editImage({
    imageBase64,
    prompt: [
      `Arreda virtualmente questa stanza vuota (${roomType}) in stile ${style}, coerente con il mercato italiano.`,
      "Mantieni INVOLATI pavimento, pareti, finestre, porte e loro proporzioni.",
      "Fotorealistico, luce naturale coerente con la foto originale.",
    ].join(" "),
  });
}
