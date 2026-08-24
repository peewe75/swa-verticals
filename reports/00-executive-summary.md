# Executive Summary — SWA Vertical AI
**Progetto: penetrazione mercato PMI italiano con soluzioni AI productized per 3 nicchie verticali**
Data: 24 agosto 2026 | Versione: 1.0

---

## 1. La tesi strategica

Il mercato italiano delle PMI è il più grande parco clienti sottoservito d'Europa per l'AI:

- Solo il **15,7% delle PMI** (10+ addetti) usa strumenti AI contro il **53,1%** delle grandi imprese (ISTAT 2025)
- Il **76% delle PMI non ha investito né prevede di investire in AI** a breve (Politecnico di Milano)
- La barriera **non è il budget** (solo il 6,6% cita i costi come ostacolo): sono le **competenze e i processi**
- Dal **2 agosto 2026 l'AI Act è pienamente applicabile**: le PMI che usano AI informalmente (ChatGPT per annunci, virtual staging, chatbot) sono ora esposte a obblighi di trasparenza e sanzioni — e non lo sanno

**Implicazione commerciale**: chi vende "AI" generica alle PMI fallisce. Chi vende **soluzioni verticali chiavi in mano, compliance-ready, con demo già pronta e personalizzata sul lead** vince. È il modello productized-service statunitense (tipo DesignJoy, but vertical AI) applicato al vuoto italiano.

## 2. Le 3 nicchie selezionate

| # | Nicchia | Mercato | Dolore principale | Soluzione SWA | Demo |
|---|---------|---------|-------------------|---------------|------|
| 1 | Agenzie immobiliari | ~40.000 agenzie in IT; 79% acquirenti vuole video, solo 18% agenti lo produce; virtual staging = vendita 18% più rapida | Annunci con foto scadenti, zero video, immobile che stanzia | **Listing Machine** — da foto smartphone a pacchetto annuncio completo: foto enhance + virtual staging + video con voce AI + testo + mini-sito | Trasformare un annuncio reale del lead in 48h |
| 2 | Studi odontoiatrici | Settore ~10 mld EUR; 30-50 messaggi WhatsApp/giorno; 35% chiamate perse; recall manuale; recensioni non gestite | Reception sovraccarica, no-show, pazienti inattivi persi, richieste notturne senza risposta | **Receptionist AI Sanitaria** — agente WhatsApp 24/7: FAQ, prenotazioni, conferme, recall, recensioni, escalation umana su urgenze | Agente WhatsApp già configurato col nome dello studio del lead |
| 3 | Concessionarie / usato | Usato 24,4 mld EUR vs nuovo 16,5; margini nuovo <1%; video listing = 5x visualizzazioni, 400% più richieste (dato USA) | Stock di decine/giocate di auto con solo foto; lead WhatsApp non qualificati; stock che stanzia | **Showroom AI** — video walkaround automatico da foto stock (voce AI IT, overlay prezzo/km) + agente WhatsApp qualificatore | Video del veicolo reale nello stock del lead + agente demo |

**Criterio di selezione**: (1) dolore misurabile in euro, (2) alto valore unitario della soluzione (ticket medio cliente 200-500 EUR/mese), (3) demo riproducibile in ore con wow-effect, (4) cicli di vendita brevi (decisione del titolare, no CDA), (5) ricorrenza mensile (MRR).

## 3. Architettura: una piattaforma, tre verticali

Il 70% dell'infrastruttura è condivisa tra le 3 soluzioni (stack già in possesso di SWA):

```
                    ┌──────────────────────────────────────────┐
                    │  Vercel — Next.js (app verticali + demo)  │
                    └───────────────┬──────────────────────────┘
                                    │
        ┌───────────────┬───────────┴──────────┬────────────────┐
        │               │                      │                │
┌───────▼──────┐ ┌──────▼───────┐  ┌───────────▼───┐  ┌─────────▼────────┐
│   Supabase   │ │  OpenRouter  │  │ Google Gemini │  │  Oracle VPS free │
│ auth, DB,    │ │ LLM (Claude/ │  │ Nano Banana   │  │ ffmpeg rendering │
│ storage, cron│ │ GPT) testo   │  │ (staging/foto)│  │ job video queue  │
└──────────────┘ └──────────────┘  └───────────────┘  └──────────────────┘
        │               │                      │                │
        └───────────────┴──────────┬───────────┴────────────────┘
                                    │
        ┌───────────────┬───────────┴──────────┬────────────────┐
┌───────▼──────┐ ┌──────▼───────┐  ┌───────────▼───┐  ┌─────────▼────────┐
│  ElevenLabs  │ │    HeyGen    │  │ WhatsApp Cloud│  │  Pexels/Pixabay  │
│ voce IT (30' │ │ avatar (30'  │  │ API (tier     │  │ asset social     │
│ /mese)       │ │ /mese)       │  │ gratuito)     │  │                  │
└──────────────┘ └──────────────┘  └───────────────┘  └──────────────────┘
```

**Nota n8n**: non serve abbonamento. Due opzioni: (a) orchestrazione diretta in codice — scelta per le demo, più pulita per una software house; (b) n8n Community Edition self-hosted gratuita su Oracle VPS — eventuale fase 2 per automazioni client-specific.

## 4. Offerta e pricing (dettagli in report 05)

| Pacchetto | Setup | Mensile | Contenuto |
|-----------|-------|---------|-----------|
| Starter verticale | 490-990 EUR | da 149 EUR/mese | 1 soluzione verticale attiva e gestita da SWA |
| Growth | — | 299-499 EUR/mese | Soluzione + contenuti social + reporting KPI |
| AI Employee (stile Fonio.ai) | — | da 250 EUR/mese | Agente AI dedicato con nome del cliente, multi-canale |

Posizionamento: **metà prezzo di un'agenzia tradizionale, risultato demo-first, zero rischio per il cliente** (primo mese con garanzia). Benchmark competitor: Engrana (Spagna) 149-239 EUR/mese solo WhatsApp; Purple Luna (UK) £69/mese solo booking; tool USA video listing $249+/mese self-service.

## 5. Piano demo (dettagli in report 06 e demo-plans/)

- **Settimana 1**: core condiviso (auth Supabase, wrapper API LLM/TTS/WhatsApp, template Vercel) + report definitivi
- **Settimana 2**: Demo 3 Showroom AI (pipeline ffmpeg più semplice, zero costi) + Demo 2 Receptionist (WhatsApp test number)
- **Settimana 3**: Demo 1 Listing Machine (Gemini Nano Banana staging + video) + HeyGen presenter
- **Settimana 4**: personalizzazione per 3-5 lead target per nicchia, landing demo, collaudo end-to-end

**Budget totale: ~50-100 EUR** (dominio + eventuali crediti extra). Stack già posseduto.

## 6. KPI di successo (90 giorni)

| Metrica | Target |
|---------|--------|
| Demo realizzate e personalizzabili | 3 (una per nicchia) |
| Lead contattati con demo personalizzata | 45 (15 per nicchia) |
| Tasso conversione demo → meeting | ≥ 30% |
| Clienti paganti a 90 giorni | 6-9 (2-3 per nicchia) |
| MRR a 90 giorni | 1.500-3.500 EUR |
| Costo infrastruttura per cliente | < 25 EUR/mese |

## 7. Rischi e mitigazioni

| Rischio | Probabilità | Mitigazione |
|---------|-------------|-------------|
| AI Act: etichettatura contenuti sintetici | Certa (è legge) | Le demo nascono già compliance-ready: etichette automatiche "immagine virtualmente arredata" / disclosure chatbot = vantaggio competitivo, non costo |
| GDPR dati sanitari (dental) | Alta | Dati minimi, hosting EU (Supabase eu-central), DPA pronto, escalation umana obbligatoria su anything clinico |
| Qualità video-gen instabile | Media | Pipeline ibrida: ffmpeg deterministico (Ken Burns/overlay) come base affidabile, generativo (Veo/Kling) come optional premium |
| WhatsApp Cloud API: limiti tier gratuito | Media | Demo su test number illimitato; numero verificato cliente solo alla firma |
| Concentrazione vendita su fondatore | Alta | Sales scripts standardizzati (sales-scripts/) + demo self-service su landing |

## 8. Prossime azioni immediate

1. Approvare naming delle 3 soluzioni (Listing Machine / Receptionist AI / Showroom AI — modificabili)
2. Registrare dominio demo (es. swademo.it) e configurare progetto Vercel + Supabase
3. Richiedere accesso WhatsApp Cloud API (test number immediato, gratuito)
4. Selezionare 5 lead target per nicchia (criteri in sales-scripts/)
5. Kick-off settimana 1 secondo piano in report 06
