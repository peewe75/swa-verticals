export function imageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL || "google/gemini-2.5-flash-image";
}

interface OpenRouterImage {
  image_url?: { url?: string };
}

interface OpenRouterResponse {
  choices?: { message?: { images?: OpenRouterImage[] } }[];
  error?: { message?: string };
}

export interface EditImageOptions {
  prompt: string;
  imageBase64: string;
  imageMime?: string;
  model?: string;
}

export interface EditImageResult {
  buffer: Buffer;
  mime: string;
}

const DATA_URL_RE = /^data:([^;]+);base64,(.+)$/s;

export async function editImage(opts: EditImageOptions): Promise<EditImageResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY non impostata");
  const model = opts.model ?? imageModel();
  const dataUrl = `data:${opts.imageMime ?? "image/jpeg"};base64,${opts.imageBase64}`;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: opts.prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });
  const body = (await res.json()) as OpenRouterResponse;
  if (!res.ok || body.error) {
    throw new Error(`OpenRouter HTTP ${res.status}: ${body.error?.message ?? res.statusText}`);
  }
  const imageUrl = body.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  const match = imageUrl ? DATA_URL_RE.exec(imageUrl) : null;
  if (!match) {
    throw new Error("OpenRouter non ha restituito immagini");
  }
  return { buffer: Buffer.from(match[2], "base64"), mime: match[1] };
}

export async function enhanceRealEstate(imageBase64: string): Promise<EditImageResult> {
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

export async function virtualStaging(imageBase64: string, roomType: string, style: string): Promise<EditImageResult> {
  return editImage({
    imageBase64,
    prompt: [
      `Arreda virtualmente questa stanza vuota (${roomType}) in stile ${style}, coerente con il mercato italiano.`,
      "Mantieni INVOLATI pavimento, pareti, finestre, porte e loro proporzioni.",
      "Fotorealistico, luce naturale coerente con la foto originale.",
    ].join(" "),
  });
}
