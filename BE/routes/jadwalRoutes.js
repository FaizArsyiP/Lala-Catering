const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    setMenuSchedule,
    getTodayMenu,
    getMenuByDay,
    setWeeklySchedule,
    getWeeklySchedule,
    clearWeeklySchedule
} = require('../controllers/jadwalController');

router.post('/', authMiddleware(['penjual']), setMenuSchedule);     // POST /api/jadwal - Set recurring jadwal menu

router.post('/mingguan', authMiddleware(['penjual']), setWeeklySchedule);     // POST /api/jadwal/mingguan - Set quota mingguan
router.get('/mingguan', getWeeklySchedule);                                    // GET /api/jadwal/mingguan - Get jadwal minggu ini
router.delete('/mingguan', authMiddleware(['penjual']), clearWeeklySchedule); // DELETE /api/jadwal/mingguan - Clear jadwal minggu ini

router.get('/today', getTodayMenu);                                 // GET /api/jadwal/today - Menu hari ini (prioritize weekly schedule)
router.get('/:hari', getMenuByDay);                                 // GET /api/jadwal/:hari - Menu per hari (prioritize weekly schedule)

module.exports = router; 