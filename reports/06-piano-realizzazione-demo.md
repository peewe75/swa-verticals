# Piano di Realizzazione Demo — 4 Settimane
Architettura senza n8n: orchestrazione diretta in codice sullo stack SWA (Vercel + Supabase + Oracle VPS + GitHub)

> **STATUS IMPLEMENTAZIONE (24/08/2026)** — Settimana 1 completata: monorepo funzionante in `../swa-platform/`.
> Verificato: typecheck 8/8 progetti, pipeline video ken-burns end-to-end (1080x1920@30fps, 19.6s, overlay + fade, 3.4s di rendering), build Next.js con console job + chat dental + webhook WhatsApp.
> Da configurare (richiede account): Supabase project + schema.sql, chiavi API in `.env`, test number Meta, deploy Vercel/VPS. Istruzioni in `swa-platform/README.md`, verifica con `pnpm smoke`.

---

## 1. Decisione architetturale: perché niente n8n (per ora)

| Opzione | Verdetto | Motivo |
|---|---|---|
| **Codice diretto (scelta)** | SI — demo e produzione iniziale | SWA è una software house: API routes Next.js + Supabase danno controllo, versioning, test e zero costi. La logica di business risiede in un unico codebase |
| n8n Cloud (a pagamento) | NO | Abbonamento inutile per i volumi attuali |
| n8n Community self-hosted | FASE 2 opzionale | Gratuito (Docker su Oracle VPS), utile quando serviranno automazioni client-specific visuali o onboarding self-service. Nota: nessun abbonamento richiesto per l'edizione Community |

Principio: **la demo DEVE essere il seme del prodotto di produzione**, non un throwaway. Ogni ora di lavoro sulle demo è un'ora di product.

## 2. Stack definitivo e mapping

```
MONOREPO (GitHub, pnpm workspaces — turborepo opzionale)
│
├── apps/
│   ├── core-admin/        → Next.js su Vercel: dashboard interna SWA
│   │                        (code clienti, job queue, API keys, usage)
│   ├── demo-realty/       → Next.js: Listing Machine (upload → annuncio pack)
│   ├── demo-dental/       → Next.js: landing + widget Receptionist AI + conversazioni
│   ├── demo-motors/       → Next.js: Showroom AI (stock → video → social pack)
│   └── mini-site-*/       → template mini-sito annuncio (static gen, dominio cliente o sub)
│
├── packages/
│   ├── lib-llm/           → wrapper OpenRouter (chat, structured output JSON)
│   ├── lib-gemini/        → wrapper Gemini (Nano Banana editing foto, Veo video opzionale)
│   ├── lib-tts/           → wrapper ElevenLabs (voce IT, caching per script ripetuti)
│   ├── lib-heygen/        → wrapper HeyGen (avatar video promo)
│   ├── lib-wa/            → WhatsApp Cloud API (webhook in/out, templates, test number)
│   ├── lib-video/         → client per il renderer su VPS (upload job, status, download)
│   ├── db/                → schema Supabase (migrations SQL) + tipi generati
│   └── ui/                → design system condiviso (Tailwind + shadcn)
│
└── infra/
    ├── vps-renderer/      → Node.js worker su Oracle VPS (Docker): ffmpeg, coda job
    └── supabase/          → migrations, RLS policies, edge functions (cron)
```

| Risorsa | Uso | Costo |
|---|---|---|
| Vercel (Hobby/Pro) | Hosting app Next.js | 0-20 EUR/mese |
| Supabase | Postgres + Auth + Storage + pg_cron | 0 (free fino 500MB) poi 25 EUR/mese |
| Neon | DB secondario per clienti enterprise che vogliono separazione | 0 (free tier) |
| Oracle VPS (Always Free: ARM 4 OCPU/24GB) | Worker ffmpeg + storage video + (futuro n8n) | 0 |
| GitHub | Monorepo, Actions (deploy, test) | 0 |
| OpenRouter | LLM: Claude Sonnet (quality) + GPT-mini/Flash (bulk) | ~20-50 EUR/mese a regime |
| Gemini API (chiavi esistenti) | Nano Banana photo editing, test video Veo | free tier + credito |
| ElevenLabs (30 min/mese) | Voce IT video e messaggi vocali | 0 (5 EUR/mese starter se serve più) |
| HeyGen (30 min/mese) | Avatar video promo (dealership, agenzie) | 0 |
| Pexels/Pixabay API | Sfondi, B-roll per social | 0 |
| WhatsApp Cloud API | Test number gratuito (illimitato per numeri whitelistati) | 0 → poi ~0,005-0,01 EUR/conversazione |
| Dominio demo + sub | swademo.it o simili | ~15 EUR/anno |

**Budget totale fase demo: ~50-100 EUR.**

## 3. Schema dati Supabase (semplificato, comune)

```sql
-- core
tenants            (id, name, vertical, plan, status, created_at)
users_admin        (id, email, role)  -- staff SWA
api_usage          (tenant_id, service, tokens/units, cost_eur, date)

-- verticali (tabelle dedicate)
listings           (id, tenant_id, address, price, rooms, sqm, status, source)
listing_media      (id, listing_id, kind [raw|enhanced|staged|labeled], url, meta)
listing_outputs    (id, listing_id, type [video|copy|social_pack|mini_site], url, status)

patients_dental    (id, tenant_id, name, phone_hash, last_visit, recall_due, consent)
conversations      (id, tenant_id, channel, wa_id, state, summary, escalated)
messages           (id, conversation_id, role, content, ts)

vehicles           (id, tenant_id, make, model, year, km, price, status, specs_json)
vehicle_media      / vehicle_outputs   (analoghe a listing)
leads              (id, tenant_id, vertical, source, name, phone, intent, score, status)

jobs               (id, tenant_id, type, payload, status [queued|running|done|failed],
                    result_url, error, cost_eur, created_at, finished_at)
```

RLS: ogni tenant vede solo i propri dati. Per la fase demo si lavora con tenant di test isolati — i dati dei lead prospect NON contaminano tenant reali.

## 4. Pattern di orchestrazione (senza n8n)

- **Job queue**: tabella `jobs` + worker sul VPS che fa polling (pg_cron ogni 30s lancia `net.http_post` a se stesso oppure il worker fa long-polling NOTIFY/LISTEN di Postgres — semplice e robusto)
- **Chain LLM→media**: le API routes scrivono il job; il worker esegue (ffmpeg, chiamate API) e aggiorna lo stato; la UI fa polling o realtime Supabase
- **Webhook WhatsApp**: route vercel `/api/wa/webhook` → verifica firma → salva messaggio → genera risposta LLM (con system prompt verticale) → invia. Timeout: se LLM > 8s, ack e risposta differita
- **Cron**: Supabase pg_cron per recall dentali (daily 09:00), conferme 48h/24h, rigenerazione video su cambio prezzo
- **Error handling**: job falliti → retry 1x → coda errori visibile in core-admin; mai silenzio: ogni fallimento loggato con costo sostenuto

## 5. Piano settimanale (4 settimane)

### Settimana 1 — Core + fondamenta
- [ ] Setup monorepo, progetti Vercel, progetto Supabase (eu-central-1), schema iniziale
- [ ] `packages/lib-llm` con fallback model (OpenRouter: primary claude-sonnet, fallback gpt-mini) + structured output JSON schema
- [ ] `packages/lib-wa`: app Meta Developer, test number, webhook ricezione/invio (sandbox)
- [ ] `packages/lib-tts`: ElevenLabs voice IT selezione (2-3 voci: maschile calda, femminile professionale), caching hash-script
- [ ] Oracle VPS: Docker + Node worker base + ffmpeg install + health endpoint
- [ ] `core-admin` skeleton: login, lista job, usage
- **Milestone**: catena "form → job → LLM → risposta" funzionata end-to-end su tutti e 3 i livelli (web, worker, DB)

### Settimana 2 — Demo 3 (Motors) + Demo 2 (Dental)
- [ ] Demo 3: pipeline video (foto → enhance ffmpeg → ken burns → overlay prezzo/km con drawtext/ass → voce TTS → mix musica stock Pexels → export 9:16 H.264)
- [ ] Demo 3: template script voce per scheda auto (LLM scrive lo script dai dati; revisione umana opzionale)
- [ ] Demo 3: agente WhatsApp demo (2 auto fittizie, FAQ, qualifica → scheda lead)
- [ ] Demo 2: system prompt receptionist (con regole deontologiche + escalation keyword) → test su test number
- [ ] Demo 2: flusso conferma appuntamento simulato + richiesta recensione post-visita
- [ ] Landing demo per entrambi (Vercel, 1 pagina ciascuna: problema → demo live → CTA)
- **Milestone**: video 9:16 completo generato da foto fittizie; conversazione WhatsApp dental completa con escalation

### Settimana 3 — Demo 1 (Realty) + HeyGen
- [ ] Demo 1: enhance foto via Gemini Nano Banana (prompt: correzione luce/colori, ORIZZONTI dritti, NO alterazione contenuto)
- [ ] Demo 1: virtual staging (Nano Banana: arredare soggiorno/camera) + watermark/label automatica "virtualmente arredata con AI" (AI Act)
- [ ] Demo 1: video cinematic (stessa pipeline motors + clip generativa opzionale Veo per l'immobile premium)
- [ ] Demo 1: copy annuncio (hook + descrizione + dotazioni + CTA) + varianti social + mini-sito annuncio (template statico con form → notifica WhatsApp)
- [ ] HeyGen: 1 video avatar presentatore per dealership demo + 1 per agenzia
- **Milestone**: pacchetto annuncio completo generato da upload foto (target: 15 min end-to-end)

### Settimana 4 — Personalizzazione, collaudo, go-live commerciale
- [ ] Selezione 5 lead reali per nicchia (sales-scripts criteri)
- [ ] Personalizzazione demo per ogni lead: annuncio reale (realty), studio con nome reale (dental), auto reale dallo stock (motors)
- [ ] Test end-to-end su mobile (le demo si mostrano dal telefono del lead!)
- [ ] Verifica compliance: disclaimer AI su ogni chatbot, label su ogni immagine staged, footer "demo creata da SWA"
- [ ] Analytics demo (Plausible/GA4 semplice) per misurare completamento conversazioni/video visti
- [ ] Kick-off outreach (batch 1: 5 lead per nicchia)
- **Milestone**: 15 demo personalizzate pronte, primi outreach inviati

## 6. Team e allocazione (ipotesi 2 persone)

| Ruolo | Sett. 1 | Sett. 2 | Sett. 3 | Sett. 4 |
|---|---|---|---|---|
| Dev A (backend/infra) | core, worker, WA | pipeline video, jobs | Gemini pipeline, mini-site | collaudo, fix |
| Dev B (frontend/prodotti) | core-admin, UI kit | landing demo, conversazioni UI | copy engine UI, template | personalizzazioni lead |
| Vendite/founder | input requisiti | sales scripts, lead list | outreach soft (1-2 pilot) | batch outreach |

## 7. KPI tecnici di qualità demo

- Tempo generazione video 9:16 (30s): < 6 min da upload
- Tempo risposta agente WhatsApp: p95 < 4s
- Tasso escalation sensata dental: keyword urgenza → 100% passate a umano
- Zero immagini staged senza label AI
- Uptime worker: > 99% (health check + restart Docker)

## 8. Definition of Done delle demo (checklist per verticale)

**Realty**: foto reali → pack completo (12 foto enhance, 3 staged, video 40s, copy, mini-sito) in < 24h
**Dental**: lead scrive "Buongiorno, quanto costa una pulizia?" → risposta conforme + tentativo booking + escalation se "mi fa male un dente"
**Motors**: 10 foto + 5 campi → video walkaround 40s con voce IT naturale + agente che qualifica su quella specifica auto

## 9. Cosa NON fare (scope discipline)

- No pannello di amministrazione per il cliente finale (fase demo: solo SWA opera)
- No integrazione gestionali dentali reali (fase 2, dopo primo cliente pagante)
- No multi-lingua (solo italiano)
- No fatturazione automatica (fatture manuali fino a 20 clienti)
- No autoscaling: Oracle free tier regge facilmente 40+ clienti ai volumi attuali
