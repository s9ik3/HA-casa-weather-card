# Casa Weather Card

*[Leggi questo in italiano](README.md)*

A Lovelace card for Home Assistant that brings together, in one compact block:

- Live digital clock + date (English locale)
- Animated weather icon (MDI, colored based on condition)
- Current temperature, colored by range
- Average / max / min temperature calculated from the configured rooms
- Sunrise, sunset (from `sun.sun`), humidity, feels-like temperature
- Outdoor dew point, colored based on how close it is to the current temperature (early condensation warning)
- 3-column grid of mini room thermometers (temperature + humidity)
- House-wide condensation risk summary: a "Yes/No" badge listing rooms at risk
- Per-room dew point, shown as colored chips (green/orange/red based on the margin from room temperature)
- Real-time rain radar badge (designed for a RainViewer/pyscript sensor, but works with any text-state sensor)
- Native visual editor, no manual YAML editing required

## Dependencies

**No external libraries.** The card is a single Web Component written in native HTML/CSS/JS — no imports, no build step, no HACS or npm dependency.

It only uses components already present in every Home Assistant installation (auto-loaded by the frontend, nothing to install separately):
- `ha-card`, `ha-icon` — card rendering and MDI icons
- `ha-entity-picker`, `ha-icon-button`, `mwc-button` — visual editor only, for entity selectors and controls

It requires the following entities to already exist in your Home Assistant instance (not provided by the card itself):
- A `weather.*` entity (any integration: Met.no, OpenWeatherMap, etc.)
- `sun.sun` for sunrise/sunset (Sun integration, enabled by default in HA)
- Whichever sensors you choose to wire up in the configuration (temperature, humidity, rain, dew point, mold risk, etc.) — the card reads any `sensor.*` entity you point it to, no specific integration required

## Derived sensors (non-hardware)

Some data used by the card — dew point, mold risk, rain radar — doesn't come from any physical device: it needs to be **calculated** in Home Assistant from sensors you already have (temperature/humidity) or from an external service (weather radar).

This repository includes two ready-to-adapt example files, in the [`examples_virtual_sensors/`](examples_virtual_sensors/) folder:

- **`sensors_dew_point_mold_risk.yaml`** — YAML template sensors that calculate dew point (Magnus formula) and mold/condensation risk from an existing temperature+humidity sensor pair. Also includes an example for outdoor feels-like temperature, useful if your weather integration doesn't already provide one.
- **`rainviewer_rain_radar.py`** — [pyscript](https://github.com/custom-components/pyscript) script that reads the free public [RainViewer](https://www.rainviewer.com/) radar at your coordinates and publishes a sensor with the actually observed (not forecasted) rain intensity, useful for the `rain_sensor` field.

Both files are commented with step-by-step instructions on how to adapt them (room names, coordinates, source entity IDs) and where to place them in your configuration.

**Don't want to edit them by hand?** The folder also includes [`PROMPT_AI.en.md`](examples_virtual_sensors/PROMPT_AI.en.md): a ready-to-copy prompt for an AI assistant (Claude, ChatGPT, etc.) along with your real entity IDs — the AI generates the final, complete file with no placeholders to edit.

## Installation

### Via HACS (custom repository)

1. HACS → Frontend → menu (⋮) top right → **Custom repositories**
2. Add this repository's URL, category **Lovelace**
3. Search "Casa Weather Card" in the HACS list → Download
4. Restart Home Assistant or reload Lovelace resources

### Manual

1. Copy `casa-weather-card.js` to `/config/www/`
2. Settings → Dashboards → ⋮ → Resources → Add resource
   - URL: `/local/casa-weather-card.js`
   - Type: JavaScript module

## Configuration

```yaml
type: custom:casa-weather-card
entity: weather.forecast_home
temperature_sensor: sensor.outdoor_temperature
humidity_sensor: sensor.outdoor_humidity
rain_sensor: sensor.rain_radar_now
feels_like_sensor: sensor.outdoor_feels_like
dew_point_sensor: sensor.outdoor_dew_point
rooms:
  - name: Kitchen
    entity: sensor.kitchen_temperature
    dew_point_entity: sensor.kitchen_dew_point
    mold_risk_entity: sensor.kitchen_mold_risk
  - name: Living Room
    entity: sensor.living_room_temperature
    dew_point_entity: sensor.living_room_dew_point
    mold_risk_entity: sensor.living_room_mold_risk
  - name: Bedroom
    entity: sensor.bedroom_temperature
  - name: Kids Room
    entity: sensor.kids_room_temperature
  - name: Patio
    entity: sensor.patio_temperature
  - name: Hallway
    entity: sensor.hallway_temperature
```

### Options

| Key | Required | Description |
|---|---|---|
| `entity` | Yes | `weather.*` entity used to read the weather condition |
| `temperature_sensor` | No | Sensor for the main temperature (otherwise falls back to the weather entity's attribute) |
| `humidity_sensor` | No | Outdoor humidity sensor |
| `feels_like_sensor` | No | Feels-like temperature sensor (accepts comma as decimal separator, and `unknown`/`unavailable` states) |
| `dew_point_sensor` | No | Outdoor dew point sensor. If not set, the row stays hidden |
| `rain_sensor` | No | Text-state sensor with one of: `assente`, `leggera`, `moderata`, `forte` (empty, light, moderate, heavy) |
| `rooms` | No | List of rooms to show in the mini-thermometer grid |

Each entry in `rooms` supports:

| Key | Required | Description |
|---|---|---|
| `name` | Yes | Label shown on the chip. Also used as the room name in the dew point summary |
| `entity` | Yes | Temperature sensor (or a combined temperature+humidity string, e.g. `"22.5°C 45%"` — numbers are extracted in the order they appear) |
| `dew_point_entity` | No | Room's dew point sensor. If missing, that room won't appear in the dew point summary |
| `mold_risk_entity` | No | Text-state mold/condensation risk sensor, with state `OK` / `Attenzione` / `Critico` (colored accordingly in the summary badge) |

`rooms` is entirely managed via YAML or the visual editor: adding or removing a room requires no code changes to the card. Average, max, and min are automatically recalculated from whatever list you provide.

## Dew point and condensation risk

If you configure `dew_point_sensor` (outdoor) and/or `dew_point_entity` for one or more rooms, the card automatically shows the safety margin from condensation by coloring the value:

- **Blue**: margin ≥ 3° between temperature and dew point — safe
- **Orange**: margin between 1.5° and 3° — caution
- **Red**: margin < 1.5° — condensation risk imminent

If you also configure `mold_risk_entity` for one or more rooms, a full-width summary badge appears ("Rischio condensa: Sì/No" — "Condensation risk: Yes/No") listing the rooms actually at risk.

## Visual editor

The card ships with a native visual editor: in the Lovelace UI, after adding it, use the "Edit" button to switch from YAML mode to visual mode, with entity pickers and dynamic room management (add/remove rows, optional dew point and mold risk fields).

## Notes

- Temperature color bands are hardcoded (`<16° blue`, `16-21° teal`, `21-25° green`, `25-28° orange`, `≥28° red`) — adjustable in the `_tempColor` function.
- Dew point color thresholds are hardcoded — adjustable in the `_dewGapColor` function.
- The weather icon uses Home Assistant's standard condition codes (`sunny`, `partlycloudy`, `rainy`, etc.).
- The card's internal labels and the condensation-risk sensor states (`OK`/`Attenzione`/`Critico`) are currently in Italian, matching the original setup this card was built for.
