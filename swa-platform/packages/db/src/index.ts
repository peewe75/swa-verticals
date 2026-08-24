import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface JobRow {
  id: string;
  tenant_id: string | null;
  type: string;
  payload: Record<string, unknown>;
  status: JobStatus;
  attempts: number;
  result_url: string | null;
  error: string | null;
  cost_eur: number;
  created_at: string;
  finished_at: string | null;
}

export interface TenantRow {
  id: string;
  slug: string;
  name: string;
  vertical: "realty" | "dental" | "motors";
  plan: string;
  status: string;
  config_json: Record<string, unknown>;
}

export interface ConversationRow {
  id: string;
  tenant_id: string;
  channel: string;
  wa_id: string | null;
  state: Record<string, unknown>;
  escalated: boolean;
  summary: string | null;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: string;
}

function envUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("SUPABASE_URL non impostata");
  return url;
}

export function adminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY non impostata");
  return createClient(envUrl(), key, { auth: { persistSession: false } });
}

export function anonClient(): SupabaseClient {
  const key = process.env.SUPABASE_ANON_KEY;
  if (!key) throw new Error("SUPABASE_ANON_KEY non impostata");
  return createClient(envUrl(), key, { auth: { persistSession: false } });
}

export async function createJob(input: {
  tenant_id?: string | null;
  type: string;
  payload?: Record<string, unknown>;
}): Promise<JobRow> {
  const { data, error } = await adminClient()
    .from("jobs")
    .insert({ tenant_id: input.tenant_id ?? null, type: input.type, payload: input.payload ?? {} })
    .select()
    .single();
  if (error) throw error;
  return data as JobRow;
}

export async function claimNextJob(): Promise<JobRow | null> {
  const db = adminClient();
  const { data: queued } = await db
    .from("jobs")
    .select()
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1);
  const job = queued?.[0];
  if (!job) return null;
  const { data: claimed } = await db
    .from("jobs")
    .update({ status: "running", attempts: (job.attempts ?? 0) + 1 })
    .eq("id", job.id)
    .eq("status", "queued")
    .select()
    .single();
  return (claimed as JobRow) ?? null;
}

export async function completeJob(id: string, resultUrl: string | null, costEur = 0): Promise<void> {
  const { error } = await adminClient()
    .from("jobs")
    .update({ status: "done", result_url: resultUrl, finished_at: new Date().toISOString(), cost_eur: costEur })
    .eq("id", id);
  if (error) throw error;
}

export async function failJob(id: string, message: string): Promise<void> {
  const { error } = await adminClient()
    .from("jobs")
    .update({ status: "failed", error: message.slice(0, 2000), finished_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getTenantBySlug(slug: string): Promise<TenantRow | null> {
  const { data } = await adminClient().from("tenants").select().eq("slug", slug).maybeSingle();
  return (data as TenantRow) ?? null;
}

export async function logUsage(tenantId: string | null, service: string, units: number, costEur = 0): Promise<void> {
  await adminClient().from("api_usage").insert({ tenant_id: tenantId, service, units, cost_eur: costEur });
}
