/* ==========================================================================
   SMART GARDEN IoT - FIRMWARE ESP32 (smart-garden-esp32.ino)
   Sistem Pemantauan dan Pengendalian Penyiraman Tanaman Berbasis IoT
   Sesuai Spesifikasi ujicoba.md:
   - Pembacaan sensor kelembapan tanah & DHT22
   - Logika otomasi histeresis (ON <30%, OFF >=60%)
   - Jadwal penyiraman 07.00 dan 17.00 (NTP WIB / GMT+7)
   - Kendali manual MQTT & konfirmasi status aktual
   - Proteksi keselamatan batas waktu pompa menyala
   ========================================================================== */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <time.h>
#include "secrets.example.h"

// --- KONFIGURASI PIN HARDWARE ESP32 ---
#define PIN_SOIL_ANALOG    34      // ADC pin untuk sensor kelembapan tanah (Capacitive / Resistive)
#define PIN_DHT            4       // GPIO untuk sensor DHT22
#define PIN_RELAY_PUMP     16      // GPIO pengontrol Relay / MOSFET pompa air
#define DHTTYPE            DHT22   // Sensor suhu & kelembapan udara

// Konfigurasi Logika Relay (ACTIVE_LOW umum pada modul relay 5V optocoupler)
#define RELAY_ON           LOW
#define RELAY_OFF          HIGH

// --- AMBANG BATAS & ATURAN OTOMASI (ujicoba.md) ---
const float SOIL_THRESHOLD_DRY    = 30.0; // < 30%: Pompa ON
const float SOIL_THRESHOLD_TARGET = 60.0; // >= 60%: Pompa OFF
const unsigned long MAX_PUMP_RUN_MS = 180000; // 3 Menit (Safety Timeout)
const unsigned long SENSOR_INTERVAL = 2500;   // Baca & kirim sensor tiap 2.5 detik

// Kalibrasi Sensor Tanah Analog ESP32 (12-bit ADC: 0 - 4095)
// Nilai disesuaikan saat kalibrasi udara kering vs air penuh
const int SOIL_VAL_AIR   = 3500; // Pembacaan ADC saat kering (0%)
const int SOIL_VAL_WATER = 1400; // Pembacaan ADC saat terendam air (100%)

// Objek Hardware & Jaringan
DHT dht(PIN_DHT, DHTTYPE);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Status Sistem & Pompa
enum OperationMode { MODE_AUTO, MODE_MANUAL };
OperationMode currentMode = MODE_AUTO;

bool isPumpActive = false;
unsigned long pumpStartTime = 0;
unsigned long lastSensorPublish = 0;

// Flag Jadwal Harian
bool morningScheduleDone = false;
bool eveningScheduleDone = false;

// Zona Waktu WIB (UTC+7 = 7 * 3600 = 25200 detik)
const long gmtOffset_sec = 25200;
const int daylightOffset_sec = 0;
const char* ntpServer = "pool.ntp.org";

// Prototipe Fungsi
void setupWiFi();
void reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
float readSoilMoisture();
void handleAutomationLogic(float soilMoisture, struct tm &timeinfo);
void setPump(bool activate, const char* reason);
void publishSensorData(float soil, float temp, float hum, struct tm &timeinfo);
void publishPumpStatus(const char* reason);

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SMART GARDEN IoT ESP32 MEMULAI ===");

  // Inisialisasi Pin Relay
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  digitalWrite(PIN_RELAY_PUMP, RELAY_OFF);
  isPumpActive = false;

  // Inisialisasi Sensor DHT22
  dht.begin();

  // Koneksi WiFi & NTP Time
  setupWiFi();
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  // Inisialisasi MQTT Broker
  mqttClient.setServer(MQTT_BROKER_HOST, MQTT_BROKER_PORT);
  mqttClient.setCallback(mqttCallback);

  Serial.println("Inisialisasi hardware dan jaringan selesai.");
}

void loop() {
  // Pastikan koneksi MQTT tetap aktif
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Dapatkan waktu saat ini dari NTP
  struct tm timeinfo;
  bool timeValid = getLocalTime(&timeinfo);

  // Pembacaan dan Publikasi Sensor secara berkala
  unsigned long now = millis();
  if (now - lastSensorPublish >= SENSOR_INTERVAL) {
    lastSensorPublish = now;

    float soilMoisture = readSoilMoisture();
    float temperature = dht.readTemperature();
    float airHumidity = dht.readHumidity();

    if (isnan(temperature) || isnan(airHumidity)) {
      Serial.println("[Peringatan] Gagal membaca data dari DHT22!");
      temperature = 28.0; // Nilai fallback aman
      airHumidity = 65.0;
    }

    // Jalankan aturan otomatisasi pompa (Histeresis & Jadwal)
    if (timeValid) {
      handleAutomationLogic(soilMoisture, timeinfo);
    }

    // Publikasikan ke MQTT topik 'smartgarden/sensor'
    publishSensorData(soilMoisture, temperature, airHumidity, timeinfo);
  }

  // Proteksi Keselamatan Pompa: Batas Waktu Maksimum
  if (isPumpActive) {
    if (millis() - pumpStartTime >= MAX_PUMP_RUN_MS) {
      Serial.println("[SAFETY] Batas waktu operasi pompa maksimum terlampaui. Mematikan pompa!");
      setPump(false, "SAFETY_TIMEOUT_EXCEEDED");
    }
  }
}

// =========================================================================
// LOGIKA AMBANG BATAS, HISTERESIS, & JADWAL (Bagian 2 & 5 ujicoba.md)
// =========================================================================
void handleAutomationLogic(float soilMoisture, struct tm &timeinfo) {
  int hour = timeinfo.tm_hour;
  int minute = timeinfo.tm_min;

  // Reset flag jadwal setiap tengah malam
  if (hour == 0 && minute == 0) {
    morningScheduleDone = false;
    eveningScheduleDone = false;
  }

  if (currentMode == MODE_AUTO) {
    // 1. Aturan Kelembapan Tanah (Histeresis 30% dan 60%)
    if (soilMoisture < SOIL_THRESHOLD_DRY) {
      // Kelembapan tanah < 30% -> Pompa ON
      if (!isPumpActive) {
        setPump(true, "SOIL_BELOW_30");
      }
    } else if (soilMoisture >= SOIL_THRESHOLD_TARGET) {
      // Kelembapan tanah >= 60% -> Pompa OFF
      if (isPumpActive) {
        setPump(false, "SOIL_REACHED_TARGET");
      }
    }
    // Kelembapan 30% sampai <60%: Pertahankan status pompa sebelumnya (Histeresis stabil)

    // 2. Aturan Jadwal Pagi 07.00 WIB
    if (hour == 7 && minute == 0 && !morningScheduleDone) {
      morningScheduleDone = true;
      if (!isPumpActive && soilMoisture < SOIL_THRESHOLD_TARGET) {
        setPump(true, "SCHEDULE_MORNING");
      }
    }

    // 3. Aturan Jadwal Sore 17.00 WIB
    if (hour == 17 && minute == 0 && !eveningScheduleDone) {
      eveningScheduleDone = true;
      if (!isPumpActive && soilMoisture < SOIL_THRESHOLD_TARGET) {
        setPump(true, "SCHEDULE_EVENING");
      }
    }
  }
}

// Mengendalikan Relay Pompa dan Mengirim Konfirmasi Status
void setPump(bool activate, const char* reason) {
  isPumpActive = activate;
  digitalWrite(PIN_RELAY_PUMP, activate ? RELAY_ON : RELAY_OFF);

  if (activate) {
    pumpStartTime = millis();
    Serial.printf("[POMPA ON] Alasan: %s\n", reason);
  } else {
    Serial.printf("[POMPA OFF] Alasan: %s\n", reason);
  }

  // Publikasikan konfirmasi status aktual ke 'smartgarden/pump/status'
  publishPumpStatus(reason);
}

// Membaca Sensor Tanah dengan Konversi Persentase & Kalibrasi
float readSoilMoisture() {
  int rawADC = analogRead(PIN_SOIL_ANALOG);
  // Pemetaan ADC ke persentase 0 - 100%
  float moisture = map(rawADC, SOIL_VAL_AIR, SOIL_VAL_WATER, 0, 100);
  moisture = constrain(moisture, 0.0, 100.0);
  return moisture;
}

// Publikasi Data Sensor JSON ke MQTT
void publishSensorData(float soil, float temp, float hum, struct tm &timeinfo) {
  StaticJsonDocument<256> doc;
  doc["soil_moisture"] = round(soil * 10.0) / 10.0;
  doc["temperature"]   = round(temp * 10.0) / 10.0;
  doc["air_humidity"]  = round(hum * 10.0) / 10.0;

  char timeStr[40];
  strftime(timeStr, sizeof(timeStr), "%Y-%m-%dT%H:%M:%S+07:00", &timeinfo);
  doc["timestamp"] = timeStr;

  char buffer[256];
  serializeJson(doc, buffer);
  mqttClient.publish(MQTT_TOPIC_SENSOR, buffer);
}

// Publikasi Status Aktual Pompa ke MQTT
void publishPumpStatus(const char* reason) {
  StaticJsonDocument<256> doc;
  doc["pump"]   = isPumpActive ? "ON" : "OFF";
  doc["mode"]   = (currentMode == MODE_AUTO) ? "AUTO" : "MANUAL";
  doc["reason"] = reason;

  char buffer[256];
  serializeJson(doc, buffer);
  mqttClient.publish(MQTT_TOPIC_PUMP_STATUS, buffer);
}

// Penerimaan Perintah dari Website melalui MQTT Callback
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.printf("[MQTT Pesan Diterima] Topik: %s\n", topic);
  
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, payload, length);
  if (err) {
    Serial.print("Gagal parsing JSON: ");
    Serial.println(err.c_str());
    return;
  }

  // Periksa perubahan mode
  if (doc.containsKey("mode")) {
    const char* modeStr = doc["mode"];
    if (strcmp(modeStr, "AUTO") == 0) {
      currentMode = MODE_AUTO;
      Serial.println("[MODE] Beralih ke OTOMATIS");
    } else if (strcmp(modeStr, "MANUAL") == 0) {
      currentMode = MODE_MANUAL;
      Serial.println("[MODE] Beralih ke MANUAL");
    }
  }

  // Jika mode MANUAL, proses perintah ON / OFF
  if (currentMode == MODE_MANUAL && doc.containsKey("command")) {
    const char* cmd = doc["command"];
    if (strcmp(cmd, "ON") == 0) {
      setPump(true, "MANUAL_COMMAND_ON");
    } else if (strcmp(cmd, "OFF") == 0) {
      setPump(false, "MANUAL_COMMAND_OFF");
    }
  }
}

// Setup WiFi
void setupWiFi() {
  delay(100);
  Serial.printf("Menghubungkan ke WiFi: %s\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Terhubung! IP Address: ");
  Serial.println(WiFi.localIP());
}

// Reconnect MQTT dengan LWT (Last Will and Testament)
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Mencoba menyambung ke MQTT Broker...");
    String clientId = "ESP32_SmartGarden_" + String(random(0xffff), HEX);

    // Kirim LWT jika koneksi terputus tiba-tiba
    const char* willTopic = MQTT_TOPIC_SYSTEM;
    const char* willMessage = "{\"device\":\"ESP32\",\"status\":\"OFFLINE\"}";

    if (mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD, willTopic, 0, false, willMessage)) {
      Serial.println("Berhasil terhubung ke Broker MQTT!");
      
      // Kirim status awal online
      mqttClient.publish(MQTT_TOPIC_SYSTEM, "{\"device\":\"ESP32\",\"status\":\"ONLINE\"}");

      // Subscribe ke perintah pompa dari website
      mqttClient.subscribe(MQTT_TOPIC_PUMP_COMMAND);

      // Konfirmasi status pompa saat pertama tersambung
      publishPumpStatus("INITIAL_SYNC");
    } else {
      Serial.printf("Gagal rc=%d. Mencoba lagi dalam 5 detik...\n", mqttClient.state());
      delay(5000);
    }
  }
}
