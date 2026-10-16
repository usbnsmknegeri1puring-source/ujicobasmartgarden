/**
 * Konfigurasi Aplikasi Smart Garden IoT
 * Sesuai panduan dan spesifikasi ujicoba.md
 */

const APP_CONFIG = {
  // Informasi Sistem
  appName: "Smart Garden",
  appSubtitle: "IoT Plant Monitoring & Irrigation",
  version: "1.0.0",

  // Konfigurasi MQTT over WebSocket
  mqtt: {
    // Default broker: EMQX Public Broker (WebSocket SSL)
    // Bisa diganti dengan Mosquitto lokal (misal: ws://localhost:9001) atau broker terkelola lainnya
    defaultHost: "broker.emqx.io",
    defaultPort: 8084, // Port SSL WebSocket EMQX (atau 8083 untuk ws://, atau 9001 untuk Mosquitto ws://)
    defaultPath: "/mqtt",
    useSSL: true,
    clientIdPrefix: "smartgarden_web_",
    reconnectInterval: 3000, // milidetik
    maxReconnectAttempts: 10,
    keepAlive: 60,
    
    // Topik MQTT
    topics: {
      sensor: "smartgarden/sensor",
      pumpCommand: "smartgarden/pump/command",
      pumpStatus: "smartgarden/pump/status",
      systemStatus: "smartgarden/system/status"
    }
  },

  // Aturan Ambang Batas Sensor & Histeresis
  thresholds: {
    // Kelembapan tanah < 30% -> Pompa Otomatis ON
    soilMoistureDry: 30,
    // Kelembapan tanah >= 60% -> Pompa Otomatis OFF
    soilMoistureTarget: 60,
    // Rentang histeresis: 30% - 59.9% (pertahankan status sebelumnya)
    
    // Suhu (°C)
    tempWarningHigh: 35.0,
    tempWarningLow: 18.0,

    // Kelembapan udara (%)
    airHumidityLow: 40,
    airHumidityHigh: 85
  },

  // Jadwal Penyiraman Otomatis (WIB / GMT+7)
  schedules: {
    morning: {
      id: "morning",
      label: "Penyiraman Pagi",
      time: "07:00",
      hour: 7,
      minute: 0,
      description: "Jadwal pagi untuk menyegarkan tanaman sebelum terik matahari"
    },
    evening: {
      id: "evening",
      label: "Penyiraman Sore",
      time: "17:00",
      hour: 17,
      minute: 0,
      description: "Jadwal sore untuk menjaga kelembapan tanah di malam hari"
    }
  },

  // Proteksi Keselamatan Pompa
  safety: {
    // Batas waktu maksimum pompa menyala terus menerus (dalam detik) untuk mencegah banjir/dry-run
    maxPumpDurationSeconds: 180, // 3 menit
    // Batas toleransi sensor offline (detik tanpa pesan baru dianggap offline)
    sensorTimeoutSeconds: 15
  },

  // Pengaturan Simulator Internal
  simulator: {
    enabledByDefault: true, // Berfungsi langsung tanpa harus menyalakan ESP32 fisik
    updateIntervalMs: 2500, // Pembaruan tiap 2.5 detik
    initialSoilMoisture: 24, // Sesuai contoh pada ujicoba.md
    initialTemperature: 29.4, // Sesuai contoh pada ujicoba.md
    initialAirHumidity: 68 // Sesuai contoh pada ujicoba.md
  }
};

// Export untuk module / browser window
if (typeof module !== "undefined" && module.exports) {
  module.exports = APP_CONFIG;
} else if (typeof window !== "undefined") {
  window.APP_CONFIG = APP_CONFIG;
}
