/**
 * SMART GARDEN IoT - SENSOR DATA MANAGER (sensor.js)
 * Memproses dan menampilkan data sensor secara realtime,
 * mengevaluasi ambang batas, teks aksesibilitas status tanah,
 * serta waktu pembaruan terakhir.
 * Sesuai Bagian 2, 3, dan 7 ujicoba.md
 */

class SensorManager {
  constructor(config) {
    this.config = config || window.APP_CONFIG;
    
    // State sensor saat ini
    this.currentData = {
      soil_moisture: 24,
      temperature: 29.4,
      air_humidity: 68,
      timestamp: new Date().toISOString()
    };

    this.lastReceivedAt = Date.now();
    this.history = [];
    this.maxHistoryLength = 100;
    this.timeoutTimer = null;
    this.isSensorStale = false;

    // Callbacks
    this.onUpdateCallbacks = [];
    this.onAlertCallbacks = [];

    // Mulai pemantauan batas waktu pembaruan
    this.startWatchdog();
  }

  onUpdate(callback) {
    this.onUpdateCallbacks.push(callback);
  }

  onAlert(callback) {
    this.onAlertCallbacks.push(callback);
  }

  /**
   * Menerima dan memproses paket data sensor baru dari MQTT
   */
  processReading(payload) {
    if (!payload || typeof payload !== "object") return;

    const soil = Number(payload.soil_moisture);
    const temp = Number(payload.temperature);
    const hum = Number(payload.air_humidity);
    const time = payload.timestamp || new Date().toISOString();

    if (!isNaN(soil)) this.currentData.soil_moisture = soil;
    if (!isNaN(temp)) this.currentData.temperature = temp;
    if (!isNaN(hum)) this.currentData.air_humidity = hum;
    this.currentData.timestamp = time;

    this.lastReceivedAt = Date.now();
    this.isSensorStale = false;

    // Catat ke riwayat
    this.history.push({
      soil_moisture: this.currentData.soil_moisture,
      temperature: this.currentData.temperature,
      air_humidity: this.currentData.air_humidity,
      timestamp: new Date()
    });

    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    // Perbarui DOM Antarmuka
    this.renderUI();

    // Beritahukan listener
    this.onUpdateCallbacks.forEach(cb => cb(this.currentData));
  }

  /**
   * Menentukan status tanah berdasarkan aturan ambang batas ujicoba.md
   * < 30% : Tanah Kering (Memerlukan air)
   * 30% - 59.9% : Tanah Lembap (Zona aman histeresis)
   * >= 60% : Tanah Basah (Target kelembapan tercapai)
   */
  getSoilStatus(moisture) {
    if (moisture < this.config.thresholds.soilMoistureDry) {
      return {
        label: "Tanah Kering",
        cssClass: "dry",
        category: "danger",
        description: "Kelembapan di bawah 30%, pompa air otomatis aktif."
      };
    } else if (moisture >= this.config.thresholds.soilMoistureTarget) {
      return {
        label: "Tanah Basah",
        cssClass: "wet",
        category: "info",
        description: "Kelembapan mencapai atau melebihi 60%, pompa berhenti."
      };
    } else {
      return {
        label: "Tanah Lembap",
        cssClass: "optimal",
        category: "success",
        description: "Kondisi stabil dalam rentang aman histeresis."
      };
    }
  }

  getTempStatus(temp) {
    if (temp >= this.config.thresholds.tempWarningHigh) {
      return { label: "Suhu Tinggi", cssClass: "dry" };
    } else if (temp <= this.config.thresholds.tempWarningLow) {
      return { label: "Suhu Dingin", cssClass: "wet" };
    }
    return { label: "Data sensor", cssClass: "neutral" };
  }

  getHumidityStatus(hum) {
    if (hum >= this.config.thresholds.airHumidityHigh) {
      return { label: "Sangat Lembap", cssClass: "wet" };
    } else if (hum <= this.config.thresholds.airHumidityLow) {
      return { label: "Udara Kering", cssClass: "dry" };
    }
    return { label: "Data sensor", cssClass: "neutral" };
  }

  /**
   * Perbarui tampilan kartu sensor pada antarmuka
   */
  renderUI() {
    // 1. Kelembapan Tanah
    const soilEl = document.getElementById("val-soil-moisture");
    const soilStatusBadge = document.getElementById("badge-soil-status");
    const soilProgress = document.getElementById("fill-soil-progress");

    if (soilEl) soilEl.textContent = this.currentData.soil_moisture;

    const soilStatus = this.getSoilStatus(this.currentData.soil_moisture);
    if (soilStatusBadge) {
      soilStatusBadge.textContent = soilStatus.label;
      soilStatusBadge.className = `status-badge ${soilStatus.cssClass}`;
    }
    if (soilProgress) {
      soilProgress.style.width = `${Math.min(100, Math.max(0, this.currentData.soil_moisture))}%`;
    }

    // 2. Suhu Udara
    const tempEl = document.getElementById("val-temperature");
    const tempStatusBadge = document.getElementById("badge-temp-status");
    const tempProgress = document.getElementById("fill-temp-progress");

    if (tempEl) tempEl.textContent = this.currentData.temperature.toFixed(1);
    const tempStatus = this.getTempStatus(this.currentData.temperature);
    if (tempStatusBadge) {
      tempStatusBadge.textContent = tempStatus.label;
      tempStatusBadge.className = `status-badge ${tempStatus.cssClass}`;
    }
    if (tempProgress) {
      const tempPercent = Math.min(100, Math.max(0, ((this.currentData.temperature - 10) / 40) * 100));
      tempProgress.style.width = `${tempPercent}%`;
    }

    // 3. Kelembapan Udara
    const humEl = document.getElementById("val-air-humidity");
    const humStatusBadge = document.getElementById("badge-hum-status");
    const humProgress = document.getElementById("fill-hum-progress");

    if (humEl) humEl.textContent = this.currentData.air_humidity;
    const humStatus = this.getHumidityStatus(this.currentData.air_humidity);
    if (humStatusBadge) {
      humStatusBadge.textContent = humStatus.label;
      humStatusBadge.className = `status-badge ${humStatus.cssClass}`;
    }
    if (humProgress) {
      humProgress.style.width = `${Math.min(100, Math.max(0, this.currentData.air_humidity))}%`;
    }

    // 4. Waktu Pembaruan Terakhir
    const lastUpdateEl = document.getElementById("last-update-time");
    if (lastUpdateEl) {
      const d = new Date(this.currentData.timestamp);
      const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " WIB";
      lastUpdateEl.textContent = `Pembaruan: ${timeStr}`;
    }
  }

  /**
   * Watchdog timer untuk mendeteksi sensor atau koneksi terputus
   */
  startWatchdog() {
    setInterval(() => {
      const secondsSinceLast = (Date.now() - this.lastReceivedAt) / 1000;
      const timeoutLimit = this.config.safety.sensorTimeoutSeconds || 15;

      if (secondsSinceLast > timeoutLimit && !this.isSensorStale) {
        this.isSensorStale = true;
        this.onAlertCallbacks.forEach(cb => cb({
          type: "danger",
          message: `Peringatan: Data sensor tidak diterima selama lebih dari ${Math.round(secondsSinceLast)} detik.`
        }));

        const statusPill = document.getElementById("device-status-pill");
        if (statusPill) {
          statusPill.innerHTML = `<span class="status-dot offline"></span> Perangkat Offline`;
        }
      }
    }, 3000);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = SensorManager;
} else if (typeof window !== "undefined") {
  window.SensorManager = SensorManager;
}
