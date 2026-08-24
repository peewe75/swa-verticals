import type { ChatMsg } from "@swa/lib-llm";
import { chat } from "@swa/lib-llm";

export interface DentalConfig {
  studio_name: string;
  city: string;
  orari: string;
  servizi: string[];
  prezzi_indicativi: Record<string, string>;
  tono: string;
}

export interface DentalTurn {
  reply: string;
  escalated: boolean;
}

const URGENCY_RE =
  /dolor|dolore|fa male|mal di dent|gonfi|sanguig|sanguin|febbre|frattur|rott|rottura|urgen|ascess|trauma|swollen|caduto un dente/i;

const AI_DISCLOSURE =
  "Ciao! Sono l'assistente virtuale dello studio: scrivo tramite AI e posso aiutarti con informazioni e appuntamenti. Per esigenze cliniche ti passo subito lo staff.";

const ESCALATION_REPLY =
  "Ho capito, mi dispiace. Ho avvisato subito lo studio: vi ricontatteranno appena possibile in orario di apertura. Nel frattempo, se il dolore è forte o insopportabile, valuta il pronto soccorso più vicino.";

export function buildSystemPrompt(config: DentalConfig): string {
  const prezzi = Object.entries(config.prezzi_indicativi ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
  return [
    `Sei la receptionist virtuale dello studio odontoiatrico ${config.studio_name} di ${config.city}.`,
    `PERSONALITÀ: ${config.tono}. Risposte brevi (max 60 parole), italiano professionale. Un'emoji al massimo, solo se appropriato.`,
    `ORARI: ${config.orari}.`,
    `SERVIZI: ${config.servizi.join(", ")}.`,
    `PREZZI INDICATIVI: ${prezzi || "da definire in sede"}. Il preventivo preciso si definisce solo dopo la visita: dilo sempre.`,
    `PUOI FARE: dare orari e indirizzo; indicare costi indicativi con disclaimer; proporre e confermare appuntamenti (slot fittizi per la demo: domani 10:00, 11:30, 16:00 o dopodomani 9:30, 12:00, 17:15); raccogliere nome e numero se mancano.`,
    `NON PUOI FARE (MAI): dare consigli clinici, diagnosi o farmaci; promettere esiti o sconti; parlare male di altri studi; discutere dati di altri pazienti.`,
    `Se l'utente chiede un parere clinico, comunica con dolcezza che lo staff lo ricontatterà per valutare il caso.`,
    `Non menzionare mai di essere un modello linguistico: sei l'assistente dello studio. Se chiedono "sei un robot?", rispondi con trasparenza che sei l'assistente virtuale e offri il passaggio allo staff.`,
  ].join("\n");
}

export async function dentalTurn(
  config: DentalConfig,
  history: ChatMsg[],
  userText: string,
  isFirstTurn: boolean,
): Promise<DentalTurn> {
  if (URGENCY_RE.test(userText)) {
    return { reply: ESCALATION_REPLY, escalated: true };
  }
  const messages: ChatMsg[] = [
    { role: "system", content: buildSystemPrompt(config) },
    ...(isFirstTurn ? [{ role: "system" as const, content: AI_DISCLOSURE }] : []),
    ...history,
    { role: "user", content: userText },
  ];
  const result = await chat(messages, { temperature: 0.5, maxTokens: 250 });
  let reply = result.text.trim();
  if (isFirstTurn && !reply.includes("assistente")) {
    reply = `${AI_DISCLOSURE}\n\n${reply}`;
  }
  return { reply, escalated: false };
}
