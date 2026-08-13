# Casa Weather Card

Card Lovelace per Home Assistant che unisce in un unico blocco compatto:

- Orologio digitale live + data in italiano
- Icona meteo animata (MDI, colorata in base alla condizione)
- Temperatura attuale, colorata per fascia
- Media / massima / minima temperatura calcolate dalle stanze configurate
- Alba, tramonto (da `sun.sun`), umidità, temperatura percepita
- Griglia 3 colonne di mini-termometri per stanza (temperatura + umidità)
- Badge pioggia radar in tempo reale (pensato per un sensore RainViewer/pyscript, ma funziona con qualunque sensore testuale)

Zero dipendenze esterne: solo HTML/CSS/JS nativo, nessuna libreria di terze parti.

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
| `name` | Sì | Etichetta mostrata nel chip |
| `entity` | Sì | Sensore temperatura (o temperatura+umidità in un'unica stringa, es. `"22.5°C 45%"` — i numeri vengono estratti nell'ordine in cui compaiono) |
| `dew_point_entity` | No | Sensore punto di rugiada della stanza. Se assente, la riga extra del chip non compare |
| `mold_risk_entity` | No | Sensore testuale di rischio condensa/muffa, con stato `OK` / `Attenzione` / `Critico` (colorato di conseguenza) |

`rooms` è interamente gestita da YAML o dall'editor visuale: aggiungere o togliere una stanza non richiede modifiche al codice della card. Media, massima e minima si ricalcolano automaticamente sulla lista fornita.

## Editor visuale

La card include un editor visuale nativo: nell'interfaccia Lovelace, dopo averla aggiunta, usa il pulsante "Modifica" per passare dalla modalità YAML alla modalità visuale, con selettori entità e gestione dinamica delle stanze (aggiungi/rimuovi righe).

## Note

- Le fasce colore temperatura sono fisse nel codice (`<16° blu`, `16-21° verde acqua`, `21-25° verde`, `25-28° arancione`, `≥28° rosso`) — modificabili nella funzione `_tempColor`.
- L'icona meteo usa i codici condizione standard di Home Assistant (`sunny`, `partlycloudy`, `rainy`, ecc.).
