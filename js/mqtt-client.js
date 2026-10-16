/**
 * SMART GARDEN IoT - MQTT CLIENT & BROKER CONNECTOR (mqtt-client.js)
 * Mengelola koneksi MQTT over WebSocket, publish, subscribe,
 * penanganan koneksi ulang, serta emulator ESP32 bawaan.
 * Sesuai Bagian 4, 5, 6 ujicoba.md
 */

class SmartGardenMQTT {
  constructor(config) {
    this.config = config || window.APP_CONFIG;
    this.client = null;
    this.isConnected = false;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = this.config.mqtt.maxReconnectAttempts || 10;
    this.reconnectTimer = null;
    
    // Mode Simulasi (aktif secara otomatis jika offline atau diaktifkan manual)
    this.simulationMode = this.config.simulator.enabledByDefault ?? true;
    this.simInterval = null;
    this.simState = {
      soil_moisture: this.config.simulator.initialSoilMoisture || 24,
      temperature: this.config.simulator.initialTemperature || 29.4,
      air_humidity: this.config.simulator.initialAirHumidity || 68,
      pump: "ON",
      mode: "AUTO",
      reason: "SOIL_BELOW_30",
      morningExecuted: false,
      eveningExecuted: false,
      pumpStartedAt: Date.now()
    };

    // Event listeners callback
    this.listeners = {
      connect: [],
      disconnect: [],
      message: [],
      statusChange: []
    };

    // Otomatis jalankan simulasi jika diaktifkan
    if (this.simulationMode) {
      this.startSimulation();
    }
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (err) { console.error(`Error in listener '${event}':`, err); }
      });
    }
  }

  /**
   * Menghubungkan ke broker MQTT WebSocket
   */
  connect(customSettings = {}) {
    const host = customSettings.host || this.config.mqtt.defaultHost;
    const port = customSettings.port || this.config.mqtt.defaultPort;
    const path = customSettings.path || this.config.mqtt.defaultPath;
    const useSSL = customSettings.useSSL !== undefined ? customSettings.useSSL : this.config.mqtt.useSSL;
    const clientId = (this.config.mqtt.clientIdPrefix || "sg_web_") + Math.random().toString(16).substring(2, 8);

    this.emit('statusChange', { status: 'connecting', message: `Menghubungkan ke broker ${host}:${port}...` });

    // Cek ketersediaan library Paho MQTT
    if (typeof Paho === "undefined" || !Paho.MQTT || !Paho.MQTT.Client) {
      console.warn("Library Paho MQTT tidak tersedia. Sistem beralih ke Mode Simulasi Terintegrasi.");
      this.isConnected = true;
      this.emit('statusChange', { status: 'simulator', message: 'Mode Simulasi Terintegrasi Aktif' });
      this.emit('connect', { isSimulator: true });
      return;
    }

    try {
      if (this.client) {
        try { this.client.disconnect(); } catch (e) {}
      }

      this.client = new Paho.MQTT.Client(host, Number(port), path, clientId);

      this.client.onConnectionLost = (responseObject) => {
        this.isConnected = false;
        this.emit('statusChange', { 
          status: 'disconnected', 
          message: responseObject.errorMessage || 'Koneksi ke broker terputus.' 
        });
        this.emit('disconnect', responseObject);
        this.handleReconnect();
      };

      this.client.onMessageArrived = (message) => {
        this.handleIncomingMessage(message.destinationName, message.payloadString);
      };

      const connectOptions = {
        timeout: 5,
        useSSL: useSSL,
        keepAliveInterval: this.config.mqtt.keepAlive || 60,
        cleanSession: true,
        onSuccess: () => {
          this.isConnected = true;
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
          this.emit('statusChange', { status: 'connected', message: 'Terhubung ke MQTT Broker.' });
          this.emit('connect', { host, port });
          
          // Subscribe ke topik sensor & status pompa
          this.subscribe(this.config.mqtt.topics.sensor);
          this.subscribe(this.config.mqtt.topics.pumpStatus);
          this.subscribe(this.config.mqtt.topics.systemStatus);

          // Hentikan simulator otomatis agar data murni dari MQTT
          if (this.simulationMode && !customSettings.keepSimulator) {
            this.stopSimulation();
            this.simulationMode = false;
          }
        },
        onFailure: (err) => {
          this.isConnected = false;
          console.warn("Gagal terhubung ke broker MQTT:", err.errorMessage || err);
          this.emit('statusChange', { 
            status: 'error', 
            message: `Gagal terhubung: ${err.errorMessage || 'Timeout'}` 
          });
          this.handleReconnect();
        }
      };

      if (customSettings.username) {
        connectOptions.userName = customSettings.username;
        if (customSettings.password) {
          connectOptions.password = customSettings.password;
        }
      }

      this.client.connect(connectOptions);
    } catch (err) {
      console.error("Kesalahan inisialisasi MQTT:", err);
      this.emit('statusChange', { status: 'error', message: err.message });
      this.handleReconnect();
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.isReconnecting = true;
      this.emit('statusChange', { 
        status: 'reconnecting', 
        message: `Mencoba menyambung kembali (${this.reconnectAttempts}/${this.maxReconnectAttempts})...` 
      });

      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.config.mqtt.reconnectInterval || 3000);
    } else {
      this.isReconnecting = false;
      this.emit('statusChange', { 
        status: 'fallback_simulator', 
        message: 'Koneksi broker gagal. Beralih ke Mode Simulator Mandiri.' 
      });
      // Fallback ke simulator agar user tetap bisa berinteraksi penuh
      this.startSimulation();
    }
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.client && this.isConnected) {
      try {
        this.client.disconnect();
      } catch (e) {}
    }
    this.isConnected = false;
    this.emit('statusChange', { status: 'disconnected', message: 'Koneksi diputus oleh pengguna.' });
    this.emit('disconnect', {});
  }

  subscribe(topic) {
    if (this.client && this.isConnected) {
      try {
        this.client.subscribe(topic, { qos: 0 });
        console.log(`Subscribed ke topik: ${topic}`);
      } catch (err) {
        console.error(`Gagal subscribe topik ${topic}:`, err);
      }
    }
  }

  publish(topic, payload) {
    const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    
    // Jika terhubung ke broker sungguhan
    if (this.client && this.isConnected && !this.simulationMode) {
      try {
        const message = new Paho.MQTT.Message(payloadStr);
        message.destinationName = topic;
        message.qos = 0;
        this.client.send(message);
      } catch (err) {
        console.error(`Gagal mempublikasikan ke ${topic}:`, err);
      }
    }

    // Jika dalam mode simulator, proses pesan langsung secara virtual
    if (this.simulationMode) {
      this.processSimulatedCommand(topic, payloadStr);
    }
  }

  handleIncomingMessage(topic, payloadStr) {
    try {
      const data = JSON.parse(payloadStr);
      this.emit('message', { topic, data, raw: payloadStr });
    } catch (e) {
      this.emit('message', { topic, data: payloadStr, raw: payloadStr });
    }
  }

  // =========================================================================
  // LOGIKA SIMULATOR ESP32 LENGKAP (Memenuhi Aturan ujicoba.md)
  // =========================================================================
  startSimulation() {
    this.simulationMode = true;
    if (this.simInterval) clearInterval(this.simInterval);

    console.log("Simulator IoT Smart Garden ESP32 diaktifkan.");
    this.emit('statusChange', { status: 'simulator', message: 'Mode Simulasi Aktif (ESP32 Virtual)' });

    // Loop pembacaan sensor berkala (setiap 2.5 detik)
    this.simInterval = setInterval(() => {
      this.runSimulationCycle();
    }, this.config.simulator.updateIntervalMs || 2500);

    // Kirim pesan pertama seketika
    this.runSimulationCycle();
  }

  stopSimulation() {
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
    this.simulationMode = false;
  }

  runSimulationCycle() {
    // 1. Dinamika nilai sensor: jika pompa ON, kelembapan tanah perlahan naik
    if (this.simState.pump === "ON") {
      this.simState.soil_moisture = Math.min(100, Math.round((this.simState.soil_moisture + 2.5) * 10) / 10);
    } else {
      // Jika pompa OFF, kelembapan sedikit menurun karena penguapan
      this.simState.soil_moisture = Math.max(10, Math.round((this.simState.soil_moisture - 0.4) * 10) / 10);
    }

    // Fluktuasi suhu & kelembapan udara yang alami
    const tempDelta = (Math.random() - 0.5) * 0.2;
    this.simState.temperature = Math.round((this.simState.temperature + tempDelta) * 10) / 10;
    const humDelta = (Math.random() - 0.5) * 0.4;
    this.simState.air_humidity = Math.min(95, Math.max(30, Math.round(this.simState.air_humidity + humDelta)));

    // 2. Evaluasi Aturan Otomatisasi Pompa (Histeresis & Ambang Batas 30% dan 60%)
    if (this.simState.mode === "AUTO") {
      if (this.simState.soil_moisture < this.config.thresholds.soilMoistureDry) {
        // < 30%: Pompa ON
        if (this.simState.pump !== "ON") {
          this.simState.pump = "ON";
          this.simState.reason = "SOIL_BELOW_30";
          this.simState.pumpStartedAt = Date.now();
          this.broadcastPumpStatus();
        }
      } else if (this.simState.soil_moisture >= this.config.thresholds.soilMoistureTarget) {
        // >= 60%: Pompa OFF
        if (this.simState.pump !== "OFF") {
          this.simState.pump = "OFF";
          this.simState.reason = "SOIL_REACHED_TARGET";
          this.broadcastPumpStatus();
        }
      }
      // 30% - 59.9%: Pertahankan status pompa sebelumnya (Histeresis)
    }

    // 3. Proteksi Keselamatan Pompa: Batas waktu operasi (Max Runtime Timeout)
    if (this.simState.pump === "ON") {
      const elapsedSeconds = (Date.now() - this.simState.pumpStartedAt) / 1000;
      if (elapsedSeconds >= this.config.safety.maxPumpDurationSeconds) {
        this.simState.pump = "OFF";
        this.simState.reason = "SAFETY_TIMEOUT_EXCEEDED";
        this.broadcastPumpStatus();
      }
    }

    // 4. Publikasikan Data Sensor sesuai format ujicoba.md
    const now = new Date();
    const sensorPayload = {
      soil_moisture: this.simState.soil_moisture,
      temperature: this.simState.temperature,
      air_humidity: this.simState.air_humidity,
      timestamp: now.toISOString()
    };

    this.handleIncomingMessage(this.config.mqtt.topics.sensor, JSON.stringify(sensorPayload));
  }

  broadcastPumpStatus() {
    const statusPayload = {
      pump: this.simState.pump,
      mode: this.simState.mode,
      reason: this.simState.reason,
      timestamp: new Date().toISOString()
    };
    this.handleIncomingMessage(this.config.mqtt.topics.pumpStatus, JSON.stringify(statusPayload));
  }

  processSimulatedCommand(topic, payloadStr) {
    if (topic === this.config.mqtt.topics.pumpCommand) {
      try {
        const cmd = JSON.parse(payloadStr);
        if (cmd.mode) {
          this.simState.mode = cmd.mode;
        }

        if (this.simState.mode === "MANUAL" && cmd.command) {
          this.simState.pump = cmd.command === "ON" ? "ON" : "OFF";
          this.simState.reason = cmd.command === "ON" ? "MANUAL_COMMAND_ON" : "MANUAL_COMMAND_OFF";
          if (this.simState.pump === "ON") {
            this.simState.pumpStartedAt = Date.now();
          }
        }
        
        // Segera konfirmasi status ke website (seperti ESP32 nyata)
        this.broadcastPumpStatus();
      } catch (e) {
        console.error("Gagal memproses simulated command:", e);
      }
    }
  }

  // Helper untuk pengujian cepat interaktif dari UI Simulator
  setSimSoilMoisture(val) {
    this.simState.soil_moisture = Number(val);
    this.runSimulationCycle();
  }

  setSimTemperature(val) {
    this.simState.temperature = Number(val);
    this.runSimulationCycle();
  }

  setSimAirHumidity(val) {
    this.simState.air_humidity = Number(val);
    this.runSimulationCycle();
  }
}

// Export instance atau kelas
if (typeof module !== "undefined" && module.exports) {
  module.exports = SmartGardenMQTT;
} else if (typeof window !== "undefined") {
  window.SmartGardenMQTT = SmartGardenMQTT;
}
