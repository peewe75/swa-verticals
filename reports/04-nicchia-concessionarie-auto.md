# Nicchia 3 — Concessionarie Auto e Usato
Soluzione SWA: **Showroom AI** | Report di mercato e posizionamento

---

## 1. Dimensione e struttura del mercato

- **Usato = il mercato vero**: 3,1 milioni passaggi di proprietà (2025, +2,1%), rapporto ~2:1 vs immatricolazioni; valore usato **24,4 mld EUR vs 16,5 mld del nuovo** (Findomestic/ACI)
- Parco circolante: 41+ milioni veicoli, età media 13 anni (la più alta d'Europa) → flusso costante di permute e domanda strutturale di usato recente
- Rete: **997 società concessionarie, 2.359 punti vendita** (Quintegia 2025); trend multi-brand (35% mono-marca vs 53% nel 2015); ingresso brand cinesi
- Margine sul nuovo: **redditività media <1% del fatturato**, EBIT in calo (-0,5pt); il profitto si sposta su usato, finanziaria, post-vendita
- Comportamento acquirente: 84% visita più di una concessionaria (64% almeno tre); arriva già informatissimo (prezzi, km, dotazioni confrontati online); decide su chiarezza prezzi, accoglienza, test drive

**Implicazione**: ogni giorno di stock fermo è capitale immobilizzato e svalutazione. La velocità di rotazione è TUTTO. Chi presenta il veicolo meglio e risponde prima, vende prima.

## 2. I dolori (evidenza numerica)

| Dolore | Dato | Fonte |
|---|---|---|
| Il video converte ma nessuno lo produce | Video listing: **5x più tempo di visualizzazione, +400% richieste** vs foto-only | DealerStudio AI / Cars Commerce |
| Video = vendita più rapida | Video ads inventario: **vendite 3-5 giorni più veloci, +50% viewer** | Phyron (indipendente) |
| Costo produzione video tradizionale | 200+ EUR per veicolo (videografo) → solo il 20% dello stock viene filmato | DealerStudio AI |
| Tempo perso sui social | 15-20 ore/settimana per contenuti manuali multi-piattaforma | CARVID |
| Stock che stanzia | Giorni extra di immobilizzo = costo capitale + svalutazione; pricing disallineato ai marketplace | bee2link/Pneusnews |
| Lead WhatsApp non qualificati | Richieste prezzo infinite, fuori orario, senza dati; commerciali bruciati su richieste fredde | DealerLink / caso Leonori |
| Dipendenza dai marketplace | Commissioni e visibilità a pagamento su Autoscout/Subito/brumbrum; zero canale proprietario | Analisi settore |
| Lead persi fuori orario | Messaggi serai/notturni senza risposta → il cliente scrive al concorrente successivo | DealerLink |

**Quadro sintetico**: concessionaria con 60 auto in stock, 20% filmate (12 video), zero presenza TikTok/Reels organizzata, lead WhatsApp gestiti a mano quando c'è tempo. Il parallelo USA mostra la direzione: video automatico per OGNI vin + agente AI che qualifica. **In Italia nessuno lo serve.**

## 3. Comportamento d'acquisto

- Decisore: titolare (indipendenti) o responsabile marketing/usato (gruppi); ciclo vendita 2-6 settimane
- Trigger: stock in crescita, calo rotazioni, audit OEM sui tempi di pubblicazione, competitor che posta video, stagione (marzo-maggio, settembre)
- Cultura digitale: media-bassa; forte cultura della relazione e del "provare sul campo" → la demo con LA loro auto dello stock è decisiva
- Molto sensibili al linguaggio business: rotazione, giorni medi di giacenza, costo capitale, ROI per veicolo
- Canali: fiere di categoria (Quintegia eventi, Top Dealers Italia), fornitori DMS, LinkedIn, referenti OEM

## 4. Concorrenza (dettaglio)

| Competitor | Paese | Offerta | Prezzo | Debolezza vs SWA |
|---|---|---|---|---|
| Phyron | UK/SV | Video inventory automatico da foto DMS + pubblicazione social | Enterprise $$ | Non Italia retail; inglese; enterprise-only |
| CARVID | USA | Sync DMS → 9 piattaforme social con video AI | $249/mese | USA-centric, no italiano, no voce IT |
| Covideo / DealerStudio AI | USA | VIN Reels, video AI per lead follow-up | $200+/unit o < $30/video self-service | Self-service, no done-for-you, no IT |
| Cars Commerce In-Market Video | USA | Video ads automatici da inventory feed | Ads spend | Advertising, non organico; USA |
| Aeonvis (Agentforce) per Leonori | IT | Agente AI WhatsApp integrato Salesforce, qualifica lead parco auto | Progetto enterprise | Consulenza enterprise Salesforce: costi e complessità per gruppi grandi; il segmento indipendente/scoperto è sotto |
| Gestionali/DMS dealer IT (bee2link Tcar, ecc.) | IT | Gestione stock, pricing, pubblicazione marketplace | Licenza | Nessun video AI, nessun agente conversazionale |
| **SWA — Showroom AI** | IT | Video walkaround automatico per ogni auto (voce IT, overlay prezzo/km) + agente WhatsApp qualificatore + social organizzato → done-for-you in italiano | Vedi report 05 | — |

**Bianco spaziale**: il segmento indipendente/medio italiano (1-5 punti vendita, 40-200 auto in stock) non ha alcun fornitore che combini video-inventory automatico italiano + agente WhatsApp + gestione social. Il caso Leonori (gruppo grande, Salesforce) valida la domanda; il mercato sotto è scoperto.

## 5. Soluzione SWA — Showroom AI

### 5.1 Value proposition
"Ogni auto del vostro stock diventa un video walkaround con voce italiana che ne evidenzia dotazioni e condizioni, pronto per Reels, TikTok e YouTube — generato dalle foto che avete già, senza operatori né montaggio. E quando un cliente scrive su WhatsApp alle 22:30 per la Golf del 2021, il vostro agente AI risponde in 30 secondi: prezzo, km, disponibilità, finanziamento indicativo — e vi consegna il lead già qualificato. Voi chiudete in showroom."

### 5.2 Moduli funzionali (dettagli in demo-plans/demo3)
1. **Video walkaround generator**: 10-15 foto stock + scheda (marca, modello, anno, km, prezzo, dotazioni top 5) → video 30-45s 9:16: Ken Burns + transizioni ffmpeg, overlay animati (prezzo/km/allestimento), voce ElevenLabs IT con script generato dalla scheda, musica di sottofondo licenziata, branding concessionaria
2. **Upgrade premium**: clip generativa Veo/Kling per auto di pregio (inquadratura cinematica) e avatar HeyGen presentatore per le promozioni
3. **Agente WhatsApp**: risponde su singolo annuncio o parco (via link wa.me per auto), FAQ (prezzo/km/allestimento/garanzia/finanziamento indicativo*), raccoglie nome/recapito/intenzione (permuta? finanziamento? test drive?) → scheda lead in dashboard + notifica al commerciale
4. **Social pipeline**: calendario contenuti automatico (nuovi arrivi, venduti/testimoni, promozioni) — costanza organica senza 15 ore/settimana di lavoro
5. **Reporting**: visualizzazioni video, lead WhatsApp qualificati, auto vendute con video vs senza (rotazione)

### 5.3 Integrazione tecnica
- Fase demo: upload manuale foto/scheda (le foto sono pubbliche sui marketplace — si prelevano dal loro annuncio per la demo!)
- Fase produzione: import da export DMS/CSV o scraping autorizzato dei loro annunci; output su Supabase + distribuzione via Meta API

## 6. Stima economics per il cliente (calcolo ROI usato in vendita)

Concessionaria indipendente, 80 auto in stock, rotazione media 55 giorni:
- Showroom AI: 299 EUR/mese (fino a 40 video/mese + agente WhatsApp)
- Dato USA: video = vendita 3-5 giorni più rapida. Ipotesi conservativa -4 giorni medi su 15 auto/mese vendute = 60 giorni-veicolo di stock liberati/mese
- Costo capitale immobilizzato ~8%/anno su valore medio 18k EUR: 60 gg × 18.000 × 8%/365 ≈ 240 EUR/mese di solo capitale, ma il vero valore è la **capacità di ruotare +1-2 auto/mese con margine medio 1.200 EUR = +1.200-2.400 EUR/mese**
- Lead WhatsApp: 30 richieste/mese fuori orario oggi senza risposta × 20% conversione × 1.200 EUR margine = +7.200 EUR potenziali (conservativamente +1.000 EUR con solo 3 vendite)
- **ROI > 7x anche in scenario prudente.**

## 7. Go-to-market

1. Selezione 15 target (criteri: indipendenti/multi-brand usato, 40+ auto su Autoscout/Subito, assenza video sugli annunci, presenza social debole)
2. Demo: prendere 1-2 auto reali dal loro stock pubblico → video walkaround pronto + agente WhatsApp demo → outreach
3. Outreach (script in sales-scripts/): "La Golf 2021 nel vostro stock ha solo 12 foto. Le ho fatto un video walkaround con voce italiana — 40 secondi, senza costi. Lo volete vedere prima che lo faccia anche per la BMW del concorrente?"
4. Canale aggregato: partnership con fornitori di servizi dealer (riparazioni, garantie estese, assicurazioni), fiere settore
5. Verticalizzazione futura: moto, camper, barche (stesso identico motore — la pipeline è già AGNOSTICA rispetto al veicolo)

## 8. Rischi specifici nicchia

| Rischio | Mitigazione |
|---|---|
| Qualità foto stock scarsa (fotografie marketplace fatte male) | Pipeline con enhance automatico foto pre-video; guida rapida "come fotografare lo stock" come deliverable |
| OEM brand guidelines (nuovo) | Focus USATO e indipendenti (nessun vincolo OEM); template neutri |
| Marketplaces che vietano il riutilizzo foto per demo | Demo per pitching diretto al dealer = fair use commerciale del loro stesso materiale; in produzione usare i loro upload diretti |
| Competitor enterprise che scende di segmento | Velocità e prezzo: loro modello richiede Salesforce e team; SWA è self-contained e 10x più economico |
| Automobili con overlay prezzo obsoleto | Il video rigenera automaticamente su cambio prezzo (job su data change) |
