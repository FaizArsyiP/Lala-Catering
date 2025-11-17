const express = require('express');
const router = express.Router();
const {
    createOrder,
    createMultiDayOrder,
    getOrders,
    checkout,
    handleMidtransCallback,
    myOrders,
    generateInvoice,
    approveOrder,
    rejectOrder,
    completeOrder,
    updateDeliveryStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Customer routes
router.post('/', authMiddleware(['pembeli']), createOrder);                            // POST /api/orders - Create single-day order (legacy)
router.post('/multi-day', authMiddleware(['pembeli']), createMultiDayOrder);           // POST /api/orders/multi-day - Create multi-day order (NEW)
router.get('/:id/invoice', authMiddleware(['pembeli', 'penjual']), generateInvoice);   // GET /api/orders/:id/invoice - Generate PDF invoice
router.get('/myorders', authMiddleware(['pembeli']), myOrders);                        // GET /api/orders/myorders - Get my orders
router.post('/:id/checkout', authMiddleware(['pembeli']), checkout);                   // POST /api/orders/:id/checkout - Get payment token

// Seller routes
router.get('/', authMiddleware(['penjual']), getOrders);                               // GET /api/orders - Get all orders
router.post('/:id/approve', authMiddleware(['penjual']), approveOrder);                // POST /api/orders/:id/approve - Approve paid order
router.post('/:id/reject', authMiddleware(['penjual']), rejectOrder);                  // POST /api/orders/:id/reject - Reject paid order with refund
router.post('/:id/complete', authMiddleware(['penjual']), completeOrder);              // POST /api/orders/:id/complete - Mark order as completed
router.post('/:id/delivery/:deliveryId/status', authMiddleware(['penjual']), updateDeliveryStatus); // POST /api/orders/:id/delivery/:deliveryId/status - Update delivery status (NEW)

// Midtrans webhook
router.post('/payment/callback', handleMidtransCallback);                              // POST /api/orders/payment/callback - Midtrans payment notification

module.exports = router;