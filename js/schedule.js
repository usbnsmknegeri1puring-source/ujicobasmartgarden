/**
 * SMART GARDEN IoT - IRRIGATION SCHEDULE MANAGER (schedule.js)
 * Menampilkan jadwal pagi (07.00) dan sore (17.00),
 * jadwal berikutnya, hitung mundur realtime, dan status pelaksanaan
 * sesuai Bagian 2, 3, dan 7 ujicoba.md
 */

class ScheduleManager {
  constructor(config) {
    this.config = config || window.APP_CONFIG;

    this.schedules = {
      morning: {
        time: "07:00",
        hour: 7,
        minute: 0,
        label: "Penyiraman Pagi",
        executed: false,
        running: false,
        lastRunTime: null
      },
      evening: {
        time: "17:00",
        hour: 17,
        minute: 0,
        label: "Penyiraman Sore",
        executed: false,
        running: false,
        lastRunTime: null
      }
    };

    this.countdownTimer = null;
    this.startScheduleWatcher();
  }

  /**
   * Menghitung jadwal berikutnya berdasarkan waktu saat ini (WIB)
   */
  getNextSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const morningTotal = 7 * 60;   // 07:00 = 420 menit
    const eveningTotal = 17 * 60;  // 17:00 = 1020 menit

    if (currentTotalMinutes < morningTotal) {
      // Jadwal berikutnya adalah Pagi ini (07:00)
      const diffMinutes = morningTotal - currentTotalMinutes;
      return {
        id: "morning",
        time: "07.00",
        typeText: "Jadwal pagi",
        remainingMinutes: diffMinutes,
        isToday: true
      };
    } else if (currentTotalMinutes < eveningTotal) {
      // Jadwal berikutnya adalah Sore ini (17:00)
      const diffMinutes = eveningTotal - currentTotalMinutes;
      return {
        id: "evening",
        time: "17.00",
        typeText: "Jadwal sore",
        remainingMinutes: diffMinutes,
        isToday: true
      };
    } else {
      // Sudah lewat sore, jadwal berikutnya adalah Pagi besok (07:00)
      const diffMinutes = (24 * 60 - currentTotalMinutes) + morningTotal;
      return {
        id: "morning",
        time: "07.00",
        typeText: "Jadwal pagi (Besok)",
        remainingMinutes: diffMinutes,
        isToday: false
      };
    }
  }

  /**
   * Format sisa waktu menjadi teks yang mudah dibaca
   */
  formatRemainingTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} jam ${mins} menit lagi`;
    }
    return `${mins} menit lagi`;
  }

  /**
   * Evaluasi status apakah jadwal pagi/sore sudah dijalankan
   */
  evaluateDailyExecutionStatus() {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    // Reset status saat tengah malam
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      this.schedules.morning.executed = false;
      this.schedules.evening.executed = false;
    }

    // Jika waktu saat ini sudah melewati jam jadwal, tandai sudah dijalankan (kecuali jika sedang running)
    if (currentTotalMinutes >= (7 * 60 + 5) && !this.schedules.morning.lastRunTime) {
      this.schedules.morning.executed = true;
    }

    if (currentTotalMinutes >= (17 * 60 + 5) && !this.schedules.evening.lastRunTime) {
      this.schedules.evening.executed = true;
    }
  }

  /**
   * Perbarui UI Jadwal pada kartu metrik dan panel detail jadwal
   */
  renderUI() {
    this.evaluateDailyExecutionStatus();
    const next = this.getNextSchedule();

    // 1. Kartu Metrik Ringkasan di Header Dashboard (Bagian 3 ujicoba.md)
    const nextTimeEl = document.getElementById("val-next-schedule-time");
    const nextLabelEl = document.getElementById("lbl-next-schedule-label");
    const nextBadgeEl = document.getElementById("badge-schedule-countdown");

    if (nextTimeEl) nextTimeEl.textContent = next.time;
    if (nextLabelEl) nextLabelEl.textContent = next.typeText;
    if (nextBadgeEl) nextBadgeEl.textContent = this.formatRemainingTime(next.remainingMinutes);

    // 2. Panel Jadwal Lengkap
    // Jadwal Pagi
    const morningBadge = document.getElementById("badge-morning-status");
    if (morningBadge) {
      if (this.schedules.morning.running) {
        morningBadge.textContent = "Sedang Berjalan";
        morningBadge.className = "status-badge optimal";
      } else if (this.schedules.morning.executed) {
        morningBadge.textContent = "Sudah Dijalankan";
        morningBadge.className = "status-badge neutral";
      } else {
        morningBadge.textContent = "Menunggu Jadwal";
        morningBadge.className = "status-badge dry";
      }
    }

    // Jadwal Sore
    const eveningBadge = document.getElementById("badge-evening-status");
    if (eveningBadge) {
      if (this.schedules.evening.running) {
        eveningBadge.textContent = "Sedang Berjalan";
        eveningBadge.className = "status-badge optimal";
      } else if (this.schedules.evening.executed) {
        eveningBadge.textContent = "Sudah Dijalankan";
        eveningBadge.className = "status-badge neutral";
      } else {
        eveningBadge.textContent = "Menunggu Jadwal";
        eveningBadge.className = "status-badge dry";
      }
    }
  }

  startScheduleWatcher() {
    this.renderUI();
    // Update setiap 10 detik
    this.countdownTimer = setInterval(() => {
      this.renderUI();
    }, 10000);
  }

  /**
   * Simulasi pemicu penyiraman jadwal untuk keperluan testing/demo
   */
  triggerScheduleTest(type) {
    if (type === "morning") {
      this.schedules.morning.running = true;
      this.schedules.morning.lastRunTime = new Date();
    } else if (type === "evening") {
      this.schedules.evening.running = true;
      this.schedules.evening.lastRunTime = new Date();
    }
    this.renderUI();
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ScheduleManager;
} else if (typeof window !== "undefined") {
  window.ScheduleManager = ScheduleManager;
}
