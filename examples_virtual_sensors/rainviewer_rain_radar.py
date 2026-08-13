# rainviewer_rain_radar.py
# ==================================================
# Sensore DERIVATO (calcolato via script), non collegato
# a nessun dispositivo hardware.
#
# Legge il radar pubblico RainViewer per una coppia di
# coordinate e calcola l'intensità di pioggia REALE
# (osservata dal radar), non prevista da un modello meteo.
# Aggiorna un sensore Home Assistant ogni 5 minuti.
#
# ATTRIBUZIONE OBBLIGATORIA (termini d'uso gratuiti RainViewer):
# "Weather data by RainViewer" - https://www.rainviewer.com/
#
# REQUISITI:
# - Integrazione pyscript installata via HACS, con le opzioni
#   "Allow All Imports" e "Access hass as a global variable" attive
#   (Impostazioni → Dispositivi e servizi → Pyscript → Configura)
#
# COME USARE QUESTO FILE:
# 1. Sostituisci LAT e LON qui sotto con le coordinate di casa tua.
# 2. Copia questo file in /config/pyscript/
# 3. Sviluppatore → Azioni → pyscript.reload (o riavvia Home Assistant)
# 4. Verifica che compaia sensor.rain_radar_now in
#    Sviluppatore → Stati
# 5. Usa quell'entity_id nel campo rain_sensor della
#    Casa Weather Card.
# ==================================================

import requests
from PIL import Image
from io import BytesIO

# --- CONFIGURAZIONE: sostituisci con le tue coordinate ---
LAT = 0.0   # <-- METTI QUI LA TUA LATITUDINE
LON = 0.0   # <-- METTI QUI LA TUA LONGITUDINE
ZOOM = 7        # zoom massimo consentito da RainViewer, tile più piccolo = più preciso
SIZE = 256      # dimensione tile (256 o 512)
COLOR_SCHEME = 2  # 2 = "Universal Blue", buon compromesso leggibilità/precisione
SMOOTH = 1      # 1 = immagine sfumata (più rappresentativa dell'area)
SNOW = 0        # non ci serve la neve

ENTITY_ID = "sensor.rain_radar_now"  # cambia se vuoi un altro entity_id


# Tabella approssimativa di conversione intensità colore -> etichetta
# (lo schema "Universal Blue" va dal trasparente al blu intenso al giallo/rosso)
def classifica_intensita(r, g, b, a):
    if a < 30:
        # praticamente trasparente = nessuna pioggia rilevata
        return "assente", 0
    intensita = (r + g + b) / 3
    if a < 100:
        return "leggera", 1
    elif intensita < 150:
        return "moderata", 2
    else:
        return "forte", 3


# --- Funzioni bloccanti (rete + parsing immagine) ---
# Eseguite in un thread separato tramite task.executor(),
# come richiesto da Home Assistant per non violare il loop asyncio.

@pyscript_compile
def _fetch_meta():
    return requests.get(
        "https://api.rainviewer.com/public/weather-maps.json",
        timeout=10
    ).json()


@pyscript_compile
def _fetch_tile(tile_url):
    resp = requests.get(tile_url, timeout=10)
    img = Image.open(BytesIO(resp.content)).convert("RGBA")
    cx, cy = img.width // 2, img.height // 2
    return img.getpixel((cx, cy))


@time_trigger("cron(*/5 * * * *)")
@time_trigger("startup")
def update_rain_radar():
    try:
        # 1. Ottieni l'ultimo frame radar disponibile (in thread separato)
        meta = task.executor(_fetch_meta)

        host = meta["host"]
        last_frame = meta["radar"]["past"][-1]  # frame più recente
        path = last_frame["path"]
        frame_timestamp = last_frame["time"]

        # 2. Costruisci l'URL del tile centrato sulle coordinate di casa
        tile_url = (
            f"{host}{path}/{SIZE}/{ZOOM}/{LAT}/{LON}/"
            f"{COLOR_SCHEME}/{SMOOTH}_{SNOW}.png"
        )

        # 3. Scarica l'immagine e leggi il pixel centrale (in thread separato)
        r, g, b, a = task.executor(_fetch_tile, tile_url)

        # 4. Classifica intensità
        label, level = classifica_intensita(r, g, b, a)

        # 5. Pubblica il sensore in Home Assistant
        state.set(
            ENTITY_ID,
            label,
            {
                "livello": level,
                "friendly_name": "Rain Radar Now",
                "icon": "mdi:radar",
                "unit_of_measurement": None,
                "orario_frame_radar": frame_timestamp,
                "pixel_rgba": f"{r},{g},{b},{a}",
                "attribution": "Weather data by RainViewer (rainviewer.com)",
            }
        )

        log.info(
            f"[rainviewer_rain_radar] Updated: {label} "
            f"(level {level}, RGBA {r},{g},{b},{a})"
        )

    except Exception as e:
        log.error(f"[rainviewer_rain_radar] Update error: {e}")
        state.set(
            ENTITY_ID,
            "unavailable",
            {
                "friendly_name": "Rain Radar Now",
                "icon": "mdi:radar-off",
                "errore": str(e),
            }
        )
