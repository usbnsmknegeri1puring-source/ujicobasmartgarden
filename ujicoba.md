# Rancangan Website Smart Garden IoT untuk Penyiraman Tanaman

Website Smart Garden IoT dirancang sebagai sistem pemantauan dan pengendalian penyiraman tanaman berbasis Internet of Things (IoT). Website memungkinkan pengguna memantau kelembapan tanah, suhu udara, dan kelembapan udara secara realtime, serta mengontrol pompa air secara otomatis berdasarkan kondisi tanah, jadwal penyiraman, maupun perintah manual.

## 1. Apa tujuan website Smart Garden IoT?

Tujuan utama website Smart Garden IoT adalah membangun sistem penyiraman tanaman yang cerdas, otomatis, efisien, dan dapat dikendalikan dari jarak jauh melalui browser pada komputer atau smartphone.

Tujuan khususnya meliputi:

1. Memantau kelembapan tanah secara realtime untuk mengetahui kondisi tanah dan kebutuhan air tanaman.
2. Memantau suhu dan kelembapan udara sebagai informasi kondisi lingkungan tanaman.
3. Mengaktifkan pompa air secara otomatis ketika kelembapan tanah kurang dari 30% dan menghentikannya ketika kelembapan tanah mencapai atau melebihi 60%.
4. Menjadwalkan penyiraman otomatis dua kali sehari, yaitu pukul 07.00 dan 17.00.
5. Menyediakan kontrol manual agar pengguna dapat menyalakan atau mematikan pompa melalui website.
6. Menampilkan status pompa, mode operasi, jadwal penyiraman, dan riwayat perubahan sensor.
7. Menghemat penggunaan air dan mengurangi kebutuhan penyiraman secara manual.

## 2. Apa fitur utama dashboard?

Dashboard dibagi menjadi beberapa fitur utama berikut.

[FarmiQ – Smart Greenhouse IoT System by Mohaiminul Islam on Dribbble](https://images.openai.com/static-rsc-4/ixACHl7HKfISc8-JPDyzmO08-1zYrr5J1vpukV60dGKwzAIxe064aFSU0jvTaEtIP1ArOlx5zQLkKpVXBVCuE_jzBTnGSH11UVsbvMDF1TCZxx_q2XU-L2IEKkaikw4qkHQddjGDIFGd2g5tdxSsSPGFxyg3XAJokQ5k_DTOVcc?purpose=inline)

1\. Monitoring sensor realtime

Menampilkan tiga parameter utama:

- Kelembapan tanah (%).
- Suhu udara (°C).
- Kelembapan udara (%).

Data diperbarui secara otomatis setiap kali perangkat IoT mengirimkan data baru.

[Farm Automation System using Robo ESP32!](https://images.openai.com/static-rsc-4/-SpA7Kj9TJsokLijJbAs1MrRAc3-MFx8BdQol0KXoHVftTi0W5NH5ZBCt1j-5YEoYhK-S5Gxt2wX08X23lwW6kWbzoEGpghO93smhOhmG7b0SEOIkoTjND9QWVthKp3Lqb0BGoBKVmo1k5nVLcvM1LxluhSFjooO_KuthCKyvbw?purpose=inline)

2\. Kontrol pompa air

- Tombol ON dan OFF untuk kontrol manual.
- Mode Otomatis dan Manual.
- Indikator status pompa menyala atau mati.
- Indikator status koneksi perangkat IoT.

Perintah kontrol dikirim melalui MQTT WebSocket.

[Smart Garden Control Dashboard Template](https://images.openai.com/static-rsc-4/dFkNaikUkozSCPhex-8-SoRMoe07_MqPTiSa8d_1YKT_f__3KrsTUByXbMcVEsiPxq2eKyF8MItDZk5xB_H5-0vLKu3CHL63nfAC5z_uLhHtI7LDQlmMTGVmcePmn22RyxDfIPWl8r3B-xx28dd9p2VpCNYd5IJXdYk47EIxaks?purpose=inline)

3\. Jadwal penyiraman

- Penyiraman pagi pukul 07.00.
- Penyiraman sore pukul 17.00.
- Menampilkan jadwal berikutnya.
- Indikator jadwal sudah dijalankan atau belum.

Jadwal harus dijalankan oleh perangkat IoT atau pengendali yang tetap aktif meskipun website ditutup.

[AGRISENSE | Devpost](https://images.openai.com/static-rsc-4/nmGG5j1EaxvePQYW0zg8JBzStNjDNG9ge05jHIBsa5jkmquN-X_z0RE4XiZKjsc0_F0vi0UMiaVCB1tl1YpzJhfi3w5cVEtUsdlw0F3B-vtR1kcpJQl34RMZgff_jdJ4spZfKiXT8pRUIqTwZUeGCPoYJN4dabsGnxD1epixB2g?purpose=inline)

4\. Grafik dan riwayat sensor

Menampilkan grafik perubahan kelembapan tanah, suhu, dan kelembapan udara berdasarkan waktu, sehingga pengguna dapat mengevaluasi kondisi tanaman.

[Agritech Analytics & Monitoring Dashboard by Fahema Yesmin on Dribbble](https://images.openai.com/static-rsc-4/if3V9nPWz1weuSn8BacPV0D7jOxDIIOXJ6cgu86QLaM9BIykxF4F6Nn_FH-RY-w9cyJFERTjhPPtZr1fOB-VI7aASOkcg5q6Ge0ykCUDMp4AWEQa-_Ngs8ruAopMKvrx9loKrbLl_3jqT2FFzpx6kUjVvb5Gl-GEtrmYmwd6GSg?purpose=inline)

5\. Status sistem dan notifikasi

- Status perangkat online/offline.
- Waktu pembaruan data terakhir.
- Status pompa dan mode operasi.
- Peringatan ketika sensor atau koneksi terputus.

### Aturan otomatisasi pompa

| Kondisi                                       | Tindakan sistem                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| Kelembapan tanah kurang dari 30%              | Pompa ON                                                                 |
| Kelembapan tanah mencapai atau lebih dari 60% | Pompa OFF                                                                |
| Kelembapan tanah 30–kurang dari 60%           | Pertahankan status pompa sebelumnya                                      |
| Pukul 07.00                                   | Jalankan penyiraman pagi jika belum dijalankan                           |
| Pukul 17.00                                   | Jalankan penyiraman sore jika belum dijalankan                           |
| Pengguna memilih mode Manual                  | Pompa mengikuti perintah manual, dengan proteksi keselamatan tetap aktif |

Catatan penting: Batas 30% dan 60% membentuk histeresis agar pompa tidak sering hidup-mati ketika nilai sensor berada dekat ambang batas. Untuk jadwal pukul 07.00 dan 17.00, durasi penyiraman atau kondisi penghentian perlu ditentukan. Rekomendasi awal adalah pompa berhenti ketika kelembapan mencapai 60%, disertai batas waktu maksimum sebagai pengaman.

## 3. Bagaimana desain tampilan website?

Desain yang direkomendasikan adalah dashboard modern, responsif, sederhana, dan bernuansa alam. Informasi terpenting harus terlihat tanpa pengguna perlu membuka banyak halaman.

## Smart Garden

IoT Plant Monitoring & Irrigation

Online

MONITORING REALTIME

Kelembapan tanah

# 24%

Tanah kering

Suhu udara

# 29.4°C

Data sensor

Kelembapan udara

# 68%

Data sensor

Penyiraman berikutnya

# 17.00

Jadwal sore

Kontrol Pompa

Pompa ON

Mode operasi

Otomatis

Pompa menyala karena kelembapan tanah di bawah 30%.

Pompa ON

Pompa OFF

Ilustrasi antarmuka, bukan status sensor atau pompa aktual.

Contoh konsep tampilan dashboard untuk rancangan website Smart Garden IoT.

### Panduan desain

- Warna: hijau sebagai warna utama, putih atau abu-abu muda sebagai latar, biru untuk informasi air, dan oranye untuk suhu.
- Tipografi: gunakan Inter, Roboto, atau font sans-serif yang mudah dibaca.
- Navigasi: Dashboard, Monitoring Sensor, Kontrol Pompa, Jadwal, dan Riwayat.
- Responsif: kartu sensor tersusun dalam beberapa kolom pada komputer dan satu atau dua kolom pada smartphone.
- Visualisasi: gunakan grafik garis untuk riwayat sensor dan indikator warna untuk status tanah.
- Aksesibilitas: jangan mengandalkan warna saja; sertakan teks seperti “Tanah Kering”, “Pompa Menyala”, atau “Perangkat Offline”.

## 4. Apa teknologi dan batasan yang digunakan?

Berikut teknologi yang direkomendasikan untuk membangun sistem.

| Bagian         | Teknologi                                 | Fungsi                                        |
| -------------- | ----------------------------------------- | --------------------------------------------- |
| Frontend       | HTML, CSS, JavaScript                     | Struktur, desain, dan interaksi dashboard     |
| Grafik         | Chart.js                                  | Grafik sensor dari waktu ke waktu             |
| Mikrokontroler | ESP32                                     | Membaca sensor dan mengendalikan pompa        |
| Sensor tanah   | Soil moisture sensor                      | Mengukur kelembapan tanah                     |
| Sensor udara   | DHT22 atau sensor sejenis                 | Mengukur suhu dan kelembapan udara            |
| Komunikasi     | MQTT                                      | Mengirim data dan perintah                    |
| Koneksi web    | MQTT over WebSocket                       | Menghubungkan dashboard browser dengan broker |
| Broker         | Mosquitto atau broker MQTT terkelola      | Meneruskan pesan antara perangkat dan website |
| Penyimpanan    | SQLite, MySQL, atau PostgreSQL (opsional) | Menyimpan riwayat sensor dan aktivitas        |

### Batasan dan ketentuan teknis

1. Koneksi internet: kontrol jarak jauh membutuhkan koneksi jaringan yang berfungsi. Jika internet terputus, otomatisasi sebaiknya tetap berjalan di ESP32.
2. Akurasi sensor: sensor kelembapan tanah harus dikalibrasi berdasarkan kondisi tanah yang digunakan.
3. Keamanan: gunakan autentikasi broker, TLS jika tersedia, dan batasi hak publikasi serta langganan topik MQTT.
4. Catu daya: pompa tidak boleh disuplai langsung dari GPIO ESP32. Gunakan relay atau MOSFET yang sesuai, catu daya pompa terpisah, dan proteksi listrik yang memadai.
5. Waktu: perangkat harus memakai waktu yang akurat, misalnya melalui NTP, dengan zona waktu WIB (`Asia/Jakarta`) jika lokasi sistem berada di WIB.
6. Keandalan: tambahkan batas waktu maksimum pompa menyala, penanganan sensor gagal, dan mekanisme pemulihan setelah perangkat restart.
7. Batas sensor: sensor suhu dan kelembapan udara mengukur kondisi lingkungan, bukan secara langsung menentukan kebutuhan air tanaman. Logika pompa utama mengikuti ambang kelembapan tanah sesuai kebutuhan proyek.

## 5. Bagaimana sistem MQTT dan kontrol pompa bekerja?

Arsitektur komunikasi yang disarankan adalah sebagai berikut.

Sensor dan ESP32

Membaca kelembapan tanah, suhu, dan kelembapan udara; menjalankan logika pompa

MQTT Broker

Meneruskan data sensor, status pompa, dan perintah kontrol

Website Smart Garden

Menampilkan data realtime, jadwal, grafik, dan kontrol manual

### Alur komunikasi

1. ESP32 membaca sensor secara berkala.
2. ESP32 mengirim data ke broker MQTT melalui topik, misalnya `smartgarden/sensor`.
3. Website berlangganan pada topik sensor melalui MQTT over WebSocket.
4. Dashboard memperbarui angka, indikator, dan grafik ketika pesan baru diterima.
5. Ketika pengguna menekan tombol kontrol manual, website menerbitkan perintah ke topik `smartgarden/pump/command`.
6. ESP32 menerima perintah, memeriksa mode operasi dan aturan keselamatan, lalu mengendalikan relay pompa.
7. ESP32 mengirim status aktual pompa ke `smartgarden/pump/status`, sehingga website menampilkan status yang dikonfirmasi perangkat.

### Contoh format pesan MQTT

Data sensor:

```
{
  "soil_moisture": 24,
  "temperature": 29.4,
  "air_humidity": 68,
  "timestamp": "2026-10-16T07:00:00+07:00"
}
```

Perintah pompa:

```
{
  "command": "ON",
  "mode": "MANUAL"
}
```

Status pompa:

```
{
  "pump": "ON",
  "mode": "AUTO",
  "reason": "SOIL_BELOW_30"
}
```

### Logika otomatisasi pompa

```
Jika mode AUTO:
    Jika kelembapan tanah < 30%:
        Pompa ON

    Jika kelembapan tanah >= 60%:
        Pompa OFF

    Jika kelembapan tanah 30% sampai < 60%:
        Pertahankan status pompa sebelumnya

    Pada pukul 07.00 dan 17.00:
        Jalankan jadwal penyiraman
        Hentikan ketika target tercapai
        atau batas waktu maksimum terlampaui

Jika mode MANUAL:
    Ikuti perintah ON/OFF dari website
    Tetap terapkan proteksi keselamatan
```

Penting: jadwal dan logika otomatis harus berjalan pada ESP32, bukan hanya JavaScript di browser. Dengan demikian, sistem tetap berfungsi ketika website ditutup. Jika jadwal dimaksudkan sebagai penyiraman tambahan terpisah dari logika kelembapan, prioritas antara jadwal dan kontrol kelembapan harus ditentukan secara eksplisit.

## 6. Bagaimana struktur file proyek?

Untuk proyek awal berbasis HTML, CSS, JavaScript, dan ESP32, struktur berikut mudah dipelihara dan dikembangkan.

```
smart-garden/
│
├── index.html
├── README.md
│
├── assets/
│   └── images/
│
├── css/
│   ├── style.css
│   ├── dashboard.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── mqtt-client.js
│   ├── sensor.js
│   ├── pump-control.js
│   ├── schedule.js
│   └── charts.js
│
├── config/
│   └── app-config.js
│
├── firmware/
│   └── smart-garden-esp32/
│       ├── smart-garden-esp32.ino
│       └── secrets.example.h
│
└── broker/
    └── mosquitto.conf
```

### Fungsi file utama

| File                     | Tanggung jawab                                                       |
| ------------------------ | -------------------------------------------------------------------- |
| `index.html`             | Kerangka dashboard dan elemen antarmuka                              |
| `style.css`              | Warna, tipografi, kartu, dan tata letak umum                         |
| `responsive.css`         | Penyesuaian tampilan untuk smartphone dan komputer                   |
| `app.js`                 | Inisialisasi dashboard dan integrasi antarmodul                      |
| `mqtt-client.js`         | Koneksi broker, subscribe, publish, dan penanganan koneksi ulang     |
| `sensor.js`              | Memproses dan menampilkan data sensor                                |
| `pump-control.js`        | Mengatur tombol ON/OFF dan mode kontrol                              |
| `schedule.js`            | Menampilkan jadwal dan status pelaksanaan penyiraman                 |
| `charts.js`              | Mengelola grafik riwayat sensor                                      |
| `app-config.js`          | Konfigurasi topik dan alamat broker tanpa menyimpan rahasia sensitif |
| `smart-garden-esp32.ino` | Program pembacaan sensor, jadwal, dan kendali pompa                  |
| `mosquitto.conf`         | Konfigurasi broker, listener, autentikasi, dan keamanan              |

Untuk versi produksi, riwayat sensor memerlukan penyimpanan data dan biasanya backend tambahan. Jangan menaruh kata sandi broker atau kredensial administrator di JavaScript frontend yang dapat dilihat pengguna.

## 7. Apa kriteria keberhasilan website?

Website dinyatakan berhasil jika memenuhi kriteria fungsional, komunikasi, keamanan, dan keandalan berikut.

| No. | Kriteria pengujian | Target keberhasilan                                                                                          |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | Monitoring sensor  | Nilai tanah, suhu, dan kelembapan udara tampil sesuai data perangkat                                         |
| 2   | Pembaruan realtime | Data tampil tanpa perlu memuat ulang halaman; target awal pembaruan kurang dari 3 detik pada jaringan normal |
| 3   | Pompa otomatis ON  | Pompa menyala saat kelembapan tanah kurang dari 30%                                                          |
| 4   | Pompa otomatis OFF | Pompa mati saat kelembapan tanah mencapai atau melebihi 60%                                                  |
| 5   | Histeresis         | Status pompa tetap stabil pada rentang 30% hingga kurang dari 60%                                            |
| 6   | Jadwal pagi        | Penyiraman dijalankan pada pukul 07.00 sesuai aturan yang ditetapkan                                         |
| 7   | Jadwal sore        | Penyiraman dijalankan pada pukul 17.00 sesuai aturan yang ditetapkan                                         |
| 8   | Kontrol manual     | Perintah ON/OFF diproses dan status aktual dikonfirmasi ESP32                                                |
| 9   | Ketahanan koneksi  | Sistem dapat mendeteksi koneksi terputus dan mencoba menyambung kembali                                      |
| 10  | Keamanan pompa     | Terdapat batas waktu operasi dan penanganan kegagalan sensor                                                 |
| 11  | Responsivitas      | Dashboard berfungsi pada komputer dan smartphone                                                             |
| 12  | Keamanan MQTT      | Broker membatasi akses dan tidak mengizinkan kontrol pompa tanpa otorisasi                                   |

### Kesimpulan

Website Smart Garden IoT yang direkomendasikan memiliki tiga komponen inti: dashboard monitoring realtime, pengendalian pompa otomatis dan manual, serta komunikasi MQTT antara ESP32 dan website. Ambang kelembapan tanah 30% dan 60% menjadi dasar kontrol otomatis, sementara jadwal pukul 07.00 dan 17.00 menjadi waktu penyiraman terjadwal.

Agar sistem benar-benar andal, logika kendali dan jadwal harus berada di ESP32, dashboard harus menampilkan status pompa aktual, dan sistem perlu dilengkapi pengaman pompa serta penanganan koneksi terputus.# Rancangan Website Smart Garden IoT untuk Penyiraman Tanaman

Website Smart Garden IoT dirancang sebagai sistem pemantauan dan pengendalian penyiraman tanaman berbasis Internet of Things (IoT). Website memungkinkan pengguna memantau kelembapan tanah, suhu udara, dan kelembapan udara secara realtime, serta mengontrol pompa air secara otomatis berdasarkan kondisi tanah, jadwal penyiraman, maupun perintah manual.

## 1. Apa tujuan website Smart Garden IoT?

Tujuan utama website Smart Garden IoT adalah membangun sistem penyiraman tanaman yang cerdas, otomatis, efisien, dan dapat dikendalikan dari jarak jauh melalui browser pada komputer atau smartphone.

Tujuan khususnya meliputi:

1. Memantau kelembapan tanah secara realtime untuk mengetahui kondisi tanah dan kebutuhan air tanaman.
2. Memantau suhu dan kelembapan udara sebagai informasi kondisi lingkungan tanaman.
3. Mengaktifkan pompa air secara otomatis ketika kelembapan tanah kurang dari 30% dan menghentikannya ketika kelembapan tanah mencapai atau melebihi 60%.
4. Menjadwalkan penyiraman otomatis dua kali sehari, yaitu pukul 07.00 dan 17.00.
5. Menyediakan kontrol manual agar pengguna dapat menyalakan atau mematikan pompa melalui website.
6. Menampilkan status pompa, mode operasi, jadwal penyiraman, dan riwayat perubahan sensor.
7. Menghemat penggunaan air dan mengurangi kebutuhan penyiraman secara manual.

## 2. Apa fitur utama dashboard?

Dashboard dibagi menjadi beberapa fitur utama berikut.

[FarmiQ – Smart Greenhouse IoT System by Mohaiminul Islam on Dribbble](https://images.openai.com/static-rsc-4/ixACHl7HKfISc8-JPDyzmO08-1zYrr5J1vpukV60dGKwzAIxe064aFSU0jvTaEtIP1ArOlx5zQLkKpVXBVCuE_jzBTnGSH11UVsbvMDF1TCZxx_q2XU-L2IEKkaikw4qkHQddjGDIFGd2g5tdxSsSPGFxyg3XAJokQ5k_DTOVcc?purpose=inline)

1\. Monitoring sensor realtime

Menampilkan tiga parameter utama:

- Kelembapan tanah (%).
- Suhu udara (°C).
- Kelembapan udara (%).

Data diperbarui secara otomatis setiap kali perangkat IoT mengirimkan data baru.

[Farm Automation System using Robo ESP32!](https://images.openai.com/static-rsc-4/-SpA7Kj9TJsokLijJbAs1MrRAc3-MFx8BdQol0KXoHVftTi0W5NH5ZBCt1j-5YEoYhK-S5Gxt2wX08X23lwW6kWbzoEGpghO93smhOhmG7b0SEOIkoTjND9QWVthKp3Lqb0BGoBKVmo1k5nVLcvM1LxluhSFjooO_KuthCKyvbw?purpose=inline)

2\. Kontrol pompa air

- Tombol ON dan OFF untuk kontrol manual.
- Mode Otomatis dan Manual.
- Indikator status pompa menyala atau mati.
- Indikator status koneksi perangkat IoT.

Perintah kontrol dikirim melalui MQTT WebSocket.

[Smart Garden Control Dashboard Template](https://images.openai.com/static-rsc-4/dFkNaikUkozSCPhex-8-SoRMoe07_MqPTiSa8d_1YKT_f__3KrsTUByXbMcVEsiPxq2eKyF8MItDZk5xB_H5-0vLKu3CHL63nfAC5z_uLhHtI7LDQlmMTGVmcePmn22RyxDfIPWl8r3B-xx28dd9p2VpCNYd5IJXdYk47EIxaks?purpose=inline)

3\. Jadwal penyiraman

- Penyiraman pagi pukul 07.00.
- Penyiraman sore pukul 17.00.
- Menampilkan jadwal berikutnya.
- Indikator jadwal sudah dijalankan atau belum.

Jadwal harus dijalankan oleh perangkat IoT atau pengendali yang tetap aktif meskipun website ditutup.

[AGRISENSE | Devpost](https://images.openai.com/static-rsc-4/nmGG5j1EaxvePQYW0zg8JBzStNjDNG9ge05jHIBsa5jkmquN-X_z0RE4XiZKjsc0_F0vi0UMiaVCB1tl1YpzJhfi3w5cVEtUsdlw0F3B-vtR1kcpJQl34RMZgff_jdJ4spZfKiXT8pRUIqTwZUeGCPoYJN4dabsGnxD1epixB2g?purpose=inline)

4\. Grafik dan riwayat sensor

Menampilkan grafik perubahan kelembapan tanah, suhu, dan kelembapan udara berdasarkan waktu, sehingga pengguna dapat mengevaluasi kondisi tanaman.

[Agritech Analytics & Monitoring Dashboard by Fahema Yesmin on Dribbble](https://images.openai.com/static-rsc-4/if3V9nPWz1weuSn8BacPV0D7jOxDIIOXJ6cgu86QLaM9BIykxF4F6Nn_FH-RY-w9cyJFERTjhPPtZr1fOB-VI7aASOkcg5q6Ge0ykCUDMp4AWEQa-_Ngs8ruAopMKvrx9loKrbLl_3jqT2FFzpx6kUjVvb5Gl-GEtrmYmwd6GSg?purpose=inline)

5\. Status sistem dan notifikasi

- Status perangkat online/offline.
- Waktu pembaruan data terakhir.
- Status pompa dan mode operasi.
- Peringatan ketika sensor atau koneksi terputus.

### Aturan otomatisasi pompa

| Kondisi                                       | Tindakan sistem                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| Kelembapan tanah kurang dari 30%              | Pompa ON                                                                 |
| Kelembapan tanah mencapai atau lebih dari 60% | Pompa OFF                                                                |
| Kelembapan tanah 30–kurang dari 60%           | Pertahankan status pompa sebelumnya                                      |
| Pukul 07.00                                   | Jalankan penyiraman pagi jika belum dijalankan                           |
| Pukul 17.00                                   | Jalankan penyiraman sore jika belum dijalankan                           |
| Pengguna memilih mode Manual                  | Pompa mengikuti perintah manual, dengan proteksi keselamatan tetap aktif |

Catatan penting: Batas 30% dan 60% membentuk histeresis agar pompa tidak sering hidup-mati ketika nilai sensor berada dekat ambang batas. Untuk jadwal pukul 07.00 dan 17.00, durasi penyiraman atau kondisi penghentian perlu ditentukan. Rekomendasi awal adalah pompa berhenti ketika kelembapan mencapai 60%, disertai batas waktu maksimum sebagai pengaman.

## 3. Bagaimana desain tampilan website?

Desain yang direkomendasikan adalah dashboard modern, responsif, sederhana, dan bernuansa alam. Informasi terpenting harus terlihat tanpa pengguna perlu membuka banyak halaman.

## Smart Garden

IoT Plant Monitoring & Irrigation

Online

MONITORING REALTIME

Kelembapan tanah

# 24%

Tanah kering

Suhu udara

# 29.4°C

Data sensor

Kelembapan udara

# 68%

Data sensor

Penyiraman berikutnya

# 17.00

Jadwal sore

Kontrol Pompa

Pompa ON

Mode operasi

Otomatis

Pompa menyala karena kelembapan tanah di bawah 30%.

Pompa ON

Pompa OFF

Ilustrasi antarmuka, bukan status sensor atau pompa aktual.

Contoh konsep tampilan dashboard untuk rancangan website Smart Garden IoT.

### Panduan desain

- Warna: hijau sebagai warna utama, putih atau abu-abu muda sebagai latar, biru untuk informasi air, dan oranye untuk suhu.
- Tipografi: gunakan Inter, Roboto, atau font sans-serif yang mudah dibaca.
- Navigasi: Dashboard, Monitoring Sensor, Kontrol Pompa, Jadwal, dan Riwayat.
- Responsif: kartu sensor tersusun dalam beberapa kolom pada komputer dan satu atau dua kolom pada smartphone.
- Visualisasi: gunakan grafik garis untuk riwayat sensor dan indikator warna untuk status tanah.
- Aksesibilitas: jangan mengandalkan warna saja; sertakan teks seperti “Tanah Kering”, “Pompa Menyala”, atau “Perangkat Offline”.

## 4. Apa teknologi dan batasan yang digunakan?

Berikut teknologi yang direkomendasikan untuk membangun sistem.

| Bagian         | Teknologi                                 | Fungsi                                        |
| -------------- | ----------------------------------------- | --------------------------------------------- |
| Frontend       | HTML, CSS, JavaScript                     | Struktur, desain, dan interaksi dashboard     |
| Grafik         | Chart.js                                  | Grafik sensor dari waktu ke waktu             |
| Mikrokontroler | ESP32                                     | Membaca sensor dan mengendalikan pompa        |
| Sensor tanah   | Soil moisture sensor                      | Mengukur kelembapan tanah                     |
| Sensor udara   | DHT22 atau sensor sejenis                 | Mengukur suhu dan kelembapan udara            |
| Komunikasi     | MQTT                                      | Mengirim data dan perintah                    |
| Koneksi web    | MQTT over WebSocket                       | Menghubungkan dashboard browser dengan broker |
| Broker         | Mosquitto atau broker MQTT terkelola      | Meneruskan pesan antara perangkat dan website |
| Penyimpanan    | SQLite, MySQL, atau PostgreSQL (opsional) | Menyimpan riwayat sensor dan aktivitas        |

### Batasan dan ketentuan teknis

1. Koneksi internet: kontrol jarak jauh membutuhkan koneksi jaringan yang berfungsi. Jika internet terputus, otomatisasi sebaiknya tetap berjalan di ESP32.
2. Akurasi sensor: sensor kelembapan tanah harus dikalibrasi berdasarkan kondisi tanah yang digunakan.
3. Keamanan: gunakan autentikasi broker, TLS jika tersedia, dan batasi hak publikasi serta langganan topik MQTT.
4. Catu daya: pompa tidak boleh disuplai langsung dari GPIO ESP32. Gunakan relay atau MOSFET yang sesuai, catu daya pompa terpisah, dan proteksi listrik yang memadai.
5. Waktu: perangkat harus memakai waktu yang akurat, misalnya melalui NTP, dengan zona waktu WIB (`Asia/Jakarta`) jika lokasi sistem berada di WIB.
6. Keandalan: tambahkan batas waktu maksimum pompa menyala, penanganan sensor gagal, dan mekanisme pemulihan setelah perangkat restart.
7. Batas sensor: sensor suhu dan kelembapan udara mengukur kondisi lingkungan, bukan secara langsung menentukan kebutuhan air tanaman. Logika pompa utama mengikuti ambang kelembapan tanah sesuai kebutuhan proyek.

## 5. Bagaimana sistem MQTT dan kontrol pompa bekerja?

Arsitektur komunikasi yang disarankan adalah sebagai berikut.

Sensor dan ESP32

Membaca kelembapan tanah, suhu, dan kelembapan udara; menjalankan logika pompa

MQTT Broker

Meneruskan data sensor, status pompa, dan perintah kontrol

Website Smart Garden

Menampilkan data realtime, jadwal, grafik, dan kontrol manual

### Alur komunikasi

1. ESP32 membaca sensor secara berkala.
2. ESP32 mengirim data ke broker MQTT melalui topik, misalnya `smartgarden/sensor`.
3. Website berlangganan pada topik sensor melalui MQTT over WebSocket.
4. Dashboard memperbarui angka, indikator, dan grafik ketika pesan baru diterima.
5. Ketika pengguna menekan tombol kontrol manual, website menerbitkan perintah ke topik `smartgarden/pump/command`.
6. ESP32 menerima perintah, memeriksa mode operasi dan aturan keselamatan, lalu mengendalikan relay pompa.
7. ESP32 mengirim status aktual pompa ke `smartgarden/pump/status`, sehingga website menampilkan status yang dikonfirmasi perangkat.

### Contoh format pesan MQTT

Data sensor:

```
{
  "soil_moisture": 24,
  "temperature": 29.4,
  "air_humidity": 68,
  "timestamp": "2026-10-16T07:00:00+07:00"
}
```

Perintah pompa:

```
{
  "command": "ON",
  "mode": "MANUAL"
}
```

Status pompa:

```
{
  "pump": "ON",
  "mode": "AUTO",
  "reason": "SOIL_BELOW_30"
}
```

### Logika otomatisasi pompa

```
Jika mode AUTO:
    Jika kelembapan tanah < 30%:
        Pompa ON

    Jika kelembapan tanah >= 60%:
        Pompa OFF

    Jika kelembapan tanah 30% sampai < 60%:
        Pertahankan status pompa sebelumnya

    Pada pukul 07.00 dan 17.00:
        Jalankan jadwal penyiraman
        Hentikan ketika target tercapai
        atau batas waktu maksimum terlampaui

Jika mode MANUAL:
    Ikuti perintah ON/OFF dari website
    Tetap terapkan proteksi keselamatan
```

Penting: jadwal dan logika otomatis harus berjalan pada ESP32, bukan hanya JavaScript di browser. Dengan demikian, sistem tetap berfungsi ketika website ditutup. Jika jadwal dimaksudkan sebagai penyiraman tambahan terpisah dari logika kelembapan, prioritas antara jadwal dan kontrol kelembapan harus ditentukan secara eksplisit.

## 6. Bagaimana struktur file proyek?

Untuk proyek awal berbasis HTML, CSS, JavaScript, dan ESP32, struktur berikut mudah dipelihara dan dikembangkan.

```
smart-garden/
│
├── index.html
├── README.md
│
├── assets/
│   └── images/
│
├── css/
│   ├── style.css
│   ├── dashboard.css
│   └── responsive.css
│
├── js/
│   ├── app.js
│   ├── mqtt-client.js
│   ├── sensor.js
│   ├── pump-control.js
│   ├── schedule.js
│   └── charts.js
│
├── config/
│   └── app-config.js
│
├── firmware/
│   └── smart-garden-esp32/
│       ├── smart-garden-esp32.ino
│       └── secrets.example.h
│
└── broker/
    └── mosquitto.conf
```

### Fungsi file utama

| File                     | Tanggung jawab                                                       |
| ------------------------ | -------------------------------------------------------------------- |
| `index.html`             | Kerangka dashboard dan elemen antarmuka                              |
| `style.css`              | Warna, tipografi, kartu, dan tata letak umum                         |
| `responsive.css`         | Penyesuaian tampilan untuk smartphone dan komputer                   |
| `app.js`                 | Inisialisasi dashboard dan integrasi antarmodul                      |
| `mqtt-client.js`         | Koneksi broker, subscribe, publish, dan penanganan koneksi ulang     |
| `sensor.js`              | Memproses dan menampilkan data sensor                                |
| `pump-control.js`        | Mengatur tombol ON/OFF dan mode kontrol                              |
| `schedule.js`            | Menampilkan jadwal dan status pelaksanaan penyiraman                 |
| `charts.js`              | Mengelola grafik riwayat sensor                                      |
| `app-config.js`          | Konfigurasi topik dan alamat broker tanpa menyimpan rahasia sensitif |
| `smart-garden-esp32.ino` | Program pembacaan sensor, jadwal, dan kendali pompa                  |
| `mosquitto.conf`         | Konfigurasi broker, listener, autentikasi, dan keamanan              |

Untuk versi produksi, riwayat sensor memerlukan penyimpanan data dan biasanya backend tambahan. Jangan menaruh kata sandi broker atau kredensial administrator di JavaScript frontend yang dapat dilihat pengguna.

## 7. Apa kriteria keberhasilan website?

Website dinyatakan berhasil jika memenuhi kriteria fungsional, komunikasi, keamanan, dan keandalan berikut.

| No. | Kriteria pengujian | Target keberhasilan                                                                                          |
| --- | ------------------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | Monitoring sensor  | Nilai tanah, suhu, dan kelembapan udara tampil sesuai data perangkat                                         |
| 2   | Pembaruan realtime | Data tampil tanpa perlu memuat ulang halaman; target awal pembaruan kurang dari 3 detik pada jaringan normal |
| 3   | Pompa otomatis ON  | Pompa menyala saat kelembapan tanah kurang dari 30%                                                          |
| 4   | Pompa otomatis OFF | Pompa mati saat kelembapan tanah mencapai atau melebihi 60%                                                  |
| 5   | Histeresis         | Status pompa tetap stabil pada rentang 30% hingga kurang dari 60%                                            |
| 6   | Jadwal pagi        | Penyiraman dijalankan pada pukul 07.00 sesuai aturan yang ditetapkan                                         |
| 7   | Jadwal sore        | Penyiraman dijalankan pada pukul 17.00 sesuai aturan yang ditetapkan                                         |
| 8   | Kontrol manual     | Perintah ON/OFF diproses dan status aktual dikonfirmasi ESP32                                                |
| 9   | Ketahanan koneksi  | Sistem dapat mendeteksi koneksi terputus dan mencoba menyambung kembali                                      |
| 10  | Keamanan pompa     | Terdapat batas waktu operasi dan penanganan kegagalan sensor                                                 |
| 11  | Responsivitas      | Dashboard berfungsi pada komputer dan smartphone                                                             |
| 12  | Keamanan MQTT      | Broker membatasi akses dan tidak mengizinkan kontrol pompa tanpa otorisasi                                   |

### Kesimpulan

Website Smart Garden IoT yang direkomendasikan memiliki tiga komponen inti: dashboard monitoring realtime, pengendalian pompa otomatis dan manual, serta komunikasi MQTT antara ESP32 dan website. Ambang kelembapan tanah 30% dan 60% menjadi dasar kontrol otomatis, sementara jadwal pukul 07.00 dan 17.00 menjadi waktu penyiraman terjadwal.

Agar sistem benar-benar andal, logika kendali dan jadwal harus berada di ESP32, dashboard harus menampilkan status pompa aktual, dan sistem perlu dilengkapi pengaman pompa serta penanganan koneksi terputus.