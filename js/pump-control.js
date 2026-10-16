/**
 * SMART GARDEN IoT - PUMP CONTROL MANAGER (pump-control.js)
 * Mengatur tombol ON/OFF, Mode Otomatis/Manual, Histeresis,
 * dan proteksi keselamatan pompa sesuai Bagian 2, 5, dan 7 ujicoba.md
 */

class PumpControlManager {
  constructor(mqttClient, config) {
    this.mqtt = mqttClient;
    this.config = config || window.APP_CONFIG;

    this.state = {
      pump: "OFF",
      mode: "AUTO",
      reason: "INIT",
      lastUpdated: new Date()
    };

    this.pumpRunSeconds = 0;
    this.runTimer = null;
    this.onStateChangeCallbacks = [];

    this.initDOM();
  }

  onStateChange(callback) {
    this.onStateChangeCallbacks.push(callback);
  }

  initDOM() {
    // Tombol Mode Otomatis / Manual
    const btnAuto = document.getElementById("btn-mode-auto");
    const btnManual = document.getElementById("btn-mode-manual");

    if (btnAuto) {
      btnAuto.addEventListener("click", () => this.setMode("AUTO"));
    }
    if (btnManual) {
      btnManual.addEventListener("click", () => this.setMode("MANUAL"));
    }

    // Tombol Manual Pompa ON / OFF
    const btnPumpOn = document.getElementById("btn-pump-on");
    const btnPumpOff = document.getElementById("btn-pump-off");

    if (btnPumpOn) {
      btnPumpOn.addEventListener("click", () => this.sendManualCommand("ON"));
    }
    if (btnPumpOff) {
      btnPumpOff.addEventListener("click", () => this.sendManualCommand("OFF"));
    }
  }

  /**
   * Mengganti mode antara AUTO dan MANUAL
   */
  setMode(mode) {
    if (this.state.mode === mode) return;

    this.state.mode = mode;
    console.log(`Mengubah mode pompa ke: ${mode}`);

    // Publikasikan perintah perubahan mode ke MQTT
    const payload = {
      command: this.state.pump,
      mode: mode
    };
    this.mqtt.publish(this.config.mqtt.topics.pumpCommand, payload);

    this.renderUI();
  }

  /**
   * Mengirim perintah kontrol manual ON / OFF
   */
  sendManualCommand(command) {
    // Jika masih mode AUTO, beri informasi atau otomatis alihkan ke MANUAL
    if (this.state.mode === "AUTO") {
      this.state.mode = "MANUAL";
    }

    console.log(`Mengirim perintah manual pompa: ${command}`);

    const payload = {
      command: command,
      mode: "MANUAL"
    };

    this.mqtt.publish(this.config.mqtt.topics.pumpCommand, payload);
    this.renderUI();
  }

  /**
   * Menerima konfirmasi status aktual dari perangkat ESP32
   * melalui topik 'smartgarden/pump/status'
   */
  receiveConfirmedStatus(payload) {
    if (!payload || typeof payload !== "object") return;

    this.state.pump = payload.pump || this.state.pump;
    this.state.mode = payload.mode || this.state.mode;
    this.state.reason = payload.reason || this.state.reason;
    this.state.lastUpdated = new Date();

    // Kelola timer keselamatan jika pompa ON
    if (this.state.pump === "ON") {
      if (!this.runTimer) {
        this.pumpRunSeconds = 0;
        this.runTimer = setInterval(() => {
          this.pumpRunSeconds++;
          this.updateSafetyTimerUI();

          // Batas proteksi keselamatan di sisi web
          if (this.pumpRunSeconds >= this.config.safety.maxPumpDurationSeconds) {
            console.warn("Proteksi keselamatan: Batas waktu operasi pompa terlampaui.");
          }
        }, 1000);
      }
    } else {
      if (this.runTimer) {
        clearInterval(this.runTimer);
        this.runTimer = null;
        this.pumpRunSeconds = 0;
      }
    }

    this.renderUI();
    this.onStateChangeCallbacks.forEach(cb => cb(this.state));
  }

  /**
   * Menerjemahkan kode alasan status pompa ke Bahasa Indonesia yang ramah pengguna
   */
  getReadableReason(reason) {
    switch (reason) {
      case "SOIL_BELOW_30":
        return "Pompa menyala otomatis karena kelembapan tanah di bawah 30%.";
      case "SOIL_REACHED_TARGET":
        return "Pompa mati otomatis karena kelembapan tanah telah mencapai >= 60%.";
      case "HYSTERESIS_STABLE":
        return "Mempertahankan status sebelumnya dalam batas aman histeresis (30% - 60%).";
      case "MANUAL_COMMAND_ON":
        return "Pompa dinyalakan secara manual melalui website.";
      case "MANUAL_COMMAND_OFF":
        return "Pompa dimatikan secara manual melalui website.";
      case "SCHEDULE_MORNING":
        return "Penyiraman otomatis pagi pukul 07.00 sedang berjalan.";
      case "SCHEDULE_EVENING":
        return "Penyiraman otomatis sore pukul 17.00 sedang berjalan.";
      case "SAFETY_TIMEOUT_EXCEEDED":
        return "Pompa dimatikan otomatis: Batas waktu operasi maksimum terlampaui (Safety Cutoff).";
      default:
        return this.state.pump === "ON" ? "Pompa aktif." : "Pompa standby.";
    }
  }

  /**
   * Perbarui UI kontrol pompa sesuai status aktual
   */
  renderUI() {
    const banner = document.getElementById("pump-status-banner");
    const statusText = document.getElementById("pump-status-text");
    const reasonText = document.getElementById("pump-reason-text");
    const avatar = document.getElementById("pump-avatar-icon");

    const btnAuto = document.getElementById("btn-mode-auto");
    const btnManual = document.getElementById("btn-mode-manual");
    const btnPumpOn = document.getElementById("btn-pump-on");
    const btnPumpOff = document.getElementById("btn-pump-off");

    // Mode Toggle Buttons
    if (btnAuto && btnManual) {
      if (this.state.mode === "AUTO") {
        btnAuto.classList.add("active");
        btnManual.classList.remove("active");
      } else {
        btnManual.classList.add("active");
        btnAuto.classList.remove("active");
      }
    }

    // Status Banner & Avatar
    const isPumpOn = this.state.pump === "ON";
    if (banner) {
      if (isPumpOn) {
        banner.className = "pump-status-banner pump-active";
      } else {
        banner.className = "pump-status-banner pump-inactive";
      }
    }

    if (statusText) {
      statusText.textContent = isPumpOn ? "Pompa ON" : "Pompa OFF";
    }

    if (reasonText) {
      reasonText.textContent = this.getReadableReason(this.state.reason);
    }

    // Tombol Manual: Enabled hanya jika mode MANUAL (atau jika AUTO, klik akan mengonfirmasi alih mode)
    if (btnPumpOn && btnPumpOff) {
      if (this.state.mode === "MANUAL") {
        btnPumpOn.disabled = isPumpOn;
        btnPumpOff.disabled = !isPumpOn;
        btnPumpOn.style.opacity = isPumpOn ? "0.5" : "1";
        btnPumpOff.style.opacity = !isPumpOn ? "0.5" : "1";
      } else {
        // Pada mode AUTO, tombol tetap bisa diklik untuk mengambil alih ke MANUAL
        btnPumpOn.disabled = false;
        btnPumpOff.disabled = false;
        btnPumpOn.style.opacity = "1";
        btnPumpOff.style.opacity = "1";
      }
    }
  }

  updateSafetyTimerUI() {
    const timerEl = document.getElementById("pump-safety-timer");
    if (timerEl) {
      const maxSec = this.config.safety.maxPumpDurationSeconds || 180;
      const remaining = Math.max(0, maxSec - this.pumpRunSeconds);
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      timerEl.textContent = `Batas pengaman: ${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PumpControlManager;
} else if (typeof window !== "undefined") {
  window.PumpControlManager = PumpControlManager;
}
