const MenuItem = require('../models/MenuItem');
const {
    getCurrentWeek,
    getWeekDateRange,
    generateDailySchedule,
    formatDateRange
} = require('../utils/weekHelper');

// ========================================
// RECURRING SCHEDULE (Sistem Lama - Tetap Dipakai)
// ========================================

const setMenuSchedule = async (req, res) => {
    try {
        const { menuId, jadwal } = req.body;

        if (!menuId || !Array.isArray(jadwal)) {
            return res.status(400).json({ message: 'menuId dan jadwal array wajib diisi' });
        }

        const updatedMenu = await MenuItem.findByIdAndUpdate(
            menuId,
            { jadwal },
            { new: true }
        );

        if (!updatedMenu) {
            return res.status(404).json({ message: 'Menu tidak ditemukan' });
        }

        res.status(200).json({ message: 'Jadwal berhasil diperbarui', data: updatedMenu });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTodayMenu = async (req, res) => {
    try {
        // Dapatkan nama hari dalam format lowercase
        const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' }).toLowerCase();
        const { weekNumber, year } = getCurrentWeek();

        // Prioritas: Cek weekly schedule dulu
        const menusWithQuota = await MenuItem.getMenusForDay(weekNumber, year, hariIni);

        if (menusWithQuota && menusWithQuota.length > 0) {
            // Ada weekly schedule untuk hari ini
            return res.status(200).json(menusWithQuota);
        }

        // Fallback ke recurring schedule
        const menuHariIni = await MenuItem.find({ jadwal: hariIni });

        if (menuHariIni.length === 0) {
            return res.status(404).json({ message: `Menu untuk hari ${hariIni} tidak ditemukan.` });
        }

        // Tambah flag isWeeklySchedule
        const menusWithFlag = menuHariIni.map(menu => ({
            ...menu.toObject(),
            isWeeklySchedule: false,
            stok: menu.stok
        }));

        res.status(200).json(menusWithFlag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMenuByDay = async (req, res) => {
    try {
        const hari = req.params.hari.toLowerCase(); // misal 'senin'
        const { weekNumber, year } = getCurrentWeek();

        // Prioritas: Cek weekly schedule dulu
        const menusWithQuota = await MenuItem.getMenusForDay(weekNumber, year, hari);

        if (menusWithQuota && menusWithQuota.length > 0) {
            // Ada weekly schedule untuk hari ini
            return res.status(200).json(menusWithQuota);
        }

        // Fallback ke recurring schedule
        const menus = await MenuItem.find({ jadwal: hari });

        if (!menus.length) {
            return res.status(404).json({ message: `Jadwal untuk hari ${hari} tidak ditemukan.` });
        }

        // Tambah flag isWeeklySchedule
        const menusWithFlag = menus.map(menu => ({
            ...menu.toObject(),
            isWeeklySchedule: false,
            stok: menu.stok
        }));

        res.status(200).json(menusWithFlag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ========================================
// WEEKLY QUOTA MANAGEMENT (Sistem Baru)
// ========================================

/**
 * POST /api/jadwal/mingguan
 * Set quota mingguan untuk semua menu (Sabtu sore)
 * Body: {
 *   menuSchedules: [
 *     {
 *       menuId: "...",
 *       dailyQuotas: [{ hari: "senin", quotaHarian: 30 }, ...]
 *     }
 *   ]
 * }
 */
const setWeeklySchedule = async (req, res) => {
    try {
        const { menuSchedules } = req.body;

        if (!menuSchedules || !Array.isArray(menuSchedules)) {
            return res.status(400).json({ message: 'menuSchedules array diperlukan' });
        }

        const { weekNumber, year } = getCurrentWeek();
        const { weekStart, weekEnd } = getWeekDateRange(weekNumber, year);
        const dailyScheduleTemplate = generateDailySchedule(weekStart);

        const updatedMenus = [];

        for (const menuSchedule of menuSchedules) {
            const { menuId, dailyQuotas } = menuSchedule;

            const menu = await MenuItem.findById(menuId);
            if (!menu) {
                return res.status(404).json({ message: `Menu ${menuId} tidak ditemukan` });
            }

            // Build complete daily quotas dengan tanggal
            const completeDailyQuotas = dailyQuotas.map(dq => {
                const template = dailyScheduleTemplate.find(t => t.hari === dq.hari);
                return {
                    hari: dq.hari,
                    tanggal: template.tanggal,
                    quotaHarian: dq.quotaHarian || 0,
                    terjual: 0
                };
            });

            // Set weekly schedule untuk menu ini
            await menu.setCurrentWeekSchedule(weekNumber, year, completeDailyQuotas);
            updatedMenus.push({
                menuId: menu._id,
                nama: menu.nama,
                weekNumber,
                year
            });
        }

        res.status(200).json({
            message: 'Jadwal mingguan berhasil diset',
            weekRange: formatDateRange(weekStart, weekEnd),
            updatedMenus
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/jadwal/mingguan
 * Get weekly schedule untuk minggu ini (semua menu dengan quota)
 */
const getWeeklySchedule = async (req, res) => {
    try {
        const { weekNumber, year } = getCurrentWeek();

        const menus = await MenuItem.find({
            'currentWeekSchedule.weekNumber': weekNumber,
            'currentWeekSchedule.year': year
        });

        if (menus.length === 0) {
            return res.status(404).json({
                message: `Jadwal mingguan untuk minggu ${weekNumber}/${year} belum diset.`
            });
        }

        const { weekStart, weekEnd } = getWeekDateRange(weekNumber, year);

        // Format response: group by hari
        const hariList = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        const schedule = hariList.map(hari => {
            const menuTersedia = [];

            menus.forEach(menu => {
                const quota = menu.getQuotaForDay(hari);
                if (quota) {
                    menuTersedia.push({
                        menuId: menu._id,
                        nama: menu.nama,
                        harga: menu.harga,
                        imageUrl: menu.imageUrl,
                        quotaHarian: quota.quotaHarian,
                        terjual: quota.terjual,
                        available: quota.quotaHarian - quota.terjual,
                        tanggal: quota.tanggal
                    });
                }
            });

            return {
                hari,
                menuTersedia
            };
        });

        res.status(200).json({
            weekNumber,
            year,
            weekRange: formatDateRange(weekStart, weekEnd),
            schedule
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * DELETE /api/jadwal/mingguan
 * Hapus weekly schedule (clear current week untuk semua menu)
 */
const clearWeeklySchedule = async (req, res) => {
    try {
        const { weekNumber, year } = getCurrentWeek();

        // Update semua menu yang ada weekly schedule untuk minggu ini
        const result = await MenuItem.updateMany(
            {
                'currentWeekSchedule.weekNumber': weekNumber,
                'currentWeekSchedule.year': year
            },
            {
                $unset: { currentWeekSchedule: "" }
            }
        );

        res.status(200).json({
            message: 'Jadwal mingguan berhasil dihapus',
            deletedCount: result.modifiedCount
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    // Recurring schedule (old)
    setMenuSchedule,
    getTodayMenu,
    getMenuByDay,
    // Weekly schedule (new)
    setWeeklySchedule,
    getWeeklySchedule,
    clearWeeklySchedule
};