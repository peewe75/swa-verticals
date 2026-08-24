# Demo Plan 3 — Showroom AI (Concessionarie)
Obiettivo demo: video walkaround con voce IT di un'auto REALE dallo stock del lead + agente WhatsApp che qualifica su quell'auto.

---

## 1. Scenario dimostrativo

1. SWA preleva 10-12 foto di un'auto giacente nello stock pubblico del lead (Autoscout/Subito/sito)
2. Genera: video 9:16 40s con voce italiana che presenta marca/modello/anno/km/dotazioni/prezzo + overlay + branding
3. Genera anche versione con avatar HeyGen (30'' di opening: "Ciao, sono [nome] di [concessionaria]..." — wow-effect extra)
4. Outreach WhatsApp/email: "La [Golf 2021] nel vostro stock ha solo foto. Le ho fatto un video walkaround — 40 secondi: [link]. Lo usate? È vostro."
5. Incontro: si mostra anche l'agente WhatsApp che risponde a "è ancora disponibile? fate il finanziamento?"

## 2. Pipeline video (VPS worker ffmpeg) — la più importante delle 3 demo

### 2.1 Pre-processing foto
- Download foto → normalizzazione (resize 1080x1920 crop center, LANCZOS)
- Enhance leggero ffmpeg: `eq=contrast=1.05:brightness=0.02:saturation=1.08`, sharpen `unsharp=5:5:0.6`
- Rimozione watermark marketplace: crop bordi se necessario (mai su foto del dealer)

### 2.2 Motion engine (deterministico — affidabilità prima di tutto)
- Ken Burns per foto: zoom-in 1.0→1.12 (4s), pan L→R o R→L alternato, easing ease-in-out
- Ordine foto: esterno front 3/4 → esterno laterale → retro → interno dash → interni → dettagli (logica da specs se disponibili, altrimenti ordine upload)
- Transizioni: crossfade 0.4s (`xfade`)
- **Opzionale premium**: 1 clip generativa (Veo via Gemini API o Kling su Higgsfield se si attiva): "car cinematic drive-by" solo per auto > 25k EUR (costo crediti)

### 2.3 Overlay dinamici (libass subtitles / drawtext)
- 0-4s: badge marca+modello+allestimento (logo testuale)
- 4-10s: prezzo (grande, contrasto) + "garanzia inclusa" se presente
- poi: anno, km, dotazione top 3 a rotazione (da specs)
- finale: contatti concessionaria + "Richiedi info su WhatsApp" (link nella bio/descrizione)
- Template colori = branding lead (primario + neutro scuro)

### 2.4 Audio
- Voce ElevenLabs IT (maschile energica per motors; alternativa femminile sofisticata per premium)
- Script da LLM (~85 parole), struttura: hook modello → condizione/km → 2 dotazioni forti → chiusura prezzo + invito
- Musica: libreria Pexels royalty-free, genre energetic/rock leggero, ducking -14dB sotto voce
- Export: H.264 9:16 1080p 30fps CRF 21, AAC 192k. Durata target 38-44s.

### 2.5 Ricetta ffmpeg (scheletro)
```bash
# per foto i: scale+crop 1080x1920, zoompan 4s 30fps, poi concat con xfade
# audio: [voce][musica]amix con sidechaincompress per ducking
ffmpeg -i foto{n}.jpg ... -filter_complex "[0]zoompan=z='1+0.0009*on':d=120:s=1080x1920[v0];...
 [v0][v1]xfade=transition=fade:duration=0.4:offset=3.6[vt1]; ...
 [voz][mus]sidechaincompress=threshold=0.05:ratio=8[mix]"
```
(Il worker implementa la chain completa in Node con fluent-ffmpeg e template parametrici.)

## 3. Agente WhatsApp qualificatore (parametrizzato per singolo veicolo)

System prompt nucleo:
```
Sei l'assistente di [Concessionaria X] per l'annuncio dell'[Auto Y — anno, km, prezzo].
Rispondi su: disponibilità (sì, se non venduta ieri — verifica con escalate se dubbi),
prezzo e condizioni, garanzia, possibilità permuta e finanziamento (indicare "su
approvazione", mai promettere tassi), specifiche elencate.
RACCOGLI SEMPRE (con naturalezza, max 2-3 domande): nome, se ha un'auto da permutare,
finanziamento sì/no, quando vuole vederla.
Al termine della raccolta → handoff: "Ti passo [nome commerciale]/ti faccio richiamare:
quando preferisci?" → function `lead_complete()`.
MAI: sconti non autorizzati, valutazioni permuta precise ("serve la valutazione in
sede"), promesse di consegna.
```

Funzioni: `faq_vehicle()`, `lead_complete(name, trade_in, financing, when)`, `escalate()` (per richieste fuori scope / cliente arrabbiato / domanda tecnica specifica).

Output lead: scheda in `leads` con score (permuta+finanziamento+quando = hot) + notifica WhatsApp al commerciale.

## 4. Demo pack per lead (checklist 60 min/lead)

- [ ] Auto scelta: giacente > 45 giorni o prezzo medio-alto (15-30k) con foto decenti
- [ ] 10-12 foto scaricate, enhance, ordinate
- [ ] Script voce generato + revisione (30 min incluso) + TTS
- [ ] Video 9:16 renderizzato + versione con overlay prezzo
- [ ] Avatar HeyGen opener (optional per 5 lead prioritari)
- [ ] Agente WhatsApp configurato SU quell'auto (faq specifiche)
- [ ] Landing privata: video + CTA "usalo, è tuo" + mock post Reels pronto

## 5. Script conversazione demo (incontro 15 min)

1. (0-2) "Guarda questo dal telefono — è la vostra Golf" → video
2. (2-5) "Noterai: voce italiana, prezzo leggibile, finito come uno spot. Il vostro concorrente non ce l'ha."
3. (5-8) "Ora scrivimi 'è ancora disponibile?' su WhatsApp" → l'agente risponde e qualifica — loro vedono la scheda lead arrivare in dashboard
4. (8-11) "Voi caricate le foto quando entra un'auto nuova. In 30 minuti il video è sui vostri social. Ogni auto, non solo le 4 importanti."
5. (11-15) Pricing + "il video che avete visto è vostro, pubblicatelo. Se volete il prossimo, partiamo."

## 6. Estensioni (roadmap, non demo)

- Import automatico stock: CSV export dal loro gestionale o dalle loro pagine annuncio (con consenso)
- Rigenerazione su cambio prezzo (job on data change)
- Varianti per piattaforma: 9:16 TikTok con testo grande, 1:1 FB feed, 16:9 YouTube
- Ampliamento a moto/camper/barche (stessa pipeline, dizionario veicolo diverso)

## 7. Definition of Done

- [ ] Video 40s da 10 foto in < 6 min di rendering
- [ ] Voce naturale: nessun errore di pronuncia marca/modello (glossario TTS: km="chilometri", 4x4, GTI, ecc.)
- [ ] Overlay prezzo sempre leggibile su mobile
- [ ] Agente WA risponde con dati dell'auto ESATTA e consegna lead completo
- [ ] Branded per il lead (colori/nome) senza intervento grafico manuale
