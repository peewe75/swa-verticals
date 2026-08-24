# Nicchia 2 — Studi Odontoiatrici
Soluzione SWA: **Receptionist AI Sanitaria** | Report di mercato e posizionamento

---

## 1. Dimensione e struttura del mercato

- Settore odontoiatrico italiano: **~10 miliardi EUR/anno** di giro d'affari famiglie (Key-Stone), stabile con crescita volumi e calo ticket medio
- Spesa media ultimo ciclo di cure: 462 EUR (in calo -9,2% da 509); 70% dei pazienti ha speso < 300 EUR → più volumi a valore unitario inferiore = **le agende si saturano di attività a basso margine**
- Struttura: predominanza di studi 1-3 poltrone a gestione familiare (titolare + compagno/a alla reception)
- **Fattore demografico chiave**: quiescenza attesa di ~30.000 dentisti nei prossimi 3-7 anni (Fnomceo) → meno clinici, più pressione organizzativa, maggiore valorizzazione delle figure non mediche e dell'automazione
- 1 paziente su 4 usa assicurazioni/fondi convenzioni; la relazione di fiducia (9% rinuncia alla convenzione per restare col proprio dentista) è l'asset competitivo dello studio

## 2. I dolori (evidenza numerica)

| Dolore | Dato | Fonte |
|---|---|---|
| Reception sovraccarica | 40-60 min/giorno solo per conferme appuntamenti; 30-50 messaggi WhatsApp/giorno per studio, molti fuori orario | Engrana (benchmark ES) |
| Chiamate perse = pazienti persi | 35% delle chiamate senza risposta = 200-500 EUR persi per paziente | VIKI |
| Recensioni non gestite | Solo 24% delle strutture sanitarie risponde alle recensioni; solo 57% ha revendicato la scheda Google | Noetica/About Health 2025 |
| Recensioni in crescita di importanza | +20% YoY recensioni sanitarie online; i pazienti scelgono su tempi, costi chiari e reputazione | Noetica |
| No-show | 20-30% senza promemoria automatici (benchmark beauty/sanità privata) | Supalabs |
| Recall informale | Pazienti inattivi mai richiamati; igiene ogni 6 mesi dimenticata = ricavo ricorrente perso | Analisi settore |
| Marketing non conforme | Copy sanitario con messaggi promozionali/suggestivi = violazione deontologica; multe Antitrust/Ordine | DentalPRO case, codice deontologia |
| Digitalizzazione fiscale in calo | Crediti Transizione 4.0/5.0 in esaurimento → meno budget capex, più interesse per opex (servizi mensili) | Doctor OS |

**Quadro sintetico**: lo studio odontoiatrico italiano ha un problema di **comunicazione e organizzazione**, non clinico. La reception è il collo di bottiglia: rispondere, confermare, richiamare, recensire sono attività ripetitive, misurabili e perfettamente automatizzabili — con vincoli normativi (sanità, GDPR, AI Act) che rendono il fai-da-te pericoloso.

## 3. Comportamento d'acquisto

- Decisore: titolare (spesso coppia familiare); influenza del commercialista; ciclo vendita 2-4 settimane
- Trigger: ondata di no-show, estate (pausa attività), polemica su recensioni negative, dipendente reception che si licenzia/matura
- Canali: referenti di settore (consulenti dentali, fornitori impianti), Google recensioni dei competitor, LinkedIn e Instagram
- **Filtro anti-fuffa molto alto**: bombardati da agenzie marketing che promettono "nuovi pazienti" con formazioni non conformi → vendere **efficienza e riattivazione** (non "più pazienti") è più credibile e conforme
- Il paziente tipo cerca: risposta immediata, prezzi chiari, prenotare da WhatsApp di sera — lo studio che risponde in 30 secondi vince il paziente che scrive a 3 studi

## 4. Concorrenza (dettaglio)

| Competitor | Paese | Offerta | Prezzo | Debolezza vs SWA |
|---|---|---|---|---|
| Engrana | Spagna | Layer WhatsApp + AI + recall + recensioni + depositi Stripe sopra i gestionali (Dentalink, Gesden...) | 149-239 EUR/mese | Non presente in Italia; no italiano; RGPD ES |
| Purple Luna | UK | Receptionist WhatsApp (booking, FAQ) | £69-99/mese | UK-centric, no italiano |
| Kura | ES/EN | Agente WhatsApp clinico: booking, reminders, NPS, multilingua, escalation | nd (abbonamento) | Non localizzata Italia |
| VIKI | ES | Piattaforma completa gestione studio + WhatsApp AI + voice | nd | Piattaforma completa: sostituisce il gestionale (switching cost altissimo) |
| Oravio | CH | Receptionist AI voce + WhatsApp per studi svizzeri | nd (premium CH) | Prezzi CH, non Italia |
| Gestionali IT (es. quelle citate: slogga, GAC, ecc.) | IT | Gestionali con moduli SMS promemoria base | 30-100 EUR/mese | Non conversazionali, non AI, no recall intelligente, no recensioni |
| Agenzie marketing sanitario IT | IT | SEO/Ads/siti | 300-1.500 EUR/mese | Acquisizione only; zero automazione operativa; conformità precaria |
| **SWA — Receptionist AI** | IT | Layer WhatsApp AI in italiano sopra il gestionale esistente: FAQ conformi, conferme, recall 6 mesi, recensioni, escalation urgenze, reporting | 149-299 EUR/mese | — |

**Bianco spaziale**: il modello Engrana (validato in Spagna a 149-239 EUR/mese) **non ha equivalente italiano**. Il mercato italiano è servito da gestionali muti e agenzie marketing non conformi. First-mover window aperta.

## 5. Soluzione SWA — Receptionist AI Sanitaria

### 5.1 Value proposition
"Il vostro studio ha una seconda receptionist che lavora 24/7 su WhatsApp, parla italiano, conosce i vostri servizi e orari, conferma gli appuntamenti, richiama i pazienti per l'igiene ogni 6 mesi, chiede la recensione Google dopo la visita — e passa al vostro staff qualsiasi cosa sia clinica o urgente. Compatibile col gestionale che avete già. Tutto a norma: GDPR, dati in Europa, dichiarazione AI secondo l'AI Act."

### 5.2 Moduli funzionali (dettagli in demo-plans/demo2)
1. **Agente FAQ conforme**: orari, costi indicativi* disclaimer, modalità pagamento, prima visita (*mai preventsivi clinici: rimanda in studio — conformità deontologica)
2. **Conferme 48h + 24h** via WhatsApp con bottone conferma/riprogramma
3. **Recall intelligente**: igiene 6 mesi, ortodonzia controlli, piano cure interrotto (riattivazione preventivi non accettati — il giacimento d'oro dello studio)
4. **Recensioni**: richiesta 24-72h post visita con link diretto Google; risposta assistita AI alle recensioni (comunicato revisionato dallo studio)
5. **Escalation umana**: keyword "dolore/urgenza/sanguinamento/frattura" → notifica immediata reception/dentista; l'AI non diagnostica MAI
6. **Waitlist dinamica**: disdetta → slot offerto automaticamente alla lista d'attesa
7. **Reporting mensile**: messaggi gestiti, conferme, no-show evitati, recall generati, recensioni raccolte

### 5.3 Compliance by design (diversificatore chiave)
- Dichiarazione AI a inizio conversazione (AI Act art. 50) + passaggio umano su richiesta
- Dati minimi: nome, telefono, data — niente dati clinici in chat; archiviazione Supabase EU (eu-central-1); DPA pronto da firmare
- Prompt-engineering con vincoli deontologici: niente promesse terapeutiche, niente sconti-pressure, prezzi sempre "indicativi, da valutazione in studio"
- Registro elaborazioni e consensi GDPR pronti come allegato contrattuale

### 5.4 Integrazione tecnica
- Fase demo: standalone (agenda Google del cliente o slot simulati)
- Fase produzione: webhook/API verso i gestionali dentali più diffusi (molti espongono API o export); in mancanza: doppia scrittura su Google Calendar condiviso — la reception vede tutto

## 6. Stima economics per il cliente (calcolo ROI usato in vendita)

Studio 2 poltrone, 350 pazienti attivi/anno, 12 visite/giorno:
- Receptionist AI: 199 EUR/mese
- No-show ridotto dal 20% al 7% (benchmark promemoria WhatsApp) = +1,5 visite/giorno recuperate × 22 gg × ticket igene/visita media 80 EUR ≈ **+2.600 EUR/mese**
- Recall igiene: 100 pazienti richiamabili/6 mesi × 35% conversione × 80 EUR ≈ +2.800 EUR/6 mesi ≈ +470 EUR/mese
- Recensioni: +8-10 recensioni/mese → effetto SEO locale (non monetizzabile direttamente ma decisivo)
- **ROI ~15x sul costo del servizio.** (Presentare come scenario conservativo, mai garanzia.)

## 7. Go-to-market

1. Selezione 15 studi target (criteri: 2+ poltrone, scheda Google con <50 recensioni e risposte assenti, sito statico o assente, zona urbana)
2. Demo: agente WhatsApp su test number già istruito con nome/orari/servizi dello studio del lead
3. Outreach (script in sales-scripts/): "Ho simulato la vostra receptionist AI: scrivetele qualcosa su WhatsApp — risponde col nome del vostro studio. Se vi convince, parliamo 15 minuti"
4. Canale aggregato: partnership con consulenti di gestione studio dentistico e commercialisti di settore (provvigione 10%)
5. Case study pilota: 1 studio a titolo scontato (50%) in cambio di testimonianza e dati misurati a 60 giorni

## 8. Rischi specifici nicchia

| Rischio | Mitigazione |
|---|---|
| Riserve etico-deontologiche degli ordini | Design conservativo: mai diagnosi, mai preventivi online, escalation umana; documentare conformità |
| GDPR dati salute (art. 9) | Nessun dato clinico processato; dati anagrafici minimi in EU; DPA + registro; DPIA template |
| Gestionali chiusi senza API | Integrazione via Google Calendar condiviso in fase 1; connettore dedicato come progetto fase 2 |
| Ingresso Engrana/Kura in Italia | Velocità: first-mover + localizzazione profonda (conformismo deontologico italiano ≠ Spagna) |
| Aspettative "più pazienti subito" | Contratto su KPI di efficienza (no-show, recall, recensioni), non su nuovi pazienti |
