# Smart Garden IoT - Sistem Monitoring & Pengendalian Penyiraman Tanaman

Sistem pemantauan dan penyiraman tanaman cerdas berbasis Internet of Things (IoT) yang menghubungkan mikrokontroler ESP32, broker MQTT (Mosquitto/EMQX), dan dashboard web responsif realtime.

Proyek ini dibangun berdasarkan rancangan teknis dan aturan operasional pada dokumen `ujicoba.md`.

---

## 🌟 Fitur Utama Dashboard

1. **Monitoring Sensor Realtime**
   - Kelembapan tanah (`%`) dengan status eksplisit (*Tanah Kering*, *Tanah Lembap*, *Tanah Basah*).
   - Suhu udara (`°C`) melalui sensor DHT22.
   - Kelembapan udara (`%`) melalui sensor DHT22.
   - Indikator koneksi perangkat (*Online* / *Offline*) dan waktu pembaruan data terakhir.

2. **Kontrol Pompa Otomatis & Manual**
   - **Mode Otomatis**:
     - Kelembapan tanah `< 30%` ➔ Pompa otomatis **ON**.
     - Kelembapan tanah `>= 60%` ➔ Pompa otomatis **OFF**.
     - Kelembapan `30% - 59.9%` ➔ Pertahankan status pompa sebelumnya (**Histeresis Stabil**).
   - **Mode Manual**: Tombol kontrol langsung **Pompa ON** dan **Pompa OFF** dengan konfirmasi status aktual dari perangkat.
   - **Proteksi Keselamatan**: Batas waktu operasi pompa maksimum 180 detik (*Safety Timeout*) untuk mencegah kebocoran atau kerusakan pompa.

3. **Jadwal Penyiraman Terjadwal**
   - Jadwal pagi pukul **07.00 WIB**.
   - Jadwal sore pukul **17.00 WIB**.
   - Hitung mundur waktu realtime menuju jadwal berikutnya.
   - Indikator status (*Sudah Dijalankan*, *Menunggu Jadwal*, *Sedang Berjalan*).
   - Logika berjalan mandiri di mikrokontroler ESP32 (menggunakan NTP time) agar penyiraman tetap aktif meskipun website ditutup.

4. **Grafik dan Riwayat Sensor (Chart.js)**
   - Visualisasi grafik garis riwayat kelembapan tanah, suhu, dan kelembapan udara.
   - Filter metrik tampilan (*Semua*, *Tanah*, *Suhu*, *Udara*).
   - Dukungan tema otomatis (*Light Mode* & *Dark Mode*).

5. **Log Aktivitas & Riwayat Realtime**
   - Pencatatan seluruh kejadian sensor, pompa, jadwal, dan sistem secara otomatis.
   - Filter kategori log (*Sensor*, *Pompa*, *Jadwal*, *Sistem*).
   - Fitur ekspor riwayat aktivitas ke file **CSV**.

6. **Simulator IoT Interaktif Bawaan**
   - Panel simulasi terintegrasi langsung di dashboard web.
   - Slider pengatur kelembapan tanah, suhu, dan kelembapan udara secara bebas.
   - Tombol uji skenario cepat (*Uji Kering <30%*, *Uji Target >=60%*, *Uji Histeresis 45%*, *Uji Jadwal 07.00*, *Putus/Sambung Koneksi*).
   - Dashboard dapat langsung didemokan dan diuji 100% tanpa perlu menyalakan mikrokontroler fisik terlebih dahulu!

---

## 📁 Struktur File Proyek

Sesuai ketentuan Bagian 6 pada `ujicoba.md`:

```
ujicoba iot/
│
├── index.html                     # Kerangka dashboard dan antarmuka utama
├── ujicoba.md                     # Dokumen rancangan asli
├── README.md                      # Dokumentasi teknis proyek
│
├── assets/
│   └── images/
│       └── logo.svg               # Identitas visual logo Smart Garden
│
├── css/
│   ├── style.css                  # Warna, tipografi, kartu, tema light/dark
│   ├── dashboard.css              # Gaya spesifik panel kontrol, gauge, grafik
│   └── responsive.css             # Penyesuaian smartphone dan desktop
│
├── js/
│   ├── app.js                     # Inisialisasi utama dan integrasi antarmodul
│   ├── mqtt-client.js             # Koneksi broker MQTT over WebSocket & simulator
│   ├── sensor.js                  # Pemrosesan data sensor & aturan ambang batas
│   ├── pump-control.js            # Kontrol tombol pompa ON/OFF & mode kendali
│   ├── schedule.js                # Pengelola jadwal 07.00 & 17.00 WIB
│   └── charts.js                  # Visualisasi grafik riwayat Chart.js
│
├── config/
│   └── app-config.js              # Pengaturan broker, topik, dan ambang batas
│
├── firmware/
│   └── smart-garden-esp32/
│       ├── smart-garden-esp32.ino # Kode firmware Arduino C++ ESP32
│       └── secrets.example.h      # Template kredensial WiFi & MQTT
│
└── broker/
    └── mosquitto.conf             # Konfigurasi broker Mosquitto (port 1883 & 9001)
```

---

## 🚀 Cara Menjalankan Website

### Opsi 1: Menjalankan dengan Local Web Server (Direkomendasikan)
Anda dapat menggunakan `npx serve`, Node.js, atau Live Server:

```bash
# Menggunakan npx serve
npx serve .

# Atau menggunakan Python jika tersedia
python -m http.server 8080
```
Buka browser pada alamat yang ditampilkan (contoh: `http://localhost:3000` atau `http://localhost:8080`).

### Opsi 2: Membuka Langsung File HTML
Cukup klik ganda (double-click) pada file `index.html` untuk langsung membukanya di browser Google Chrome, Edge, atau Firefox. Seluruh modul dan simulator internal akan langsung aktif.

---

## 📡 Konfigurasi MQTT & ESP32

### 1. Topik MQTT yang Digunakan

| Topik | Arah Pesan | Format Pesan / Contoh Payload |
|---|---|---|
| `smartgarden/sensor` | ESP32 ➔ Website | `{"soil_moisture":24, "temperature":29.4, "air_humidity":68, "timestamp":"2026-10-16T07:00:00+07:00"}` |
| `smartgarden/pump/command` | Website ➔ ESP32 | `{"command":"ON", "mode":"MANUAL"}` |
| `smartgarden/pump/status` | ESP32 ➔ Website | `{"pump":"ON", "mode":"AUTO", "reason":"SOIL_BELOW_30"}` |
| `smartgarden/system/status` | ESP32 ➔ Website | `{"device":"ESP32", "status":"ONLINE"}` |

### 2. Menjalankan Mosquitto Broker Lokal
Jika menggunakan broker Mosquitto lokal:
```bash
mosquitto -c broker/mosquitto.conf -v
```
Mosquitto akan membuka:
- **Port 1883**: MQTT standard untuk koneksi mikrokontroler ESP32.
- **Port 9001**: MQTT over WebSocket untuk koneksi dashboard website di browser.

### 3. Mengunggah Firmware ke ESP32
1. Buka Arduino IDE.
2. Pasang library: `PubSubClient`, `DHT sensor library`, `ArduinoJson`.
3. Buka file `firmware/smart-garden-esp32/smart-garden-esp32.ino`.
4. Salin `firmware/smart-garden-esp32/secrets.example.h` menjadi `secrets.h` dan sesuaikan nama WiFi, password, serta alamat IP broker MQTT Anda.
5. Hubungkan ESP32 melalui USB dan unggah program (*Upload*).

---

## 🎯 12 Kriteria Keberhasilan Teruji

Website telah memenuhi seluruh target keberhasilan sesuai Bagian 7 dokumen `ujicoba.md`:

| No. | Kriteria Pengujian | Status Hasil Pengujian |
|---|---|---|
| 1 | **Monitoring sensor** | ✅ Berfungsi: Data kelembapan tanah, suhu, dan kelembapan udara tampil realtime |
| 2 | **Pembaruan realtime** | ✅ Berfungsi: Pembaruan data otomatis tanpa perlu reload halaman (&lt; 3 detik) |
| 3 | **Pompa otomatis ON** | ✅ Berfungsi: Pompa aktif ketika kelembapan tanah &lt; 30% |
| 4 | **Pompa otomatis OFF** | ✅ Berfungsi: Pompa mati saat kelembapan tanah mencapai &ge; 60% |
| 5 | **Histeresis** | ✅ Berfungsi: Status stabil pada rentang 30% hingga kurang dari 60% tanpa osilasi |
| 6 | **Jadwal pagi** | ✅ Berfungsi: Jadwal penyiraman 07.00 WIB terpantau dengan hitung mundur & status |
| 7 | **Jadwal sore** | ✅ Berfungsi: Jadwal penyiraman 17.00 WIB terpantau dengan hitung mundur & status |
| 8 | **Kontrol manual** | ✅ Berfungsi: Tombol ON/OFF mengirim perintah ke ESP32 dan menerima konfirmasi status aktual |
| 9 | **Ketahanan koneksi** | ✅ Berfungsi: Deteksi otomatis saat koneksi putus dan auto-reconnect berkala |
| 10 | **Keamanan pompa** | ✅ Berfungsi: Pembatas waktu operasi maksimum 180 detik (*Safety Timeout*) |
| 11 | **Responsivitas** | ✅ Berfungsi: Tata letak responsif mulus di layar komputer, tablet, dan smartphone |
| 12 | **Keamanan MQTT** | ✅ Berfungsi: Kredensial sensitif terpisah di firmware, konfigurasi broker fleksibel |
