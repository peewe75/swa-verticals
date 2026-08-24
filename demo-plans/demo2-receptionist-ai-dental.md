# Demo Plan 2 — Receptionist AI Sanitaria (Studi Odontoiatrici)
Obiettivo demo: far SCRIVERE al lead su WhatsApp con un agente che già risponde a nome del LORO studio.

---

## 1. Scenario dimostrativo

1. Lead riceve un messaggio: "Provate la receptionist AI del vostro studio: scrivetele, risponde come se lavorasse da voi. [link wa.me test number]"
2. Lead scrive "Buonasera, quanto costa una pulizia?" → risposta immediata col nome dello studio, orari, range prezzo con disclaimer
3. Lead scrive "mi fa male un dente da ieri" → **escalation**: "Ho avvisato lo studio, vi ricontattano in orario di apertura. Nel frattempo..." (+ notifica simulata alla reception)
4. Lead prova a prenotare → l'agente propone slot (agenda simulata Google Calendar) e conferma
5. Follow-up: SWA chiama: "Avete appena visto cosa farebbe per voi ogni sera, weekend e pausa pranzo"

## 2. Architettura agente

```
WhatsApp Cloud API (test number)
        │ webhook
        ▼
/api/wa/webhook (Vercel) ── verifica firma Meta ── salva messages
        │
        ▼
Orchestratore conversazione (route function):
   1. load tenant profile (studio: nome, orari, servizi, prezzi-range, tono)
   2. load conversation state (memoria breve: ultimi 10 msg)
   3. SAFETY CHECK regex+LLM: keyword urgenza/dolore/clinico → escalation path
   4. LLM call (OpenRouter) con system prompt verticale → risposta
   5. function calling: [check_slots, book_slot, confirm, escalate, ask_review]
   6. invio risposta (testo o template WA) + update state
```

Latenza target p95: < 4s (streaming del pensiero no; risposta singola; se > 8s → "Un momento..." immediato poi risposta).

## 3. System prompt (nucleo — versione demo)

```
Sei [Nome], receptionist virtuale dello studio odontoiatrico [Studio X] di [Città].
PERSONALITÀ: cordiale, efficiente, rassicurante. Risposte brevi (max 60 parole),
italiano professionale. Un'emoji max, solo se appropriato.

PUOI FARE:
- orari, indirizzo, modalità di accesso e pagamento
- costi INDICATIVI con disclaimer ("il preventivo preciso si definisce solo dopo
  la visita")
- prenotare/spostare appuntamenti (funzioni disponibili)
- raccogliere nome e numero se mancano
- richiedere/recallare con gentilezza

NON PUOI FARE (MAI):
- dare consigli clinici, diagnosi, suggerire farmaci o rimedi
- promettere esiti di trattamenti o sconti
- parlare male di altri studi
- discutere dati clinici di altri pazienti

ESCALATION OBBLIGATORIA se l'utente menziona: dolore, gonfiore, sanguinamento,
febbre, trauma/frattura, ascess*, urgenza, gonfiore al volto, o chiede un parere
clinico → chiama funzione escalate() e comunica che lo studio lo ricontatterà.

AI DISCLOSURE (inizio prima conversazione, una volta):
"Ciao! Sono [Nome], l'assistente virtuale dello Studio X. Scrivo tramite AI
e posso aiutarti con info e appuntamenti. Per esigenze cliniche ti passo
lo staff."
```

## 4. Funzioni (tools) per function calling

| Funzione | Trigger | Azione |
|---|---|---|
| `check_slots(date_range)` | utente vuole prenotare | query agenda (demo: Google Calendar simulato) |
| `book_slot(name, phone, slot, motivo)` | utente conferma | scrittura evento + conferma + promemoria programmato 48h/24h |
| `escalate(reason, urgency)` | keyword cliniche/urgenza | notifica immediata (demo: log + email a SWA e simula WhatsApp reception) |
| `send_review_link()` | completata visita (demo: dopo ringraziamento finale) | messaggio con link Google review dello studio |
| `schedule_recall(months, motivo)` | fine igiene | schedula recall in jobs |

## 5. Dati tenant demo (setup per lead, 20 min)

```json
{
  "studio_name": "Studio Dentistico [Rossi]",
  "city": "[Città]",
  "orari": {"lun-ven": "9:00-13:00, 14:30-19:00", "sab": "chiuso"},
  "servizi": ["Controllo", "Igiene", "Sbiancamento", "Ortodonzia", "Implanti"],
  "prezzi_indicativi": {"controllo": "gratuito*(*in promozione demo: no — sempre 'da definire')", "igiene": "80-120 EUR"},
  "tono": "famigliare",
  "google_review_url": "https://g.page/r/[reale se esiste]"
}
```

## 6. Flussi di test obbligatori (pre-outreach)

| # | Input test | Output atteso |
|---|---|---|
| 1 | "Buonasera, quanto costa una pulizia?" | Prezzo indicativo + disclaimer + offerta di prenotare |
| 2 | "Mi fa male un dente da due giorni" | Empatia breve + escalation immediata + "vi ricontatta lo studio" |
| 3 | "Voglio prenotare un controllo" | Raccolta nome → slot proposti → conferma |
| 4 | "Che dentista mi consigliate per mio figlio?" | Nessun consiglio clinico → invito a visita/contatto staff |
| 5 | "Fate sconti?" | Nessuno sconto improvvisato → informa e rimanda a staff |
| 6 | "Sei un robot?" | Trasparenza AI + disponibilità a passare lo staff |
| 7 | Messaggio in dialetto/informale | Adattamento tono, stessa sostanza |
| 8 | Doppio messaggio rapido | Gestione stato, nessuna risposta duplicata |

## 7. Compliance checklist demo

- [ ] Disclosure AI al primo messaggio (AI Act art. 50)
- [ ] Link "parla con lo staff" sempre disponibile (bottone WA)
- [ ] Nessun dato clinico richiesto o memorizzato dall'agente
- [ ] Consenso marketing esplicito prima di qualsiasi invio promozionale
- [ ] Privacy link nel profilo/business info del numero
- [ ] Log conversazioni exportabile (GDPR art. 15 readiness)

## 8. Landing demo (demo.swademo.it/dental)

1. Problema: "35% delle chiamate non riceve risposta. I pazienti scrivono alle 22."
2. Simulazione live: widget chat embedded (stesso motore WhatsApp, via web)
3. "Provatela dal vostro WhatsApp" — form: numero del lead → invio link wa.me
4. Cosa fa: FAQ / conferme / recall / recensioni / escalation (5 icone)
5. Prezzo + CTA meeting 15 min

## 9. Definition of Done

- [ ] 8/8 test flussi superati su test number
- [ ] Escalation funzionante con notifica < 10s
- [ ] Setup tenant nuovo lead < 20 min (form interno in core-admin)
- [ ] Widget web funzionante per chi non ha WhatsApp a portata di mano
- [ ] Conversazione dimostrabile dal telefono del fondatore senza rete WiFi (dati mobili)
