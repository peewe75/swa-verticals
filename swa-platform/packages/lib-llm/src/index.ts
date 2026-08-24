import { z } from "zod";

export type ChatRole = "system" | "user" | "assistant";
export interface ChatMsg {
  role: ChatRole;
  content: string;
}

export interface ChatResult {
  text: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number } | null;
}

const DEFAULT_BASE_URL = "https://apihub.agnes-ai.com/v1";
const DEFAULT_MODELS = ["agnes-2.0-flash"];

export function baseUrl(): string {
  return process.env.LLM_BASE_URL || DEFAULT_BASE_URL;
}

export function models(): string[] {
  const raw = process.env.LLM_MODELS;
  const list = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : DEFAULT_MODELS;
  return list.length ? list : DEFAULT_MODELS;
}

interface OpenRouterChoice {
  message?: { content?: string | null };
}
interface ChatCompletionResponse {
  choices?: OpenRouterChoice[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
}

async function callModel(
  model: string,
  messages: ChatMsg[],
  opts: { temperature?: number; maxTokens?: number; json?: boolean },
  timeoutMs = 90_000,
): Promise<ChatResult> {
  const key = process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("LLM_API_KEY non impostata");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl()}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.6,
        max_tokens: opts.maxTokens ?? 2000,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    const body = (await res.json()) as ChatCompletionResponse;
    if (!res.ok || body.error) {
      throw new Error(`${model}: HTTP ${res.status} ${body.error?.message ?? res.statusText}`);
    }
    const text = (body.choices?.[0]?.message?.content ?? "").trim();
    if (!text) throw new Error(`${model}: risposta vuota (possibile budget token esaurito nel reasoning)`);
    return {
      text,
      model,
      usage: {
        prompt_tokens: body.usage?.prompt_tokens ?? 0,
        completion_tokens: body.usage?.completion_tokens ?? 0,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function chat(
  messages: ChatMsg[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<ChatResult> {
  let lastError: unknown = null;
  for (const model of models()) {
    try {
      return await callModel(model, messages, opts);
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`Tutti i modelli LLM hanno fallito: ${String(lastError)}`);
}

function extractJson(text: string): unknown {
  const candidates = [text, text.replace(/```json/gi, "```").split("```").join("\n")];
  for (const candidate of candidates) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch {
        continue;
      }
    }
  }
  throw new Error("Nessun JSON valido nella risposta");
}

export async function structured<T extends z.ZodType>(
  messages: ChatMsg[],
  schema: T,
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<{ data: z.infer<T>; model: string; usage: ChatResult["usage"] }> {
  let lastError: unknown = null;
  for (const model of models()) {
    try {
      const result = await callModel(model, messages, { ...opts, json: true, maxTokens: opts.maxTokens ?? 3000 });
      const parsed = schema.safeParse(extractJson(result.text));
      if (parsed.success) {
        return { data: parsed.data, model: result.model, usage: result.usage };
      }
      const retry = await callModel(
        model,
        [
          ...messages,
          { role: "assistant", content: result.text },
          {
            role: "user",
            content: "La risposta non rispetta lo schema JSON richiesto. Rispondi di nuovo con SOLO un oggetto JSON valido.",
          },
        ],
        { ...opts, json: true, maxTokens: opts.maxTokens ?? 3000 },
      );
      const reparsed = schema.safeParse(extractJson(retry.text));
      if (reparsed.success) {
        return { data: reparsed.data, model: retry.model, usage: retry.usage };
      }
      lastError = new Error(`Schema non valido (${model}): ${JSON.stringify(reparsed.error.issues.slice(0, 3))}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`structured() fallito su tutti i modelli: ${String(lastError)}`);
}
