# SWA Platform

Monorepo della piattaforma verticale SWA (Listing Machine / Receptionist AI / Showroom AI).

```
apps/platform          App Next.js: console job, chat dental, webhook WhatsApp
packages/db            Schema Supabase + client tipizzato
packages/lib-llm       Wrapper OpenRouter (chat, structured output, fallback modelli)
packages/lib-tts       Wrapper ElevenLabs con cache su disco
packages/lib-wa        WhatsApp Cloud API (invio, webhook, verifica firma)
packages/lib-gemini    Gemini image editing (Nano Banana) 
infra/vps-renderer     Worker Node + ffmpeg: coda job, video ken-burns 9:16
```

## Setup locale

```bash
pnpm install
cp .env.example .env            # compilare le chiavi disponibili
pnpm smoke                      # verifica config: LLM/TTS/ffmpeg/Supabase
```

### Supabase
1. Creare progetto su https://supabase.com (regione **EU Central**)
2. SQL Editor → incollare ed eseguire `packages/db/schema.sql`
3. Copiare URL + chiavi in `.env`

### App web (console + dental chat)
```bash
pnpm dev:platform               # http://localhost:3000
```
La console richiede `ADMIN_KEY` (da `.env`). La demo dental è su `/dental`.

### Worker video (locale, richiede ffmpeg nel PATH)
```bash
pnpm dev:worker
```

### Worker video (Oracle VPS)
```bash
scp -r infra/vps-renderer .env user@vps:~/renderer/
ssh user@vps "cd ~/renderer && docker compose up -d --build"
```

### WhatsApp Cloud API (test number)
1. https://developers.facebook.com → nuova app → tipo Business → aggiungi prodotto WhatsApp
2. Test number: copia `Phone number ID` e token temporaneo in `.env` (`WA_PHONE_NUMBER_ID`, `WA_ACCESS_TOKEN`), imposta `WA_VERIFY_TOKEN` a piacere
3. Webhook → Callback URL `https://TUO-DOMINIO/api/wa/webhook`, Verify Token = `WA_VERIFY_TOKEN`, iscrivi il campo `messages`
4. Aggiungi fino a 5 numeri di test autorizzati

### Deploy Vercel
1. Importare il repo, Root Directory = `apps/platform` (rileva il monorepo pnpm)
2. Env vars: tutte quelle di `.env.example` tranne `RENDERER_*`
3. Dominio demo: puntare un sub (es. `demo.swademo.it`)

## Job types supportati (settimana 1)

| type | payload | output |
|---|---|---|
| `demo_echo` | `{message}` | conferma catena DB→worker |
| `video_kenburns` | `{images: url[], overlays?, voiceUrl?, musicUrl?}` | mp4 9:16 in Supabase Storage `renders/` |
| `enhance` | `{imageUrl}` | foto migliorata (Gemini) in Supabase Storage `renders/` |
| `staging` | `{imageUrl, roomType?, style?}` | foto con virtual staging + label AI Act in Supabase Storage `renders/` |

## Note

- Tutte le chiavi service vivono solo lato server (API routes / worker / Vercel env). Mai nel client.
- `lib-tts` cache-a su disco: stesso testo+voce = zero costi ripetuti.
- Il worker scarica le immagini da URL pubblici: perfetto per demo su annunci reali dei lead.
