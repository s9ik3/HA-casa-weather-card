# AI prompt to generate your virtual sensors

Copy the text below into an AI assistant (Claude, ChatGPT, etc.), replacing the "MY DATA" section with your own Home Assistant setup details. The AI will generate ready-to-paste files, with no placeholders left to edit by hand.

---

```
Act as a Home Assistant expert. I need to generate "virtual sensors"
(YAML template sensors and/or a pyscript script) for the "Casa Weather Card"
Lovelace card, starting from two template files I'm attaching:

1. sensors_dew_point_mold_risk.yaml — calculates dew point (Magnus formula)
   and mold/condensation risk (OK / Attenzione / Critico) from existing
   temperature + humidity sensors.
2. rainviewer_rain_radar.py — a pyscript script that reads the public
   RainViewer radar at my coordinates and publishes a sensor with the
   real-time observed rain intensity.

Use these two files ONLY as a reference for style, formulas, and structure.
Do not copy the placeholder names (e.g. "living_room", "sensor.outdoor_temperature"):
generate the final file using EXACTLY the entity IDs and names I give you
below, with nothing left to edit by hand.

## MY DATA

Home coordinates (for the rain radar sensor):
- Latitude: <insert here>
- Longitude: <insert here>

Rooms to monitor for dew point and condensation risk
(list each room with its existing temperature and humidity entity IDs —
you can find these under Developer Tools → States):

- Room name: <e.g. Kitchen>
  Temperature sensor: <e.g. sensor.kitchen_temperature>
  Humidity sensor: <e.g. sensor.kitchen_humidity>

- Room name: <e.g. Living Room>
  Temperature sensor: <e.g. sensor.living_room_temperature>
  Humidity sensor: <e.g. sensor.living_room_humidity>

(add more rooms as needed)

Outdoor sensor (optional, for outdoor dew point and/or outdoor feels-like
temperature):
- Outdoor temperature sensor: <e.g. sensor.outdoor_temperature>
- Outdoor humidity sensor: <e.g. sensor.outdoor_humidity>

## WHAT I WANT AS OUTPUT

1. A complete YAML file with the dew point and mold risk template sensors
   for every room I listed, ready to paste into my configuration (or to
   include as a separate file).
2. If I provided home coordinates, also the complete pyscript script for
   the rain radar sensor, with the coordinates already filled in.
3. At the end, list the resulting entity IDs I'll need to use in the
   Casa Weather Card configuration (dew_point_sensor, dew_point_entity,
   mold_risk_entity, rain_sensor fields).
```

---

## Notes

- If you don't have temperature/humidity sensors for a room yet, the prompt can't generate anything for that room: you first need a physical sensor (Zigbee, BLE, ESPHome, etc.) providing them.
- The condensation risk thresholds (1.5° critical, 3° caution) are the same ones used internally by the Casa Weather Card to color the chips — if you change them in the sensor, remember the color shown by the card is still calculated against its own internal thresholds, independent from the sensor's state.
