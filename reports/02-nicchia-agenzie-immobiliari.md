# Nicchia 1 — Agenzie Immobiliari
Soluzione SWA: **Listing Machine** | Report di mercato e posizionamento

---

## 1. Dimensione e struttura del mercato

- ~40.000 agenzie immobiliari attive in Italia (media piccole, 1-5 agenti); elevata frammentazione territoriale
- Mercato guidato dai portali: Immobiliare.it (leader), idealista, Casa.it; ingresso di capitali USA (CoStar in Wikicasa, piano da 9 mld USD per l'Europa) che stanno trasformando i portali in **piattaforme di lavoro** (CRM, valutazioni, AI, marketing automation)
- Modelli esteri di riferimento: Compass e Real Brokerage (USA) hanno costruito il vantaggio competitivo su tecnologia proprietaria, non sulla rete di uffici
- Tensione in atto: l'agente singolo italiano fa tutto da solo (incarichi, foto, annunci, marketing, trattative) — il modello "artigianale" è insostenibile quando servono competenze AI, dati, advertising

## 2. I dolori (evidenza numerica)

| Dolore | Dato | Fonte |
|---|---|---|
| Gli acquirenti vogliono video, gli agenti non li producono | **79% degli acquirenti chiede il video prima di visitare; solo il 18% degli agenti lo pubblica** | Immo Matin / IACrea 2026 |
| Immobili vuoti che stanziano | Virtual staging: vendita **18% più rapida** (64 vs 78 giorni mediana) e prezzo più vicino alla stima (-2% vs -7%) | FNAIM/OpinionWay |
| Costo storico della valorizzazione | Home staging fisico 3.000-10.000 EUR/immobile; fotografo pro + giorni di attesa | IACrea |
| Chiamate perse fuori orario | ~1 chiamata su 3 arriva in pausa pranzo/orari di chiusura | Immobiliare.it (launch Segreteria AI) |
| Concorrenza dei portali sui lead | I portali integrano segreteria AI e ricerca conversazionale nativa; l'agenzia dipende dai lead del portale | Immobiliare.it 2026 |
| AI Act: virtual staging non dichiarato = rischio sanzione | Art. 50 pienamente applicabile dal 2/8/2026; virtual staging e avatar vanno dichiarati | AI Act / onoffice / Requadro |

**Quadro**: il gap tra ciò che i clienti finali si aspettano (video, presentazione curata, risposta immediata) e ciò che la singola agenza produce (foto smartphone, testo base, nessun video) è ampio, misurabile e monetizzabile. L'AI ha reso la produzione di questi asset accessibile a costo quasi zero, ma serve qualcuno che la orchestri: **è il ruolo di SWA**.

## 3. Comportamento d'acquisto

- Decisore: titolare/agente principale; ciclo di vendita 1-3 settimane (nessun CDA)
- Trigger ricorrenti: nuovo incarico importante, immobile in stock da > 60 giorni, agente concorrente che pubblica video, rinnovo portali
- Canali: passaparola locale, Facebook/Instagram, eventi di categoria (FIAIP, Coach Immobiliare), LinkedIn
- Sensibilità al prezzo: media-alta per setup, buona per ricorrente se misurabile (giorni di giacenza, click, richieste)
- Diffidenza: verso "servizi web generici" (molti hanno già bruciato soldi con agenzie social poco serie) → la demo sul LORO immobile è l'antidoto

## 4. Concorrenza (dettaglio)

| Competitor | Offerta | Prezzo indicativo | Debolezza |
|---|---|---|---|
| IACrea | Virtual staging + video da foto + HDR app + pianificazione social | A consumo (pochi EUR/foto/video), abbonamenti | Self-service francese: richiede lavoro dell'agente, nessun done-for-you italiano, nessuna gestione social continuativa |
| Immobiliare.it Segreteria AI | Segreteria digitale multilingua 24/7 | In bundle coi servizi portale | Legata al portale; non copre produzione contenuti né social |
| Virtual staging SaaS (InstantDecoAI, Roomagen, AI HomeDesign, Edensign) | API/foto virtual staging | $0,16-1,33/foto | Tool, non servizio: l'agente deve imparare e fare da sé |
| Agenzie social locali | Gestione Instagram/Facebook | 300-800 EUR/mese | Contenuti generici, nessuna specializzazione immobiliare, nessun AI Act readiness |
| Coach/formatori immobiliari | Corsi AI per agenti | 500-2.000 EUR | Formazione, non esecuzione |
| **SWA — Listing Machine** | Pipeline completa done-for-you: foto → enhance/staging etichettato → video con voce IT → testo annuncio → pubblicazione multi-canale → reporting | Vedi report 05 | — |

**Bianco spaziale**: nessuno in Italia offre pipeline completa immobiliare done-for-you con compliance AI Act. IACrea è il più vicino ma self-service e non localizzato commercialmente in Italia.

## 5. Soluzione SWA — Listing Machine

### 5.1 Value proposition
"Caricate le foto dello smartphone. In 24 ore ricevete l'annuncio completo: foto potenziate, versione virtual staging dichiarata AI Act, video cinematografico con voce italiana, testo ottimizzato per portali e Google, mini-sito condivisibile e post social pronti. Ogni mese, per ogni immobile — a meno di quanto costa un fotografo per un solo servizio."

### 5.2 Pipeline tecnica (dettagli in demo-plans/demo1)
1. **Input**: agente carica 8-15 foto + 6 campi (indirizzo, mq, vani, prezzo, punti di forza, target)
2. **Enhance**: correzione luce/colori/prospettiva (Gemini Nano Banana o API esterna)
3. **Virtual staging** (per vuoti): arredamento con etichetta automatica "Immagine arredata virtualmente con AI — a fini illustrativi" (AI Act art. 50)
4. **Decluttering** (per occupati): rimozione oggetti personali — con policy dichiarata (mai nascondere difetti strutturali)
5. **Video**: 30-45s cinematic — Ken Burns/parallax ffmpeg su foto enhance + eventuale clip generativa (Veo) + voce ElevenLabs IT + sottotitoli + branding agenzia
6. **Testo annuncio**: LLM con struttura provata per portali (hook, descrizione, bullet dotazioni, CTA visita) + variante breve per social
7. **Mini-sito annuncio**: Next.js template (foto, video, mappa, form lead → notifica WhatsApp all'agenzia)
8. **Distribuzione**: pacchetto post Instagram/Facebook 9:16 + 1:1 programmato; esportazione formato portale
9. **Reporting mensile**: visualizzazioni, click, richieste generate per immobile

### 5.3 Perché è difendibile
- Il singolo tool (staging, video, testo) è commodity; **l'orchestrazione + il presidio italiano + la compliance** no
- Effetto scala: ogni immobile processato migliora i template (stili che convertono, copy per zona)
- Switching cost: pipeline integrata con il flusso di lavoro dell'agenzia (mandato → pubblicazione)

## 6. Stima economics per il cliente (calcolo ROI usato in vendita)

Agenzia con 4 incarichi nuovi/mese, giacenza media 90 giorni:
- Listing Machine: 199 EUR/mese flat (fino a 6 immobili/mese)
- Ipotesi conservativa: virtual staging + video riducono la giacenza del 10% (vs 18% FNAIM) = 9 giorni medi anticipati per immobile
- Provvigione media 3% su 250k EUR = 7.500 EUR; anticipo medio vendita di 9 giorni su 4 immobili/mese = capacità di gestire +1-2 incarichi/mese con le stesse risorse
- **Payback: il servizio costa meno di un solo giorno di provvigione recuperata.** (Da presentare come calcolo indicativo, mai come garanzia.)

## 7. Go-to-market

1. Selezione 15 agenzie target (criteri: 20+ annunci attivi sui portali, presenza Instagram debole/assente, zona urbana)
2. Per ciascuna: prelevare 1 annuncio reale pubblico → produrre demo personalizzata (video + staging + mini-sito con loro branding)
3. Outreach (script in sales-scripts/): "Ho già fatto il video per il vostro immobile in Via X — lo volete vedere? 30 secondi, nessun costo"
4. Meeting 15 min → attivazione setup → primi 30 giorni con garanzia
5. Referral: dopo 60 giorni, sconto un mese per ogni agenzia referenziata (il settore vive di passaparola FIAIP/gruppiWhatsApp di zona)

## 8. Rischi specifici nicchia

| Rischio | Mitigazione |
|---|---|
| Portali che bundlezzano gli stessi tool gratis | Loro vincolano al portale; SWA è indipendente e multi-canale; focus su done-for-you, non tool |
| Agenti scettici sull'AI ("le foto finte non piacciono") | Posizionamento: enhance sempre (reale), staging opzionale e SEMPRE dichiarato — la trasparenza è il brand |
| AI Act etichettatura | Etichetta automatica incorporata nella pipeline: conformità come feature vendibile |
| Stagionalità mercato immobiliare | Servizio ricorrente comunque utile (stock esistente); espansione ad affitti brevi/noleggio |
