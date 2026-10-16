/**
 * SMART GARDEN IoT - MAIN APPLICATION CONTROLLER (app.js)
 * Mengintegrasikan seluruh modul: Sensor, Pompa, Jadwal, Grafik,
 * MQTT Client, Navigasi, dan Log Aktivitas Sistem.
 * Sesuai Bagian 2, 3, 5, 6, dan 7 ujicoba.md
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Inisialisasi Smart Garden IoT Dashboard...");

  // 1. Inisialisasi Tema (Dark / Light Mode)
  initTheme();

  // 2. Inisialisasi Modul Utama
  const mqttClient = new SmartGardenMQTT(APP_CONFIG);
  const sensorMgr = new SensorManager(APP_CONFIG);
  const pumpMgr = new PumpControlManager(mqttClient, APP_CONFIG);
  const scheduleMgr = new ScheduleManager(APP_CONFIG);
  const chartMgr = new ChartManager("sensorHistoryChart", APP_CONFIG);

  // Expose global untuk debugging & kontrol UI langsung
  window.SmartGardenApp = {
    mqtt: mqttClient,
    sensor: sensorMgr,
    pump: pumpMgr,
    schedule: scheduleMgr,
    chart: chartMgr
  };

  // 3. Menghubungkan Alur Data (Event Wiring)

  // Ketika MQTT menerima pesan
  mqttClient.on('message', (packet) => {
    const { topic, data } = packet;

    if (topic === APP_CONFIG.mqtt.topics.sensor) {
      sensorMgr.processReading(data);
      chartMgr.addDataPoint(data);
      updateLastSyncTime();
    } else if (topic === APP_CONFIG.mqtt.topics.pumpStatus) {
      pumpMgr.receiveConfirmedStatus(data);
      addActivityLog("Pompa", `Status pompa: ${data.pump} (${pumpMgr.getReadableReason(data.reason)})`, data.pump === "ON" ? "optimal" : "neutral");
    } else if (topic === APP_CONFIG.mqtt.topics.systemStatus) {
      addActivityLog("Sistem", `Pesan sistem: ${JSON.stringify(data)}`, "neutral");
    }
  });

  // Ketika status koneksi MQTT berubah
  mqttClient.on('statusChange', (statusData) => {
    updateConnectionStatusUI(statusData);
  });

  // Alert dari sensor watchdog jika tidak ada data
  sensorMgr.onAlert((alert) => {
    showToast(alert.message, alert.type);
    showSystemBanner(alert.message);
  });

  // 4. Inisialisasi Log Aktivitas Awal
  initActivityLogs();

  // 5. Inisialisasi Navigasi & UI Interaktif
  initNavigation();
  initSimulatorUI(mqttClient, sensorMgr, pumpMgr, scheduleMgr);
  initBrokerModal(mqttClient);

  // 6. Coba sambungkan ke broker MQTT over WebSocket
  mqttClient.connect();

  console.log("Smart Garden IoT siap digunakan.");
});

// =========================================================================
// PENGELOLA TEMA (LIGHT / DARK MODE)
// =========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem("sg_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButtonIcon(savedTheme);

  const themeBtn = document.getElementById("btn-theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("sg_theme", newTheme);
      updateThemeButtonIcon(newTheme);

      if (window.SmartGardenApp && window.SmartGardenApp.chart) {
        window.SmartGardenApp.chart.updateThemeColors(newTheme === "dark");
      }
    });
  }
}

function updateThemeButtonIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (icon) {
    // Gunakan ikon matahari untuk dark mode dan bulan untuk light mode
    icon.innerHTML = theme === "dark" 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
}

// =========================================================================
// STATUS KONEKSI & INDIKATOR HEADER (Bagian 2 & 3 ujicoba.md)
// =========================================================================
function updateConnectionStatusUI(statusData) {
  const pill = document.getElementById("device-status-pill");
  if (!pill) return;

  switch (statusData.status) {
    case "connected":
      pill.innerHTML = `<span class="status-dot online"></span> Perangkat Online`;
      pill.title = "Terhubung ke broker MQTT";
      hideSystemBanner();
      break;
    case "simulator":
      pill.innerHTML = `<span class="status-dot online" style="background:#0ea5e9;"></span> Simulator Aktif`;
      pill.title = "Mode Simulator Internal ESP32";
      hideSystemBanner();
      break;
    case "reconnecting":
      pill.innerHTML = `<span class="status-dot reconnecting"></span> Menghubungkan...`;
      pill.title = statusData.message;
      break;
    case "disconnected":
    case "error":
      pill.innerHTML = `<span class="status-dot offline"></span> Perangkat Offline`;
      pill.title = statusData.message;
      showSystemBanner("Koneksi perangkat IoT/broker terputus. Sistem mencoba menghubungkan kembali...");
      break;
  }
}

function updateLastSyncTime() {
  const el = document.getElementById("last-sync-badge");
  if (el) {
    const now = new Date();
    el.textContent = `Sinkron: ${now.toLocaleTimeString('id-ID')}`;
  }
}

function showSystemBanner(msg) {
  const banner = document.getElementById("system-alert-banner");
  const msgEl = document.getElementById("system-alert-message");
  if (banner && msgEl) {
    msgEl.textContent = msg;
    banner.style.display = "flex";
  }
}

function hideSystemBanner() {
  const banner = document.getElementById("system-alert-banner");
  if (banner) {
    banner.style.display = "none";
  }
}

// =========================================================================
// LOG AKTIVITAS & RIWAYAT (Bagian 2 ujicoba.md)
// =========================================================================
const activityLogs = [];

function initActivityLogs() {
  // Tambah entri awal
  addActivityLog("Sistem", "Website Smart Garden IoT berhasil dimuat.", "optimal");
  addActivityLog("Jadwal", "Jadwal penyiraman otomatis disetel pada 07.00 dan 17.00 WIB.", "neutral");
  addActivityLog("Sensor", "Inisialisasi pembacaan kelembapan tanah, suhu, dan kelembapan udara.", "optimal");

  // Tombol Filter Log
  const filterBtns = document.querySelectorAll(".log-filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderLogsTable(btn.getAttribute("data-category"));
    });
  });

  // Tombol Bersihkan Log
  const clearBtn = document.getElementById("btn-clear-logs");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      activityLogs.length = 0;
      renderLogsTable("all");
    });
  }

  // Tombol Ekspor CSV
  const exportBtn = document.getElementById("btn-export-logs");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportLogsToCSV);
  }
}

function addActivityLog(category, message, badgeClass = "neutral") {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  activityLogs.unshift({
    time: timeStr,
    timestamp: now.toISOString(),
    category,
    message,
    badgeClass
  });

  // Batasi maksimal 50 log terbaru
  if (activityLogs.length > 50) activityLogs.pop();

  const activeCategory = document.querySelector(".log-filter-btn.active")?.getAttribute("data-category") || "all";
  renderLogsTable(activeCategory);
}

function renderLogsTable(filterCategory = "all") {
  const tbody = document.getElementById("logs-table-body");
  if (!tbody) return;

  const filtered = filterCategory === "all" 
    ? activityLogs 
    : activityLogs.filter(l => l.category.toLowerCase() === filterCategory.toLowerCase());

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Belum ada riwayat aktivitas.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(log => `
    <tr>
      <td style="white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--text-muted); font-size: 0.775rem;">${log.time}</td>
      <td><span class="status-badge ${log.badgeClass}" style="font-size: 0.7rem;">${log.category}</span></td>
      <td style="font-size: 0.8rem;">${log.message}</td>
    </tr>
  `).join("");
}

function exportLogsToCSV() {
  if (activityLogs.length === 0) {
    showToast("Tidak ada data log untuk diekspor.", "warning");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Waktu,Kategori,Keterangan\n";
  activityLogs.forEach(l => {
    csvContent += `"${l.timestamp}","${l.category}","${l.message.replace(/"/g, '""')}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `smart_garden_log_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Riwayat aktivitas berhasil diekspor ke CSV.", "success");
}

// =========================================================================
// NAVIGASI & SMOOTH SCROLL (Bagian 3 ujicoba.md)
// =========================================================================
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const targetId = link.getAttribute("href")?.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Filter Chart Metrik
  const chartPills = document.querySelectorAll(".chart-pill");
  chartPills.forEach(pill => {
    pill.addEventListener("click", () => {
      chartPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const metric = pill.getAttribute("data-metric");
      if (window.SmartGardenApp && window.SmartGardenApp.chart) {
        window.SmartGardenApp.chart.filterMetric(metric);
      }
    });
  });
}

// =========================================================================
// IOT SIMULATOR KONTROL INTERAKTIF
// =========================================================================
function initSimulatorUI(mqtt, sensor, pump, schedule) {
  const sliderSoil = document.getElementById("sim-soil");
  const sliderTemp = document.getElementById("sim-temp");
  const sliderHum = document.getElementById("sim-hum");

  const valSoil = document.getElementById("sim-soil-val");
  const valTemp = document.getElementById("sim-temp-val");
  const valHum = document.getElementById("sim-hum-val");

  if (sliderSoil && valSoil) {
    sliderSoil.addEventListener("input", (e) => {
      valSoil.textContent = `${e.target.value}%`;
      mqtt.setSimSoilMoisture(e.target.value);
    });
  }

  if (sliderTemp && valTemp) {
    sliderTemp.addEventListener("input", (e) => {
      valTemp.textContent = `${e.target.value}°C`;
      mqtt.setSimTemperature(e.target.value);
    });
  }

  if (sliderHum && valHum) {
    sliderHum.addEventListener("input", (e) => {
      valHum.textContent = `${e.target.value}%`;
      mqtt.setSimAirHumidity(e.target.value);
    });
  }

  // Tombol Skenario Cepat
  document.getElementById("btn-sim-dry")?.addEventListener("click", () => {
    if (sliderSoil) sliderSoil.value = 24;
    if (valSoil) valSoil.textContent = "24%";
    mqtt.setSimSoilMoisture(24);
    showToast("Skenario: Tanah Kering (24%) disimulasikan -> Pompa Otomatis ON", "info");
  });

  document.getElementById("btn-sim-wet")?.addEventListener("click", () => {
    if (sliderSoil) sliderSoil.value = 65;
    if (valSoil) valSoil.textContent = "65%";
    mqtt.setSimSoilMoisture(65);
    showToast("Skenario: Target Kelembapan (65%) disimulasikan -> Pompa Otomatis OFF", "success");
  });

  document.getElementById("btn-sim-hysteresis")?.addEventListener("click", () => {
    if (sliderSoil) sliderSoil.value = 45;
    if (valSoil) valSoil.textContent = "45%";
    mqtt.setSimSoilMoisture(45);
    showToast("Skenario: Histeresis (45%) -> Status pompa dipertahankan stabil", "warning");
  });

  document.getElementById("btn-sim-morning")?.addEventListener("click", () => {
    schedule.triggerScheduleTest("morning");
    pump.receiveConfirmedStatus({ pump: "ON", mode: "AUTO", reason: "SCHEDULE_MORNING" });
    showToast("Skenario: Jadwal 07.00 Pagi dijalankan!", "info");
  });

  document.getElementById("btn-sim-disconnect")?.addEventListener("click", () => {
    mqtt.disconnect();
    showToast("Simulasi: Koneksi ke broker diputus.", "danger");
  });

  document.getElementById("btn-sim-reconnect")?.addEventListener("click", () => {
    mqtt.connect();
    showToast("Simulasi: Menyambung kembali ke broker...", "info");
  });
}

// =========================================================================
// MODAL PENGATURAN BROKER MQTT
// =========================================================================
function initBrokerModal(mqtt) {
  const modal = document.getElementById("broker-modal");
  const openBtn = document.getElementById("btn-open-broker-settings");
  const closeBtn = document.getElementById("btn-close-modal");
  const saveBtn = document.getElementById("btn-save-broker");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      modal.classList.add("active");
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  if (saveBtn && modal) {
    saveBtn.addEventListener("click", () => {
      const host = document.getElementById("input-broker-host")?.value.trim();
      const port = document.getElementById("input-broker-port")?.value.trim();
      const path = document.getElementById("input-broker-path")?.value.trim() || "/mqtt";
      const useSSL = document.getElementById("input-broker-ssl")?.checked ?? true;

      modal.classList.remove("active");
      showToast("Menyambung dengan konfigurasi broker baru...", "info");

      mqtt.connect({
        host: host || APP_CONFIG.mqtt.defaultHost,
        port: port || APP_CONFIG.mqtt.defaultPort,
        path: path,
        useSSL: useSSL
      });
    });
  }
}

// =========================================================================
// TOAST NOTIFIKASI
// =========================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="flex: 1;">${message}</div>
    <button style="background: none; border: none; cursor: pointer; color: inherit; font-size: 1.1rem;" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
