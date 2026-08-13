# Prompt per generare i sensori virtuali con un'AI

Copia il testo qui sotto in un assistente AI (Claude, ChatGPT, ecc.), sostituendo la sezione "I MIEI DATI" con le informazioni della tua installazione Home Assistant. L'AI genererà i file pronti da incollare, senza placeholder da modificare a mano.

---

```
Agisci come un esperto di Home Assistant. Devo generare dei "sensori virtuali"
(template sensor YAML e/o uno script pyscript) per la card Lovelace
"Casa Weather Card", partendo da due file template che ti allego:

1. sensors_dew_point_mold_risk.yaml — calcola punto di rugiada (formula di
   Magnus) e rischio condensa/muffa (OK / Attenzione / Critico) a partire da
   sensori temperatura + umidità già esistenti.
2. rainviewer_rain_radar.py — script pyscript che legge il radar pubblico
   RainViewer alle mie coordinate e pubblica un sensore con l'intensità di
   pioggia osservata in tempo reale.

Usa questi due file SOLO come riferimento di stile, formule e struttura.
Non copiare i nomi placeholder (es. "living_room", "sensor.outdoor_temperature"):
genera il file finale usando ESATTAMENTE gli entity_id e i nomi che ti indico
sotto, senza lasciare nulla da modificare a mano.

## I MIEI DATI

Coordinate di casa (per il sensore pioggia radar):
- Latitudine: <inserisci qui>
- Longitudine: <inserisci qui>

Stanze da monitorare per punto di rugiada e rischio condensa
(elenca ogni stanza con i relativi entity_id di temperatura e umidità già
esistenti in Home Assistant — puoi trovarli in Sviluppatore → Stati):

- Nome stanza: <es. Cucina>
  Sensore temperatura: <es. sensor.temperatura_cucina>
  Sensore umidità: <es. sensor.temperatura_cucina_humidity>

- Nome stanza: <es. Salone>
  Sensore temperatura: <es. sensor.temperatura_salone>
  Sensore umidità: <es. sensor.temperatura_salone_humidity>

(aggiungi altre stanze se necessario)

Sensore esterno (opzionale, per il punto di rugiada esterno e/o temperatura
percepita esterna):
- Sensore temperatura esterna: <es. sensor.termometro_esterno_temperature>
- Sensore umidità esterna: <es. sensor.termometro_esterno_humidity>

## COSA VOGLIO IN OUTPUT

1. Un file YAML completo con i template sensor per punto di rugiada e
   rischio condensa di ogni stanza che ho elencato, pronto da incollare
   nella mia configurazione (o da includere come file separato).
2. Se ho indicato le coordinate di casa, anche lo script pyscript completo
   per il sensore pioggia radar, con le coordinate già inserite.
3. Alla fine, elenca gli entity_id risultanti che dovrò usare nella
   configurazione della Casa Weather Card (campi dew_point_sensor,
   dew_point_entity, mold_risk_entity, rain_sensor).
```

---

## Note

- Se non hai ancora sensori di temperatura/umidità per una stanza, il prompt non può generare nulla per quella stanza: serve prima un sensore fisico (Zigbee, BLE, ESPHome, ecc.) che li fornisca.
- Le soglie di rischio condensa (1.5° critico, 3° attenzione) sono quelle usate dalla Casa Weather Card stessa per colorare i chip — se le cambi nel sensore, ricordati che il colore mostrato dalla card resta comunque calcolato sulle sue soglie interne, indipendenti dal sensore.
