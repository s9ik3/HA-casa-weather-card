class CasaWeatherCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Devi specificare 'entity' (weather.xxx)");
    }
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._config) return;
    this._update();
  }

  getCardSize() {
    return 3;
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <ha-card>
        <style>
          ha-card {
            padding: 14px 18px;
            border-radius: 16px;
            overflow: hidden;
            backdrop-filter: blur(10px);
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.12);
            box-shadow: 0 6px 18px rgba(0,0,0,0.16);
          }
          .cwc-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .cwc-weather-block-wrap {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .cwc-weather-block {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .cwc-clock {
            font-size: 36px;
            font-weight: 300;
            line-height: 1;
            letter-spacing: -1px;
          }
          .cwc-date {
            font-size: 12px;
            opacity: 0.65;
            text-transform: capitalize;
            margin-top: 4px;
          }
          .cwc-icon-circle {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .cwc-icon-circle ha-icon {
            --mdc-icon-size: 34px;
            color: #e8951f;
            display: block;
          }
          .cwc-icon-circle.cwc-bg-cloudy ha-icon {
            color: #7c8798;
          }
          .cwc-icon-circle.cwc-bg-rainy ha-icon {
            color: #2f7ab8;
          }
          .cwc-icon-circle.cwc-bg-storm ha-icon {
            color: #3f4451;
          }
          .cwc-icon-circle.cwc-bg-snow ha-icon {
            color: #a9c4e0;
          }
          .cwc-icon-circle.cwc-bg-night ha-icon {
            color: #6b76a3;
          }
          .cwc-icon-circle.cwc-bg-fog ha-icon {
            color: #8b909c;
          }
          .cwc-icon-circle ha-icon.cwc-spin {
            animation: cwc-icon-spin 6s linear infinite;
          }
          .cwc-icon-circle ha-icon.cwc-pulse {
            animation: cwc-icon-pulse 2.2s ease-in-out infinite;
          }
          .cwc-icon-circle ha-icon.cwc-sway {
            animation: cwc-icon-sway 2.5s ease-in-out infinite;
          }
          @keyframes cwc-icon-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes cwc-icon-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.12); opacity: 0.85; }
          }
          @keyframes cwc-icon-sway {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          .cwc-temp-block {
            text-align: right;
          }
          .cwc-temp {
            font-size: 22px;
            font-weight: 800;
            line-height: 1;
          }
          .cwc-condition {
            font-size: 11px;
            opacity: 0.65;
            text-transform: capitalize;
            margin-top: 2px;
          }
          .cwc-avg-row {
            font-size: 10px;
            opacity: 0.7;
            text-align: right;
            margin-top: 6px;
          }
          .cwc-condensa-row {
            flex-direction: column;
            align-items: flex-end;
            gap: 4px;
            margin-top: 8px;
            width: 100%;
          }
          .cwc-mold-summary {
            display: flex;
            justify-content: flex-end;
            width: 100%;
            margin-top: 4px;
          }
          .cwc-mold-pill {
            font-size: 10px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 0;
            white-space: nowrap;
          }
          .cwc-dew-block {
            width: 100%;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.08);
          }
          .cwc-dew-title {
            font-size: 10px;
            opacity: 0.6;
            text-align: right;
            margin-bottom: 5px;
          }
          .cwc-dew-summary {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            gap: 5px;
            width: 100%;
          }
          .cwc-dew-chip-item {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 8px;
            white-space: nowrap;
          }
          .cwc-dew-chip-item ha-icon {
            --mdc-icon-size: 12px;
          }
          .cwc-sun-row {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid rgba(255,255,255,0.1);
          }
          .cwc-sun-row .cwc-metric {
            font-size: 11px;
          }
          .cwc-sun-row ha-icon {
            --mdc-icon-size: 15px;
            opacity: 0.9;
          }
          .cwc-icon-sunrise {
            color: #ff9800;
          }
          .cwc-icon-sunset {
            color: #ab47bc;
          }
          .cwc-icon-humidity {
            color: #42a5f5;
          }
          .cwc-feels-label {
            opacity: 0.6;
            margin-right: 3px;
          }
          .cwc-feels-value {
            font-weight: 800;
          }
          .cwc-dew-row {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            opacity: 0.9;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.08);
          }
          .cwc-dew-row ha-icon {
            color: #42a5f5;
          }
          .cwc-dew-value {
            font-weight: 800;
            color: #6ab5f5;
          }
          .cwc-temp {
            font-size: 15px;
            font-weight: 500;
            text-align: right;
          }
          .cwc-condition {
            font-size: 12px;
            opacity: 0.65;
            text-align: right;
            text-transform: capitalize;
          }
          .cwc-bottom {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid rgba(255,255,255,0.1);
          }
          .cwc-rooms-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
          }
          .cwc-room-chip {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            font-size: 10px;
            padding: 6px 4px;
            border-radius: 10px;
            background: rgba(255,255,255,0.05);
            text-align: center;
            min-height: 40px;
          }
          .cwc-room-name-row {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .cwc-room-temp-row {
            display: flex;
            align-items: baseline;
            gap: 4px;
          }
          .cwc-room-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .cwc-room-temp {
            font-weight: 700;
          }
          .cwc-room-hum {
            opacity: 0.55;
            font-size: 9px;
          }
          .cwc-metric {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            opacity: 0.85;
          }
          .cwc-metric ha-icon {
            --mdc-icon-size: 18px;
            opacity: 0.7;
          }
          .cwc-rain-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            padding: 3px 10px;
            border-radius: 12px;
          }
          .cwc-rain-assente {
            background: rgba(255,255,255,0.08);
            opacity: 0.8;
          }
          .cwc-rain-leggera {
            background: rgba(66,165,245,0.18);
            color: #42a5f5;
          }
          .cwc-rain-moderata {
            background: rgba(0,184,184,0.2);
            color: #00b8b8;
          }
          .cwc-rain-forte {
            background: rgba(229,57,53,0.2);
            color: #e53935;
          }
        </style>
        <div class="cwc-top">
          <div>
            <div class="cwc-clock" id="cwc-clock">--:--</div>
            <div class="cwc-date" id="cwc-date">-</div>
          </div>
          <div class="cwc-weather-block-wrap">
            <div class="cwc-weather-block">
              <div class="cwc-icon-circle" id="cwc-icon-circle">
                <ha-icon id="cwc-icon-symbol" icon="mdi:weather-partly-cloudy"></ha-icon>
              </div>
              <div class="cwc-temp-block">
                <div class="cwc-temp" id="cwc-temp">--°</div>
                <div class="cwc-condition" id="cwc-condition">-</div>
              </div>
            </div>
            <div class="cwc-avg-row" id="cwc-avg">Avg -- • ↑ -- • ↓ --</div>
            <div class="cwc-mold-summary" id="cwc-mold-summary" style="display:none;"></div>
          </div>
        </div>
        <div class="cwc-sun-row">
          <div class="cwc-metric">
            <ha-icon class="cwc-icon-sunrise" icon="mdi:weather-sunset-up"></ha-icon>
            <span id="cwc-sunrise">--:--</span>
          </div>
          <div class="cwc-metric">
            <ha-icon class="cwc-icon-sunset" icon="mdi:weather-sunset-down"></ha-icon>
            <span id="cwc-sunset">--:--</span>
          </div>
          <div class="cwc-metric">
            <ha-icon class="cwc-icon-humidity" icon="mdi:water-percent"></ha-icon>
            <span id="cwc-humidity">--%</span>
          </div>
          <div class="cwc-metric">
            <span class="cwc-feels-label">Percepita</span>
            <span class="cwc-feels-value" id="cwc-feels">--°</span>
          </div>
        </div>
        <div class="cwc-bottom">
          <div class="cwc-rooms-row" id="cwc-rooms-row"></div>
          <div class="cwc-rain-badge cwc-rain-assente" id="cwc-rain-badge">
            <ha-icon icon="mdi:radar" style="--mdc-icon-size:16px;"></ha-icon>
            <span id="cwc-rain-text">-</span>
          </div>
        </div>
        <div class="cwc-dew-row" id="cwc-dew-row" style="display:none;">
          <ha-icon icon="mdi:water-thermometer-outline" style="--mdc-icon-size:17px;"></ha-icon>
          <span>Punto di rugiada esterno <span class="cwc-dew-value" id="cwc-dew">--°</span></span>
        </div>
        <div class="cwc-condensa-row" id="cwc-condensa-row" style="display:none;"></div>
      </ha-card>
    `;
    this._clockEl = this.shadowRoot.querySelector("#cwc-clock");
    this._dateEl = this.shadowRoot.querySelector("#cwc-date");
    this._iconCircle = this.shadowRoot.querySelector("#cwc-icon-circle");
    this._iconSymbol = this.shadowRoot.querySelector("#cwc-icon-symbol");
    this._tempEl = this.shadowRoot.querySelector("#cwc-temp");
    this._condEl = this.shadowRoot.querySelector("#cwc-condition");
    this._humEl = this.shadowRoot.querySelector("#cwc-humidity");
    this._sunriseEl = this.shadowRoot.querySelector("#cwc-sunrise");
    this._sunsetEl = this.shadowRoot.querySelector("#cwc-sunset");
    this._feelsEl = this.shadowRoot.querySelector("#cwc-feels");
    this._dewRow = this.shadowRoot.querySelector("#cwc-dew-row");
    this._dewEl = this.shadowRoot.querySelector("#cwc-dew");
    this._avgEl = this.shadowRoot.querySelector("#cwc-avg");
    this._moldSummaryEl = this.shadowRoot.querySelector("#cwc-mold-summary");
    this._roomsRow = this.shadowRoot.querySelector("#cwc-rooms-row");
    this._condensaRow = this.shadowRoot.querySelector("#cwc-condensa-row");
    this._rainBadge = this.shadowRoot.querySelector("#cwc-rain-badge");
    this._rainText = this.shadowRoot.querySelector("#cwc-rain-text");
    this._tickInterval = setInterval(() => this._tick(), 1000);
    this._tick();
  }

  _tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    if (this._clockEl) this._clockEl.textContent = `${hh}:${mm}`;
    if (this._dateEl) {
      const formatter = new Intl.DateTimeFormat("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      this._dateEl.textContent = formatter.format(now);
    }
  }

  _weatherIconData(condition) {
    // Icone MDI native HA (già usate/testate nel resto del dashboard) + classe di animazione CSS
    const map = {
      sunny: { icon: "mdi:weather-sunny", bgClass: "", animClass: "cwc-spin" },
      "clear-night": { icon: "mdi:weather-night", bgClass: "cwc-bg-night", animClass: "cwc-pulse" },
      cloudy: { icon: "mdi:weather-cloudy", bgClass: "cwc-bg-cloudy", animClass: "cwc-sway" },
      partlycloudy: { icon: "mdi:weather-partly-cloudy", bgClass: "", animClass: "cwc-sway" },
      rainy: { icon: "mdi:weather-rainy", bgClass: "cwc-bg-rainy", animClass: "cwc-pulse" },
      pouring: { icon: "mdi:weather-pouring", bgClass: "cwc-bg-rainy", animClass: "cwc-pulse" },
      snowy: { icon: "mdi:weather-snowy", bgClass: "cwc-bg-snow", animClass: "cwc-sway" },
      "snowy-rainy": { icon: "mdi:weather-snowy-rainy", bgClass: "cwc-bg-snow", animClass: "cwc-sway" },
      hail: { icon: "mdi:weather-hail", bgClass: "cwc-bg-snow", animClass: "cwc-sway" },
      lightning: { icon: "mdi:weather-lightning", bgClass: "cwc-bg-storm", animClass: "cwc-pulse" },
      "lightning-rainy": { icon: "mdi:weather-lightning-rainy", bgClass: "cwc-bg-storm", animClass: "cwc-pulse" },
      fog: { icon: "mdi:weather-fog", bgClass: "cwc-bg-fog", animClass: "cwc-sway" },
      windy: { icon: "mdi:weather-windy", bgClass: "cwc-bg-fog", animClass: "cwc-sway" },
      "windy-variant": { icon: "mdi:weather-windy-variant", bgClass: "cwc-bg-fog", animClass: "cwc-sway" },
      exceptional: { icon: "mdi:alert-circle-outline", bgClass: "cwc-bg-cloudy", animClass: "" },
    };
    return map[condition] || { icon: "mdi:weather-partly-cloudy", bgClass: "", animClass: "cwc-sway" };
  }

  _readNumericSensor(entity) {
    const raw = this._hass.states[entity]?.state;
    if (raw == null || raw === "unknown" || raw === "unavailable") return null;
    const v = parseFloat(String(raw).replace(",", "."));
    return isNaN(v) ? null : v;
  }

  _readTextSensor(entity) {
    const raw = this._hass.states[entity]?.state;
    return raw == null || raw === "unknown" || raw === "unavailable" ? null : raw;
  }

  _moldColor(risk) {
    if (risk === "Critico") return "#e53935";
    if (risk === "Attenzione") return "#fb8c00";
    if (risk === "OK") return "#43a047";
    return "var(--disabled-text-color, #888)";
  }

  _dewGapColor(temp, dew) {
    // Soglie: >=3° sicuro (azzurro), 1.5-3° attenzione (arancio), <1.5° critico (rosso)
    if (temp == null || dew == null) return "#6ab5f5";
    const gap = temp - dew;
    if (gap < 1.5) return "#e53935";
    if (gap < 3) return "#fb8c00";
    return "#6ab5f5";
  }

  _parseRoomValue(entity) {
    const raw = this._hass.states[entity]?.state;
    if (!raw || raw === "unknown" || raw === "unavailable") return { t: null, h: null };
    const str = String(raw).replace(/,/g, ".");
    const nums = str.match(/-?\d+(?:\.\d+)?/g);
    if (!nums) return { t: null, h: null };
    return {
      t: parseFloat(nums[0]),
      h: nums.length > 1 ? parseFloat(nums[1]) : null,
    };
  }

  _tempColor(t) {
    if (t === null || t === undefined || isNaN(t)) return "var(--disabled-text-color, #888)";
    if (t < 16) return "#42a5f5";
    if (t < 21) return "#00b8b8";
    if (t < 25) return "#43a047";
    if (t < 28) return "#fb8c00";
    return "#e53935";
  }

  _applyOrder(list, orderKey) {
    const order = (this._config && this._config[orderKey]) || [];
    if (!order.length) return list;
    const byName = new Map(list.map((l) => [l.name, l]));
    const ordered = [];
    for (const name of order) {
      if (byName.has(name)) {
        ordered.push(byName.get(name));
        byName.delete(name);
      }
    }
    for (const remaining of byName.values()) ordered.push(remaining);
    return ordered;
  }

  _conditionLabel(condition) {
    const map = {
      "clear-night": "sereno",
      cloudy: "nuvoloso",
      fog: "nebbia",
      hail: "grandine",
      lightning: "temporale",
      "lightning-rainy": "temporale e pioggia",
      partlycloudy: "parz. nuvoloso",
      pouring: "pioggia forte",
      rainy: "pioggia",
      snowy: "neve",
      "snowy-rainy": "nevischio",
      sunny: "sereno",
      windy: "ventoso",
      "windy-variant": "ventoso",
      exceptional: "eccezionale",
    };
    return map[condition] || condition || "-";
  }

  _update() {
    if (!this._hass || !this._config) return;
    const weatherState = this._hass.states[this._config.entity];
    if (weatherState) {
      const cond = weatherState.state;
      const iconData = this._weatherIconData(cond);
      this._iconSymbol.setAttribute("icon", iconData.icon);
      this._iconSymbol.className = iconData.animClass;
      this._iconCircle.className = "cwc-icon-circle " + iconData.bgClass;
      this._condEl.textContent = this._conditionLabel(cond);

      const tempSensor = this._config.temperature_sensor
        ? this._hass.states[this._config.temperature_sensor]
        : null;
      const temp = tempSensor
        ? parseFloat(tempSensor.state)
        : weatherState.attributes.temperature;
      this._tempEl.textContent =
        temp !== undefined && !isNaN(temp) ? `${Math.round(temp * 10) / 10}°` : "--°";
      this._tempEl.style.color = this._tempColor(temp);

      // Temperatura percepita: da sensore dedicato (es. sensor.esterno_temperatura_percepita)
      if (this._config.feels_like_sensor) {
        const feelsState = this._hass.states[this._config.feels_like_sensor];
        const feelsRaw = feelsState ? feelsState.state : null;
        const feels =
          feelsRaw == null || feelsRaw === "unknown" || feelsRaw === "unavailable"
            ? null
            : parseFloat(String(feelsRaw).replace(",", "."));
        this._feelsEl.textContent = feels !== null && !isNaN(feels) ? `${feels.toFixed(1)}°` : "N/A";
        this._feelsEl.style.color = this._tempColor(feels);
      }

      // Punto di rugiada esterno: da sensore dedicato (es. sensor.esterno_punto_di_rugiada)
      if (this._config.dew_point_sensor && this._dewRow) {
        const dew = this._readNumericSensor(this._config.dew_point_sensor);
        this._dewRow.style.display = dew !== null ? "flex" : "none";
        if (dew !== null) {
          this._dewEl.textContent = `${dew.toFixed(1)}°`;
          this._dewEl.style.color = this._dewGapColor(temp, dew);
        }
      }
    }

    // Alba e tramonto da sun.sun
    const sunState = this._hass.states["sun.sun"];
    if (sunState) {
      const fmtTime = (iso) => {
        if (!iso) return "--:--";
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
      };
      this._sunriseEl.textContent = fmtTime(sunState.attributes.next_rising);
      this._sunsetEl.textContent = fmtTime(sunState.attributes.next_setting);
    }

    if (this._config.humidity_sensor) {
      const humState = this._hass.states[this._config.humidity_sensor];
      if (humState) {
        const hum = parseFloat(humState.state);
        this._humEl.textContent = !isNaN(hum) ? `${Math.round(hum)}%` : "--%";
      }
    }

    if (this._config.rain_sensor) {
      const rainState = this._hass.states[this._config.rain_sensor];
      if (rainState) {
        const label = rainState.state;
        const labelMap = {
          assente: "Nessuna pioggia",
          leggera: "Pioggia leggera",
          moderata: "Pioggia moderata",
          forte: "Pioggia forte",
          unavailable: "Non disponibile",
        };
        this._rainText.textContent = labelMap[label] || label;
        this._rainBadge.className = "cwc-rain-badge cwc-rain-" + label;
      }
    }

    // Media temperature stanze + mini-termometri (stessa logica del button-card Temperature)
    if (this._config.rooms && Array.isArray(this._config.rooms)) {
      let rooms = this._config.rooms.map((r) => {
        const d = this._parseRoomValue(r.entity);
        const dew = r.dew_point_entity ? this._readNumericSensor(r.dew_point_entity) : null;
        const mold = r.mold_risk_entity ? this._readTextSensor(r.mold_risk_entity) : null;
        return { name: r.name, temp: d.t, hum: d.h, dew, mold, color: this._tempColor(d.t) };
      });
      rooms = this._applyOrder(rooms, "room_order");
      const temps = rooms.map((r) => r.temp).filter((v) => v != null);
      const avg = temps.length ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
      const max = temps.length ? Math.max(...temps) : null;
      const min = temps.length ? Math.min(...temps) : null;

      if (this._avgEl) {
        const avgText = avg !== null ? avg.toFixed(1) + "°" : "N/A";
        const maxText = max !== null ? max.toFixed(1) + "°" : "N/A";
        const minText = min !== null ? min.toFixed(1) + "°" : "N/A";
        this._avgEl.innerHTML = `Avg <b>${avgText}</b> • ↑ <b style="color:${this._tempColor(
          max
        )};">${maxText}</b> • ↓ <b style="color:${this._tempColor(min)};">${minText}</b>`;
      }

      if (this._roomsRow) {
        this._roomsRow.innerHTML = rooms
          .map(
            (r) => `
            <div class="cwc-room-chip">
              <div class="cwc-room-name-row">
                <div class="cwc-room-dot" style="background:${r.color};"></div>
                <span>${r.name}</span>
              </div>
              <div class="cwc-room-temp-row">
                <span class="cwc-room-temp" style="color:${r.color};">${
                  r.temp != null ? r.temp.toFixed(1) + "°" : "N/A"
                }</span>
                ${r.hum != null ? `<span class="cwc-room-hum">💧 ${r.hum.toFixed(0)}%</span>` : ""}
              </div>
            </div>
          `
          )
          .join("");
      }

      // Badge riepilogo rischio condensa: mostrato subito sotto Avg/Max/Min.
      if (this._moldSummaryEl) {
        const roomsWithMold = rooms.filter((r) => r.mold != null);
        const atRisk = roomsWithMold.filter((r) => r.mold !== "OK").map((r) => r.name);
        const hasRisk = atRisk.length > 0;

        if (roomsWithMold.length === 0) {
          this._moldSummaryEl.style.display = "none";
        } else {
          this._moldSummaryEl.style.display = "flex";
          this._moldSummaryEl.innerHTML = `
            <span class="cwc-mold-pill" style="background:${
              hasRisk ? "#e5393522" : "#43a04722"
            };color:${hasRisk ? "#e53935" : "#43a047"};">
              Rischio condensa: ${hasRisk ? "Sì — " + atRisk.join(", ") : "No"}
            </span>
          `;
        }
      }

      // Punti di rugiada per stanza: resta in fondo alla card.
      if (this._condensaRow) {
        const roomsWithDew = rooms.filter((r) => r.dew != null);

        if (roomsWithDew.length === 0) {
          this._condensaRow.style.display = "none";
        } else {
          this._condensaRow.style.display = "flex";
          const dewChips = roomsWithDew
            .map((r) => {
              const gapColor = this._dewGapColor(r.temp, r.dew);
              return `<span class="cwc-dew-chip-item" style="background:${gapColor}22;color:${gapColor};"><ha-icon icon="mdi:water-thermometer-outline" style="--mdc-icon-size:12px;"></ha-icon>${r.name} <b>${r.dew.toFixed(
                1
              )}°</b></span>`;
            })
            .join("");
          this._condensaRow.innerHTML = `
            <div class="cwc-dew-block">
              <div class="cwc-dew-title">Punto di rugiada</div>
              <div class="cwc-dew-summary">${dewChips}</div>
            </div>
          `;
        }
      }
    }
  }

  static getStubConfig() {
    return {
      entity: "weather.home",
      temperature_sensor: "",
      humidity_sensor: "",
      feels_like_sensor: "",
      dew_point_sensor: "",
      rain_sensor: "",
      rooms: [],
    };
  }

  static getConfigElement() {
    return document.createElement("casa-weather-card-editor");
  }

  disconnectedCallback() {
    if (this._tickInterval) clearInterval(this._tickInterval);
  }
}

customElements.define("casa-weather-card", CasaWeatherCard);

class CasaWeatherCardEditor extends HTMLElement {
  setConfig(config) {
    const incoming = { rooms: [], room_order: [], ...config };
    // Se il config in arrivo è lo stesso che abbiamo appena emesso noi
    // (round-trip da config-changed), non ri-renderizzare: evita di
    // distruggere gli input e perdere il focus ad ogni carattere digitato.
    if (this._suppressNextRender) {
      this._suppressNextRender = false;
      this._config = incoming;
      return;
    }
    this._config = incoming;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Passa hass a tutti gli entity-picker già renderizzati
    this.querySelectorAll("ha-entity-picker").forEach((el) => {
      el.hass = hass;
    });
  }

  _fireChanged() {
    this._suppressNextRender = true;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _entityRow(label, key, filterDomain) {
    const row = document.createElement("div");
    row.style.marginBottom = "12px";
    row.style.width = "100%";

    const picker = document.createElement("ha-entity-picker");
    picker.label = label;
    picker.value = this._config[key] || "";
    picker.style.width = "100%";
    picker.style.display = "block";
    if (filterDomain) picker.includeDomains = [filterDomain];
    if (this._hass) picker.hass = this._hass;
    picker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._config = { ...this._config, [key]: ev.detail.value };
      this._fireChanged();
    });

    row.appendChild(picker);
    return row;
  }

  _nativeInput(value, placeholder) {
    const input = document.createElement("input");
    input.type = "text";
    if (placeholder) input.placeholder = placeholder;
    input.value = value || "";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";
    input.style.padding = "10px 8px";
    input.style.borderRadius = "4px";
    input.style.border = "1px solid var(--divider-color, #444)";
    input.style.background = "var(--card-background-color, transparent)";
    input.style.color = "var(--primary-text-color, inherit)";
    input.style.font = "inherit";
    return input;
  }

  _nativeButton(text) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.style.padding = "8px 14px";
    btn.style.borderRadius = "6px";
    btn.style.border = "1px solid var(--divider-color, #444)";
    btn.style.background = "var(--card-background-color, transparent)";
    btn.style.color = "var(--primary-text-color, inherit)";
    btn.style.font = "inherit";
    btn.style.cursor = "pointer";
    return btn;
  }

  // Salva l'ordine finale (array di nomi) letto dal DOM dopo un drag,
  // tramite config-changed. Chiave parametrica per riutilizzo futuro
  // su altre liste riordinabili.
  _saveOrder(orderKey, names) {
    this._config = { ...this._config, [orderKey]: names };
    this._fireChanged();
  }

  _roomsSection() {
    // Se stiamo modificando una stanza specifica, mostra SOLO la
    // schermata dedicata (indice come chiave: il nome può essere
    // ambiguo/vuoto mentre l'utente sta ancora digitando).
    if (this._renameTarget && this._renameTarget.type === "room") {
      return this._roomEditScreen(this._renameTarget.index);
    }

    const wrap = document.createElement("div");
    wrap.style.marginTop = "16px";

    const title = document.createElement("div");
    title.textContent = "Stanze (nome + sensore temperatura)";
    title.style.fontWeight = "600";
    title.style.marginBottom = "8px";
    wrap.appendChild(title);

    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.flexDirection = "column";
    list.style.gap = "6px";

    let dragFromIndex = null;

    this._config.rooms.forEach((room, index) => {
      const row = document.createElement("div");
      row.dataset.index = String(index);
      row.style.display = "grid";
      row.style.gridTemplateColumns = "28px 1fr 36px 36px";
      row.style.gap = "8px";
      row.style.alignItems = "center";
      row.style.border = "1px solid var(--divider-color, rgba(127,127,127,0.2))";
      row.style.borderRadius = "8px";
      row.style.padding = "8px";

      // Maniglia drag: SOLO questa è draggable, non l'intera riga,
      // per evitare trascinamenti accidentali toccando il resto della riga.
      const handle = document.createElement("span");
      handle.textContent = "☰";
      handle.title = "Trascina per riordinare";
      handle.draggable = true;
      handle.style.cursor = "grab";
      handle.style.textAlign = "center";
      handle.style.opacity = "0.7";
      handle.style.userSelect = "none";

      handle.addEventListener("dragstart", (ev) => {
        dragFromIndex = index;
        row.style.opacity = "0.4";
        ev.dataTransfer.effectAllowed = "move";
      });
      handle.addEventListener("dragend", () => {
        row.style.opacity = "1";
        dragFromIndex = null;
        // Legge l'ordine finale dal DOM e lo salva come lista di nomi.
        const names = Array.from(list.children).map(
          (child) => this._config.rooms[Number(child.dataset.index)].name
        );
        // Riordina anche l'array reale rooms secondo il DOM, così gli
        // indici restano coerenti con quanto visualizzato.
        const newRooms = Array.from(list.children).map(
          (child) => this._config.rooms[Number(child.dataset.index)]
        );
        this._config = { ...this._config, rooms: newRooms };
        this._saveOrder("room_order", names);
        this._render();
      });

      row.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        if (dragFromIndex === null) return;
        const target = row;
        const targetIndex = Number(target.dataset.index);
        if (targetIndex === dragFromIndex) return;
        const children = Array.from(list.children);
        const fromEl = children[dragFromIndex];
        if (!fromEl) return;
        if (targetIndex < dragFromIndex) {
          list.insertBefore(fromEl, target);
        } else {
          list.insertBefore(fromEl, target.nextSibling);
        }
        dragFromIndex = targetIndex;
      });

      const nameSpan = document.createElement("span");
      nameSpan.textContent = room.name || "(senza nome)";
      nameSpan.style.overflow = "hidden";
      nameSpan.style.textOverflow = "ellipsis";
      nameSpan.style.whiteSpace = "nowrap";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✎";
      editBtn.title = "Modifica stanza";
      editBtn.style.border = "none";
      editBtn.style.background = "transparent";
      editBtn.style.color = "var(--primary-text-color, inherit)";
      editBtn.style.cursor = "pointer";
      editBtn.style.fontSize = "16px";
      editBtn.addEventListener("click", () => {
        this._renameTarget = { type: "room", index };
        this._render();
      });

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.title = "Rimuovi stanza";
      removeBtn.style.border = "none";
      removeBtn.style.background = "transparent";
      removeBtn.style.color = "var(--primary-text-color, inherit)";
      removeBtn.style.cursor = "pointer";
      removeBtn.style.fontSize = "16px";
      removeBtn.addEventListener("click", () => {
        const rooms = this._config.rooms.filter((_, i) => i !== index);
        this._config = { ...this._config, rooms };
        this._fireChanged();
        this._render();
      });

      row.appendChild(handle);
      row.appendChild(nameSpan);
      row.appendChild(editBtn);
      row.appendChild(removeBtn);
      list.appendChild(row);
    });

    wrap.appendChild(list);

    const addBtn = this._nativeButton("+ Aggiungi stanza");
    addBtn.style.marginTop = "10px";
    addBtn.addEventListener("click", () => {
      const rooms = [...this._config.rooms, { name: "", entity: "" }];
      this._config = { ...this._config, rooms };
      this._fireChanged();
      this._render();
      // Apre subito la schermata di modifica per la nuova stanza.
      this._renameTarget = { type: "room", index: rooms.length - 1 };
      this._render();
    });
    wrap.appendChild(addBtn);

    return wrap;
  }

  // Seconda schermata: modifica di UNA singola stanza (identificata per
  // indice, non per nome, per evitare ambiguità con nomi vuoti/duplicati).
  _roomEditScreen(index) {
    const room = this._config.rooms[index];
    const screen = document.createElement("div");
    screen.style.marginTop = "16px";

    if (!room) {
      // La stanza non esiste più (es. rimossa altrove): torna alla lista.
      this._renameTarget = null;
      return this._roomsSection();
    }

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.gap = "8px";
    header.style.marginBottom = "14px";

    const backBtn = this._nativeButton("← Indietro");
    backBtn.addEventListener("click", () => {
      this._renameTarget = null;
      this._render();
    });

    const title = document.createElement("div");
    title.textContent = `Modifica stanza`;
    title.style.fontWeight = "600";

    header.appendChild(backBtn);
    header.appendChild(title);
    screen.appendChild(header);

    const setRoomField = (key, value) => {
      const rooms = [...this._config.rooms];
      rooms[index] = { ...rooms[index], [key]: value };
      this._config = { ...this._config, rooms };
    };

    const nameLabel = document.createElement("div");
    nameLabel.textContent = "Nome";
    nameLabel.style.fontSize = "12px";
    nameLabel.style.opacity = "0.7";
    nameLabel.style.margin = "10px 0 4px";
    screen.appendChild(nameLabel);

    const nameInput = this._nativeInput(room.name, "es. Cucina");
    nameInput.addEventListener("input", (ev) => {
      setRoomField("name", ev.target.value);
      this._fireChanged();
    });
    screen.appendChild(nameInput);

    const entityWrap = document.createElement("div");
    entityWrap.style.marginTop = "12px";
    const entityPicker = document.createElement("ha-entity-picker");
    entityPicker.label = "Sensore temperatura";
    entityPicker.value = room.entity || "";
    entityPicker.includeDomains = ["sensor"];
    if (this._hass) entityPicker.hass = this._hass;
    entityPicker.style.width = "100%";
    entityPicker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      setRoomField("entity", ev.detail.value);
      this._fireChanged();
    });
    entityWrap.appendChild(entityPicker);
    screen.appendChild(entityWrap);

    const dewWrap = document.createElement("div");
    dewWrap.style.marginTop = "12px";
    const dewPicker = document.createElement("ha-entity-picker");
    dewPicker.label = "Sensore punto di rugiada (opz.)";
    dewPicker.value = room.dew_point_entity || "";
    dewPicker.includeDomains = ["sensor"];
    if (this._hass) dewPicker.hass = this._hass;
    dewPicker.style.width = "100%";
    dewPicker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      setRoomField("dew_point_entity", ev.detail.value);
      this._fireChanged();
    });
    dewWrap.appendChild(dewPicker);
    screen.appendChild(dewWrap);

    const moldWrap = document.createElement("div");
    moldWrap.style.marginTop = "12px";
    const moldPicker = document.createElement("ha-entity-picker");
    moldPicker.label = "Sensore rischio condensa (opz.)";
    moldPicker.value = room.mold_risk_entity || "";
    moldPicker.includeDomains = ["sensor"];
    if (this._hass) moldPicker.hass = this._hass;
    moldPicker.style.width = "100%";
    moldPicker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      setRoomField("mold_risk_entity", ev.detail.value);
      this._fireChanged();
    });
    moldWrap.appendChild(moldPicker);
    screen.appendChild(moldWrap);

    const saveBtn = this._nativeButton("Salva");
    saveBtn.style.marginTop = "16px";
    saveBtn.addEventListener("click", () => {
      this._renameTarget = null;
      this._render();
    });
    screen.appendChild(saveBtn);

    return screen;
  }

  _render() {
    this.innerHTML = "";
    this.style.display = "block";
    this.style.width = "100%";

    const container = document.createElement("div");
    container.style.padding = "8px";
    container.style.width = "100%";
    container.style.boxSizing = "border-box";

    // Se è aperta la schermata di modifica di una stanza, mostra solo
    // quella: niente altri campi dell'editor visibili contemporaneamente.
    if (this._renameTarget && this._renameTarget.type === "room") {
      container.appendChild(this._roomsSection());
      this.appendChild(container);
      if (this._hass) {
        this.querySelectorAll("ha-entity-picker").forEach((el) => {
          el.hass = this._hass;
        });
      }
      return;
    }

    container.appendChild(this._entityRow("Entità meteo (obbligatoria)", "entity", "weather"));
    container.appendChild(this._entityRow("Sensore temperatura esterna", "temperature_sensor"));
    container.appendChild(this._entityRow("Sensore umidità esterna", "humidity_sensor"));
    container.appendChild(this._entityRow("Sensore temperatura percepita", "feels_like_sensor"));
    container.appendChild(this._entityRow("Sensore punto di rugiada esterno", "dew_point_sensor"));
    container.appendChild(this._entityRow("Sensore pioggia radar", "rain_sensor"));
    container.appendChild(this._roomsSection());

    this.appendChild(container);

    if (this._hass) {
      this.querySelectorAll("ha-entity-picker").forEach((el) => {
        el.hass = this._hass;
      });
    }
  }
}

customElements.define("casa-weather-card-editor", CasaWeatherCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "casa-weather-card",
  name: "Casa Weather Card",
  description:
    "Orologio + meteo animato + alba/tramonto + umidità + temperatura percepita + mini-termometri stanza + pioggia radar, tutto in un'unica card compatta.",
  preview: false,
});
