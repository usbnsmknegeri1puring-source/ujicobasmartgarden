/**
 * SMART GARDEN IoT - HISTORICAL CHARTS (charts.js)
 * Visualisasi grafik riwayat perubahan kelembapan tanah, suhu,
 * dan kelembapan udara berbasis waktu menggunakan Chart.js
 * Sesuai Bagian 2, 3, dan 4 ujicoba.md
 */

class ChartManager {
  constructor(canvasId, config) {
    this.canvasId = canvasId || "sensorHistoryChart";
    this.config = config || window.APP_CONFIG;
    this.chart = null;
    this.maxDataPoints = 20; // Default realtime points
    this.activeFilter = "all"; // 'all', 'soil', 'temp', 'humidity'

    this.historyData = {
      labels: [],
      soil: [],
      temp: [],
      humidity: []
    };

    // Inisialisasi awal beberapa poin data simulasi historis agar grafik langsung hidup
    this.seedInitialData();
    this.initChart();
  }

  seedInitialData() {
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now - i * 5000);
      const timeLabel = t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      this.historyData.labels.push(timeLabel);
      this.historyData.soil.push(Math.round((24 + Math.sin(i * 0.5) * 4) * 10) / 10);
      this.historyData.temp.push(Math.round((29.4 + (Math.random() - 0.5) * 0.5) * 10) / 10);
      this.historyData.humidity.push(Math.round(68 + (Math.random() - 0.5) * 2));
    }
  }

  initChart() {
    const ctx = document.getElementById(this.canvasId);
    if (!ctx || typeof Chart === "undefined") {
      console.warn("Chart.js belum siap atau elemen canvas tidak ditemukan.");
      return;
    }

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDark ? "#94a3b8" : "#64748b";

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.historyData.labels,
        datasets: [
          {
            label: 'Kelembapan Tanah (%)',
            data: this.historyData.soil,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'y'
          },
          {
            label: 'Suhu Udara (°C)',
            data: this.historyData.temp,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.08)',
            borderWidth: 2,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'y1'
          },
          {
            label: 'Kelembapan Udara (%)',
            data: this.historyData.humidity,
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.08)',
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter', size: 12 },
              color: textColor
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: 'Inter', size: 12 },
            bodyFont: { family: 'Inter', size: 12 }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 11 }, maxTicksLimit: 8 }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: 100,
            title: { display: true, text: 'Kelembapan (%)', color: textColor, font: { size: 11 } },
            grid: { color: gridColor },
            ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            min: 15,
            max: 45,
            title: { display: true, text: 'Suhu (°C)', color: '#f97316', font: { size: 11 } },
            grid: { drawOnChartArea: false },
            ticks: { color: '#f97316', font: { family: 'Inter', size: 11 } }
          }
        }
      }
    });
  }

  /**
   * Menambahkan data baru dari pembacaan sensor realtime
   */
  addDataPoint(data) {
    if (!this.chart) {
      this.initChart();
      if (!this.chart) return;
    }

    const t = new Date(data.timestamp || Date.now());
    const timeLabel = t.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    this.historyData.labels.push(timeLabel);
    this.historyData.soil.push(Number(data.soil_moisture));
    this.historyData.temp.push(Number(data.temperature));
    this.historyData.humidity.push(Number(data.air_humidity));

    if (this.historyData.labels.length > this.maxDataPoints) {
      this.historyData.labels.shift();
      this.historyData.soil.shift();
      this.historyData.temp.shift();
      this.historyData.humidity.shift();
    }

    this.chart.update('none'); // Update halus tanpa redraw animasi penuh
  }

  /**
   * Memfilter metrik yang ditampilkan (Semua / Tanah / Suhu / Udara)
   */
  filterMetric(type) {
    if (!this.chart) return;
    this.activeFilter = type;

    // Dataset 0: Tanah, 1: Suhu, 2: Kelembapan Udara
    if (type === 'all') {
      this.chart.setDatasetVisibility(0, true);
      this.chart.setDatasetVisibility(1, true);
      this.chart.setDatasetVisibility(2, true);
    } else if (type === 'soil') {
      this.chart.setDatasetVisibility(0, true);
      this.chart.setDatasetVisibility(1, false);
      this.chart.setDatasetVisibility(2, false);
    } else if (type === 'temp') {
      this.chart.setDatasetVisibility(0, false);
      this.chart.setDatasetVisibility(1, true);
      this.chart.setDatasetVisibility(2, false);
    } else if (type === 'humidity') {
      this.chart.setDatasetVisibility(0, false);
      this.chart.setDatasetVisibility(1, false);
      this.chart.setDatasetVisibility(2, true);
    }

    this.chart.update();
  }

  /**
   * Perbarui warna chart saat tema beralih (Light / Dark)
   */
  updateThemeColors(isDark) {
    if (!this.chart) return;

    const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
    const textColor = isDark ? "#94a3b8" : "#64748b";

    this.chart.options.scales.x.grid.color = gridColor;
    this.chart.options.scales.x.ticks.color = textColor;
    this.chart.options.scales.y.grid.color = gridColor;
    this.chart.options.scales.y.ticks.color = textColor;
    this.chart.options.scales.y.title.color = textColor;
    this.chart.options.plugins.legend.labels.color = textColor;

    this.chart.update();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ChartManager;
} else if (typeof window !== "undefined") {
  window.ChartManager = ChartManager;
}
