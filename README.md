# Casa Weather Card

*[Read this in English](README.en.md)*

Card Lovelace per Home Assistant che unisce in un unico blocco compatto:

- Orologio digitale live + data in italiano
- Icona meteo animata (MDI, colorata in base alla condizione)
- Temperatura attuale, colorata per fascia
- Media / massima / minima temperatura calcolate dalle stanze configurate
- Alba, tramonto (da `sun.sun`), umidità, temperatura percepita
- Punto di rugiada esterno, colorato in base alla vicinanza con la temperatura attuale (allarme precoce di condensa)
- Griglia 3 colonne di mini-termometri per stanza (temperatura + umidità)
- Riepilogo rischio condensa a livello di casa: badge "Sì/No" con elenco delle stanze a rischio
- Punto di rugiada per stanza, mostrato come chip colorati (verde/arancio/rosso in base al margine dalla temperatura)
- Badge pioggia radar in tempo reale (pensato per un sensore RainViewer/pyscript, ma funziona con qualunque sensore testuale)
- Editor visuale nativo, nessuna scrittura YAML manuale richiesta

## Dipendenze

**Nessuna libreria esterna.** La card è un singolo Web Component scritto in HTML/CSS/JS nativo — nessun import, nessuna build step, nessuna dipendenza da HACS o npm.

Usa solo componenti già presenti in ogni installazione Home Assistant (caricati automaticamente dal frontend, non serve installarli):
- `ha-card`, `ha-icon` — rendering della card e delle icone MDI
- `ha-entity-picker`, `ha-icon-button`, `mwc-button` — solo nell'editor visuale, per i selettori e i controlli di configurazione

Richiede le seguenti entità già presenti nella tua istanza Home Assistant (non fornite dalla card):
- Un'entità `weather.*` (qualsiasi integrazione: Met.no, OpenWeatherMap, ecc.)
- `sun.sun` per alba/tramonto (integrazione Sun, attiva di default in HA)
- I sensori che scegli di collegare tramite configurazione (temperatura, umidità, pioggia, punto di rugiada, rischio condensa, ecc.) — la card legge qualsiasi entità `sensor.*` tu indichi, non richiede un'integrazione specifica

## Sensori derivati (non hardware)

Alcuni dati usati dalla card — punto di rugiada, rischio condensa, pioggia radar — non arrivano da nessun dispositivo fisico: vanno **calcolati** in Home Assistant a partire da sensori che già hai (temperatura/umidità) o da un servizio esterno (radar meteo).

Questo repository include due file di esempio, pronti da adattare, nella cartella [`examples_virtual_sensors/`](examples_virtual_sensors/):

- **`sensors_dew_point_mold_risk.yaml`** — Template sensor YAML che calcolano punto di rugiada (formula di Magnus) e rischio condensa/muffa a partire da una coppia di sensori temperatura+umidità esistenti. Include anche un esempio per la temperatura percepita esterna, utile se la tua integrazione meteo non la fornisce già.
- **`rainviewer_rain_radar.py`** — Script [pyscript](https://github.com/custom-components/pyscript) che legge il radar pubblico gratuito [RainViewer](https://www.rainviewer.com/) alle tue coordinate e pubblica un sensore con l'intensità di pioggia realmente osservata (non prevista), utile per il campo `rain_sensor`.

Entrambi i file sono commentati con istruzioni passo-passo su come adattarli (nomi stanze, coordinate, entity_id sorgente) e dove inserirli nella tua configurazione.

**Non vuoi editarli a mano?** La cartella include anche [`PROMPT_AI.md`](examples_virtual_sensors/PROMPT_AI.md): un prompt pronto da copiare in un assistente AI (Claude, ChatGPT, ecc.) insieme ai tuoi entity_id reali — l'AI genera il file finale già completo, senza placeholder da modificare.

## Installazione

### Tramite HACS (repository personalizzato)

1. HACS → Frontend → menu (⋮) in alto a destra → **Repository personalizzati**
2. Aggiungi l'URL di questo repository, categoria **Lovelace**
3. Cerca "Casa Weather Card" nella lista HACS → Scarica
4. Riavvia Home Assistant o ricarica le risorse Lovelace

### Manuale

1. Copia `casa-weather-card.js` in `/config/www/`
2. Impostazioni → Dashboard → ⋮ → Risorse → Aggiungi risorsa
   - URL: `/local/casa-weather-card.js`
   - Tipo: Modulo JavaScript

## Configurazione

```yaml
type: custom:casa-weather-card
entity: weather.forecast_home
temperature_sensor: sensor.termometro_esterno_temperature
humidity_sensor: sensor.termometro_esterno_humidity
rain_sensor: sensor.pioggia_radar_ora
feels_like_sensor: sensor.esterno_temperatura_percepita
dew_point_sensor: sensor.esterno_punto_di_rugiada
rooms:
  - name: Cucina
    entity: sensor.temperatura_cucina_2
    dew_point_entity: sensor.cucina_punto_di_rugiada
    mold_risk_entity: sensor.cucina_rischio_condensa
  - name: Salone
    entity: sensor.temperatura_salone_zig
    dew_point_entity: sensor.salone_punto_di_rugiada
    mold_risk_entity: sensor.salone_rischio_condensa
  - name: Camera
    entity: sensor.temperatura_camera
  - name: Elektra
    entity: sensor.temperatura_elektra
  - name: Corte
    entity: sensor.temperatura_corte
  - name: Corridoio
    entity: sensor.termometro_corridoio
```

### Opzioni

| Chiave | Obbligatoria | Descrizione |
|---|---|---|
| `entity` | Sì | Entità `weather.*` da cui leggere condizione meteo |
| `temperature_sensor` | No | Sensore per la temperatura principale (altrimenti usa l'attributo dell'entità weather) |
| `humidity_sensor` | No | Sensore umidità esterna |
| `feels_like_sensor` | No | Sensore temperatura percepita (accetta anche valori con virgola come separatore decimale, e stati `unknown`/`unavailable`) |
| `dew_point_sensor` | No | Sensore punto di rugiada esterno. Se non impostato, la relativa riga resta nascosta |
| `rain_sensor` | No | Sensore testuale con stato tra `assente`, `leggera`, `moderata`, `forte` |
| `rooms` | No | Lista di stanze da mostrare nella griglia mini-termometri |

Ogni voce di `rooms` supporta:

| Chiave | Obbligatoria | Descrizione |
|---|---|---|
| `name` | Sì | Etichetta mostrata nel chip. Usata anche come nome nel riepilogo punto di rugiada |
| `entity` | Sì | Sensore temperatura (o temperatura+umidità in un'unica stringa, es. `"22.5°C 45%"` — i numeri vengono estratti nell'ordine in cui compaiono) |
| `dew_point_entity` | No | Sensore punto di rugiada della stanza. Se assente, quella stanza non compare nel riepilogo punto di rugiada |
| `mold_risk_entity` | No | Sensore testuale di rischio condensa/muffa, con stato `OK` / `Attenzione` / `Critico` (colorato di conseguenza nel badge riepilogativo) |

`rooms` è interamente gestita da YAML o dall'editor visuale: aggiungere o togliere una stanza non richiede modifiche al codice della card. Media, massima e minima si ricalcolano automaticamente sulla lista fornita.

## Punto di rugiada e rischio condensa

Se configuri `dew_point_sensor` (esterno) e/o `dew_point_entity` per una o più stanze, la card mostra automaticamente il margine di sicurezza rispetto alla condensa, colorando il valore:

- **Azzurro**: margine ≥ 3° tra temperatura e punto di rugiada — condizione sicura
- **Arancione**: margine tra 1.5° e 3° — attenzione
- **Rosso**: margine < 1.5° — rischio condensa imminente

Se configuri anche `mold_risk_entity` per una o più stanze, appare un badge riepilogativo a piena larghezza ("Rischio condensa: Sì/No") con l'elenco delle stanze effettivamente a rischio.

## Editor visuale

La card include un editor visuale nativo: nell'interfaccia Lovelace, dopo averla aggiunta, usa il pulsante "Modifica" per passare dalla modalità YAML alla modalità visuale, con selettori entità e gestione dinamica delle stanze (aggiungi/rimuovi righe, campi opzionali per punto di rugiada e rischio condensa).

## Note

- Le fasce colore temperatura sono fisse nel codice (`<16° blu`, `16-21° verde acqua`, `21-25° verde`, `25-28° arancione`, `≥28° rosso`) — modificabili nella funzione `_tempColor`.
- Le soglie colore del punto di rugiada sono fisse nel codice — modificabili nella funzione `_dewGapColor`.
- L'icona meteo usa i codici condizione standard di Home Assistant (`sunny`, `partlycloudy`, `rainy`, ecc.).
