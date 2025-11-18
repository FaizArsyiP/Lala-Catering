const StoreSettings = require('../models/StoreSettings');

// Get store status (public - anyone can check if store is open)
const getStoreStatus = async (req, res) => {
    try {
        const settings = await StoreSettings.getSettings();
        res.json({
            isOpen: settings.isOpen,
            closedReason: settings.closedReason,
            lastUpdated: settings.lastUpdated
        });
    } catch (err) {
        console.error('Error getting store status:', err);
        return res.status(500).json({ message: err.message });
    }
};

// Open store (penjual only)
const openStore = async (req, res) => {
    try {
        const settings = await StoreSettings.updateSettings(true, null, req.user.id);

        console.log(`🟢 Store OPENED by user ${req.user.id}`);

        res.json({
            success: true,
            message: 'Toko berhasil dibuka',
            isOpen: settings.isOpen,
            lastUpdated: settings.lastUpdated
        });
    } catch (err) {
        console.error('Error opening store:', err);
        return res.status(500).json({ message: err.message });
    }
};

// Close store (penjual only)
const closeStore = async (req, res) => {
    console.log('🔍 closeStore function called');
    console.log('   User:', req.user);
    console.log('   Body:', req.body);
    try {
        const { reason } = req.body;

        const settings = await StoreSettings.updateSettings(
            false,
            reason || 'Toko sedang tutup sementara',
            req.user.id
        );

        console.log(`🔴 Store CLOSED by user ${req.user.id}`);
        console.log(`   Reason: ${reason || 'Toko sedang tutup sementara'}`);

        res.json({
            success: true,
            message: 'Toko berhasil ditutup',
            isOpen: settings.isOpen,
            closedReason: settings.closedReason,
            lastUpdated: settings.lastUpdated
        });
    } catch (err) {
        console.error('Error closing store:', err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getStoreStatus,
    openStore,
    closeStore
};
