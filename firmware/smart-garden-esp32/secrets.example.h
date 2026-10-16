/**
 * SMART GARDEN IoT - SECRETS TEMPLATE (secrets.example.h)
 * Salin file ini menjadi secrets.h dan isi dengan kredensial jaringan Anda.
 */

#ifndef SECRETS_H
#define SECRETS_H

// Konfigurasi WiFi
#define WIFI_SSID             "NAMA_WIFI_ANDA"
#define WIFI_PASSWORD         "PASSWORD_WIFI_ANDA"

// Konfigurasi Broker MQTT (Misal: broker.emqx.io atau IP Mosquitto Lokal)
#define MQTT_BROKER_HOST      "broker.emqx.io"
#define MQTT_BROKER_PORT      1883
#define MQTT_USER             "" // Kosongkan jika tanpa autentikasi
#define MQTT_PASSWORD         "" // Kosongkan jika tanpa autentikasi

// Topik MQTT
#define MQTT_TOPIC_SENSOR       "smartgarden/sensor"
#define MQTT_TOPIC_PUMP_COMMAND "smartgarden/pump/command"
#define MQTT_TOPIC_PUMP_STATUS  "smartgarden/pump/status"
#define MQTT_TOPIC_SYSTEM       "smartgarden/system/status"

#endif
