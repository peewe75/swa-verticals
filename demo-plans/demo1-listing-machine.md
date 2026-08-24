# Demo Plan 1 — Listing Machine (Agenzie Immobiliari)
Obiettivo demo: trasformare un annuncio REALE del lead in pacchetto completo in < 24h e mostrarlo dal telefono.

---

## 1. Scenario dimostrativo (il "movie script" della demo)

1. SWA seleziona un annuncio pubblico del lead (immobile ≥ 60 giorni online o foto scadenti)
2. Produce: 12 foto potenziate, 3 virtual staging dichiarati, video 40s con voce IT, copy annuncio, mini-sito `demo.swademo.it/casa-via-[x]`
3. Outreach: "Ho preparato il video per il vostro immobile in Via X — 40 secondi, guardate dal telefono" + link mini-sito
4. Lead apre → vede il suo annuncio trasformato → CTA "Vuoi questo per ogni tuo immobile?"

## 2. Flusso tecnico end-to-end

```
[Upload foto+dati] → jobs(type=enhance) ──→ Gemini Nano Banana (batch)
        │                                            │
        ├→ jobs(type=staging) ──→ Nano Banana (3 stanze chiave) → label AI Act
        │                                            │
        ├→ jobs(type=script)  ──→ LLM: script video 30-40s + copy annuncio
        │                                            │
        ├→ jobs(type=tts)     ──→ ElevenLabs (voce IT selezionata)
        │                                            │
        └→ jobs(type=video)   ──→ VPS worker ffmpeg:
                                   foto → ken burns 3-4s cad. → transizioni crossfade
                                   + overlay testo (prezzo, mq, vani, zona)
                                   + traccia voce + musica stock (Pexels) ducking -12dB
                                   → 9:16 (Reels) + 16:9 (portale/YouTube)
                                   [opzionale premium: 1 clip generativa Veo 4s su scena esterna]
                                            │
[mini-sito] ← static gen Next.js: hero video, gallery prima/dopo (slider),
              mappa, dati, form lead → notifica WhatsApp agenzia
```

Tempi: enhance ~2 min/foto (batch), staging ~2 min/foto, TTS 30s, rendering ffmpeg 3-5 min. **Totale ~30 min di elaborazione** + revisione umana.

## 3. Prompt chiave

### 3.1 Enhance (Nano Banana / Gemini image edit)
```
Migliora questa foto immobiliare per un annuncio professionale:
- correggi esposizione, bilanciamento del bianco, colori naturali
- raddrizza le linee verticali (prospettiva)
- riduci rumore, aumenta nitidezza in modo naturale
NON: aggiungere o rimuovere oggetti, alterare strutture, finestre, finiture.
Output fotorealistico, aspetto professionale da fotografo immobiliare.
```

### 3.2 Virtual staging (solo stanze VUOTE, mai su occupate)
```
Arreda virtualmente questa stanza vuota in stile [modern-minimal|scandinavo|classico]
coerente con il mercato italiano: [soggiorno 25mq: divano componibile, tavolo,
tappeto, piante, lampada]. Mantieni INVIOLATI pavimento, pareti, finestre, porte
e loro proporzioni. Fotorealistico, luce naturale coerente con la foto originale.
```
→ Post-processing automatico: overlay angolo inferiore "Immagine arredata virtualmente con AI — a scopo illustrativo" (AI Act art. 50) + metadati.

### 3.3 Script video (LLM structured output)
```json
{
  "hook": "frase apertura 6-10 parole sul punto di forza principale",
  "scene_texts": ["overlay 1", "overlay 2", "..."],  // prezzo, zona, mq, vani, energia
  "voiceover": "testo 70-90 parole, tono professionale caldo, indicative di spazio/luce/posizione, CTA finale 'Per una visita...' ",
  "caption_social": "didascalia IG/FB con hook + emoji moderate + hashtag zona",
  "listing_copy": { "titolo_portale": "...", "descrizione": "...", "dotazioni": ["..."], "cta": "..." }
}
```
Vincoli nel system prompt: mai inventare caratteristiche non fornite (dotazioni, anno, classe energetica); se dato mancante → chiedere, non fantasmare.

## 4. Mini-sito annuncio (template)

- Hero: video autoplay muted + badge "Video tour"
- Slider prima/dopo (foto originale vs enhance vs staging) — dimostra il lavoro
- Dati essenziali + mappa (static OpenStreetMap, zero costi)
- Form: nome, telefono, fascia oraria → conferma → **notifica WhatsApp immediata all'agenzia** (questo è il momento wow #2)
- Footer: "Annuncio dimostrativo creato da SWA — [CTA per l'agenzia: vuoi la tua versione?]"

## 5. Personalizzazione per lead (checklist operatoria, 45 min/lead)

- [ ] Logo e colori agenzia (da sito/IG)
- [ ] Immobile scelto: preferire giacente > 60gg o con < 8 foto
- [ ] Voce: maschile/femminile in base al brand dell'agenzia
- [ ] Nome dominio/sub: demo.swademo.it/[slug-immobile]
- [ ] Mini-cta personalizzata: "Preparato per [Nome Agenzia] — grazie a [nome agente se noto]"

## 6. Script conversazione demo (incontro 15 minuti)

1. (0-2') "Prima di parlarne: guarda questo dal tuo telefono" → link mini-sito
2. (2-5) Loro esplorano. Domanda: "Quanto tempo vi ha preso l'ultimo annuncio pubblicato?" → pain elicitation
3. (5-9) Mostrare la pipeline: "Voi caricate le foto, in 24 ore avete questo pacchetto per ogni immobile. Il costo del fotografo per UN servizio copre due mesi del servizio."
4. (9-12) Obiezioni: foto false? → "Lo staging è sempre dichiarato — è la legge da agosto, e noi siamo gli unici a farlo in automatico. Il compratore apprezza la trasparenza."
5. (12-15) "Tenete la demo dell'immobile, è vostra. Se volete il prossimo immobile trattato così, iniziamo col piano Start: due immobili, vi faccio vedere se porta richieste."

## 7. Stack components riuso

Questa pipeline condivide con Demo 3 (Motors): worker ffmpeg, ken burns engine, overlay engine, TTS wrapper, job queue, mini-site template. **Costruire prima Motors (settimana 2) implica che Realty (settimana 3) erediti il 60% del codice.**

## 8. Definition of Done

- [ ] Da upload a pacchetto completo < 30 min (senza clip Veo)
- [ ] Ogni immagine staged ha label visibile + metadati AI
- [ ] Video 9:16 con sottotitoli auto (accessibilità, visualizzazioni mute)
- [ ] Form mini-sito → WhatsApp agenzia < 5s
- [ ] Nessun dato inventato nel copy (checklist revisione umana)
- [ ] Demo navigabile da smartphone anche offline-scaricabile (PDF backup)
