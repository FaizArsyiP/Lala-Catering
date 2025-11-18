const express = require('express');
const router = express.Router();
const {
    getStoreStatus,
    openStore,
    closeStore
} = require('../controllers/storeController');
const authMiddleware = require('../middleware/auth');

console.log('✅ Store routes loaded');

// Public route - anyone can check store status
router.get('/status', getStoreStatus);                                    // GET /api/store/status

// Seller routes - only penjual can open/close store
router.post('/open', authMiddleware(['penjual']), openStore);             // POST /api/store/open
router.post('/close', authMiddleware(['penjual']), closeStore);           // POST /api/store/close

console.log('✅ Store routes registered: GET /status, POST /open, POST /close');

module.exports = router;
