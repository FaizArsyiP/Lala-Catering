/**
 * Week Helper Utilities
 * Untuk mengelola perhitungan minggu, tanggal, dan validasi
 */

/**
 * Get ISO week number dari tanggal
 * @param {Date} date - Tanggal yang akan dihitung
 * @returns {Object} { weekNumber, year }
 */
const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

    return {
        weekNumber: weekNumber,
        year: d.getUTCFullYear()
    };
};

/**
 * Get current week info
 * @returns {Object} { weekNumber, year, weekStart (Senin), weekEnd (Sabtu) }
 */
const getCurrentWeek = () => {
    const now = new Date();
    const { weekNumber, year } = getWeekNumber(now);
    const { weekStart, weekEnd } = getWeekDateRange(weekNumber, year);

    return {
        weekNumber,
        year,
        weekStart,
        weekEnd
    };
};

/**
 * Get tanggal Senin dan Sabtu dari week number
 * @param {Number} weekNumber - Nomor minggu
 * @param {Number} year - Tahun
 * @returns {Object} { weekStart (Senin), weekEnd (Sabtu) }
 */
const getWeekDateRange = (weekNumber, year) => {
    // Cari tanggal Kamis di minggu tersebut (ISO week definition)
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = simple;

    if (dayOfWeek <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }

    // Senin
    const weekStart = new Date(ISOweekStart);
    weekStart.setHours(0, 0, 0, 0);

    // Sabtu (Senin + 5 hari)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 5);
    weekEnd.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
};

/**
 * Generate daily menus dengan tanggal otomatis
 * @param {Date} weekStart - Tanggal Senin
 * @returns {Array} Array of { hari, tanggal } untuk Senin-Sabtu
 */
const generateDailySchedule = (weekStart) => {
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const dailySchedule = [];

    days.forEach((hari, index) => {
        const tanggal = new Date(weekStart);
        tanggal.setDate(weekStart.getDate() + index);
        tanggal.setHours(0, 0, 0, 0);

        dailySchedule.push({
            hari,
            tanggal
        });
    });

    return dailySchedule;
};

/**
 * Get tanggal dari hari dalam minggu tertentu
 * @param {String} hari - 'senin', 'selasa', dst
 * @param {Number} weekNumber - Nomor minggu
 * @param {Number} year - Tahun
 * @returns {Date} Tanggal untuk hari tersebut
 */
const getDateFromDay = (hari, weekNumber, year) => {
    const { weekStart } = getWeekDateRange(weekNumber, year);
    const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const dayIndex = days.indexOf(hari.toLowerCase());

    if (dayIndex === -1) {
        throw new Error('Invalid hari. Must be senin-sabtu');
    }

    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0);

    return date;
};

/**
 * Validasi H-1 (minimal 1 hari sebelum pengiriman)
 * @param {Date} deliveryDate - Tanggal pengiriman
 * @returns {Boolean} true jika valid (lebih dari 24 jam dari sekarang)
 */
const isValidH1 = (deliveryDate) => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    delivery.setHours(0, 0, 0, 0); // Start of day

    // Hitung selisih dalam jam
    const diffHours = (delivery - now) / (1000 * 60 * 60);

    // Valid jika lebih dari 24 jam (H-1)
    return diffHours >= 24;
};

/**
 * Check apakah sekarang hari Sabtu sore (waktu setting menu)
 * Sabtu sore = Sabtu jam 15:00 - 23:59
 * @returns {Boolean}
 */
const isSaturdayAfternoon = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Minggu, 6 = Sabtu
    const hour = now.getHours();

    return dayOfWeek === 6 && hour >= 15; // Sabtu jam 15:00 ke atas
};

/**
 * Check apakah sekarang hari Minggu (waktu customer bisa order untuk minggu ini)
 * @returns {Boolean}
 */
const isSunday = () => {
    const now = new Date();
    return now.getDay() === 0; // 0 = Minggu
};

/**
 * Format tanggal untuk display (Indonesia)
 * @param {Date} date
 * @returns {String} "Senin, 25 November 2024"
 */
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Format date range untuk display
 * @param {Date} start
 * @param {Date} end
 * @returns {String} "25 Nov - 30 Nov 2024"
 */
const formatDateRange = (start, end) => {
    const startStr = new Date(start).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
    });
    const endStr = new Date(end).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return `${startStr} - ${endStr}`;
};

module.exports = {
    getWeekNumber,
    getCurrentWeek,
    getWeekDateRange,
    generateDailySchedule,
    getDateFromDay,
    isValidH1,
    isSaturdayAfternoon,
    isSunday,
    formatDate,
    formatDateRange
};
