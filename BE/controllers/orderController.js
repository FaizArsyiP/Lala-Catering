const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const midtransClient = require('midtrans-client');
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { getCurrentWeek, getDateFromDay, getNextDateForDay, isValidH1, formatDate } = require('../utils/weekHelper');

const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY
});

// OLD: Single-day order (Legacy support - deprecated)
const createOrder = async (req, res) => {
    try {
        const { items, lokasiPengiriman, metodePengambilan } = req.body;
        const user = await User.findById(req.user.id);

        let totalHarga = 0;
        const orderedItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);

            if (!menuItem || menuItem.stok < item.jumlah) {
                return res.status(404).json({ message: `Item menu '${item.menuItemId}' tidak tersedia.` });
            }

            totalHarga += menuItem.harga * item.jumlah;

            // Don't reduce stock yet - will be reduced after seller approval

            orderedItems.push({
                menuItemId: menuItem._id,
                namaItem: menuItem.nama,
                harga: menuItem.harga,
                jumlah: item.jumlah
            });
        }

        const newOrder = new Order({
            userId: req.user.id,
            userInfo:{
                nama: user.nama,
                nomorTelepon: user.nomorTelepon,
                email: user.email
            },
            items: orderedItems,
            totalHarga,
            lokasiPengiriman,
            alamatPengirimanText:user.alamatPengiriman,
            metodePengambilan
        });
        await newOrder.save();


        // if (user.email) {
        //     sendEmail(user.email, 'Konfirmasi Pesanan', `Halo ${user.nama}, pesanan Anda dengan ID ${newOrder._id} telah diterima dan sedang diproses.`);
        // }

        res.status(201).json(newOrder);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// NEW: Multi-day order (Simplified - tanpa weekly schedule)
const createMultiDayOrder = async (req, res) => {
    try {
        const { deliveries, lokasiPengiriman, metodePengambilan } = req.body;
        const user = await User.findById(req.user.id);

        // Validasi input
        if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
            return res.status(400).json({ message: 'deliveries array required dan tidak boleh kosong' });
        }

        // Process deliveries
        const processedDeliveries = [];
        let totalHarga = 0;

        for (const delivery of deliveries) {
            const { hari, items } = delivery;

            if (!hari || !items || items.length === 0) {
                return res.status(400).json({
                    message: 'Setiap delivery harus memiliki hari dan items'
                });
            }

            // Cari tanggal berikutnya untuk hari ini yang memenuhi H-1
            let tanggalPengiriman;
            try {
                tanggalPengiriman = getNextDateForDay(hari);
            } catch (err) {
                return res.status(400).json({
                    message: `Error menentukan tanggal untuk ${hari}: ${err.message}`
                });
            }

            // Validasi H-1 (seharusnya sudah valid dari getNextDateForDay, tapi double check)
            if (!isValidH1(tanggalPengiriman)) {
                return res.status(400).json({
                    message: `Pemesanan untuk ${hari} (${formatDate(tanggalPengiriman)}) tidak valid. Minimal H-1 (24 jam sebelumnya).`
                });
            }

            // Process items untuk delivery ini
            const processedItems = [];
            let subtotal = 0;

            for (const item of items) {
                const { menuItemId, jumlah } = item;

                // Find menu item
                const menuItem = await MenuItem.findById(menuItemId);
                if (!menuItem) {
                    return res.status(404).json({
                        message: `Menu ${menuItemId} tidak ditemukan`
                    });
                }

                // Check stok biasa (tidak pakai weekly schedule)
                if (menuItem.stok < jumlah) {
                    return res.status(400).json({
                        message: `Stok tidak cukup untuk ${menuItem.nama}. Tersedia: ${menuItem.stok}, diminta: ${jumlah}`
                    });
                }

                // Calculate subtotal
                const itemTotal = menuItem.harga * jumlah;
                subtotal += itemTotal;

                processedItems.push({
                    menuItemId: menuItem._id,
                    namaItem: menuItem.nama,
                    harga: menuItem.harga,
                    jumlah
                });
            }

            totalHarga += subtotal;

            processedDeliveries.push({
                hari,
                tanggalPengiriman,
                items: processedItems,
                subtotal,
                statusDelivery: 'pending'
            });
        }

        // Create order (tanpa weekNumber dan year)
        const newOrder = new Order({
            userId: req.user.id,
            userInfo: {
                nama: user.nama,
                nomorTelepon: user.nomorTelepon,
                email: user.email
            },
            deliveries: processedDeliveries,
            totalHarga,
            lokasiPengiriman,
            alamatPengirimanText: user.alamatPengiriman,
            metodePengambilan,
            status: 'pending'
        });

        await newOrder.save();

        res.status(201).json({
            message: 'Multi-day order created successfully',
            order: newOrder
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'nama nomorTelepon alamatPengiriman').populate('items.menuItemId', 'nama harga');
        res.json(orders);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }

        res.json(order);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Mark order as ready (confirmed → ready) - Seller marks as ready for pickup/delivery
const markOrderReady = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('userId', 'nama email');

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        // Only allow for confirmed orders
        if (order.status !== 'confirmed') {
            return res.status(400).json({ message: 'Hanya pesanan dengan status "confirmed" yang dapat ditandai ready.' });
        }

        // Update status to ready
        order.status = 'ready';
        await order.save();

        // Send email notification
        if (order.userId && order.userId.email) {
            sendEmail(
                order.userId.email,
                'Pesanan Siap Diambil/Dikirim',
                `Halo ${order.userId.nama},\n\nPesanan Anda (ID: ${order._id}) sudah siap untuk diambil/dikirim!\n\nTerima kasih telah memesan di Lala Catering!`
            );
        }

        res.json({ message: 'Pesanan berhasil ditandai ready.', order });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Complete order (ready → completed) - Customer confirms receipt
const completeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('userId', 'nama email');

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        // Only allow completion for ready orders
        if (order.status !== 'ready') {
            return res.status(400).json({ message: 'Hanya pesanan dengan status "ready" yang dapat diselesaikan.' });
        }

        // Update status to completed
        order.status = 'completed';
        await order.save();

        // Send email notification
        if (order.userId && order.userId.email) {
            sendEmail(
                order.userId.email,
                'Pesanan Selesai',
                `Halo ${order.userId.nama},\n\nPesanan Anda (ID: ${order._id}) telah selesai.\n\nTerima kasih telah memesan di Lala Catering!`
            );
        }

        res.json({ message: 'Pesanan berhasil diselesaikan.', order });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const checkout = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('userId', 'nama email');

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }
        
        const midtransOrderId = `ORDER-${order._id}-${Date.now()}`;
        const parameter = {
            transaction_details: {
                order_id: midtransOrderId,
                gross_amount: order.totalHarga,
            },
            customer_details: {
                first_name: order.userId.nama,
                email: order.userId.email,
            },
            credit_card: {
                secure: true
            }
        };

        const transaction = await snap.createTransaction(parameter);
        
        order.midtransTransactionId = midtransOrderId;
        await order.save();
        
        res.json({ token: transaction.token });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const handleMidtransCallback = async (req, res) => {
    try {
        const { transaction_status, order_id } = req.body;
        const order = await Order.findOne({ midtransTransactionId: order_id }).populate('userId', 'nama email');

        if (!order) return res.status(404).send('Not Found');

        if (transaction_status === 'settlement' || transaction_status === 'capture') {
            // Payment successful - set status to 'paid' and wait for seller approval
            order.status = 'paid';
            await order.save();

            // Send email to customer
            if (order.userId && order.userId.email) {
                sendEmail(
                    order.userId.email,
                    'Pembayaran Berhasil',
                    `Halo ${order.userId.nama},\n\nPembayaran untuk pesanan Anda (ID: ${order._id}) telah berhasil.\n\nPesanan Anda sedang menunggu konfirmasi dari penjual. Anda akan menerima notifikasi lebih lanjut segera.\n\nTerima kasih!`
                );
            }

        } else if (transaction_status === 'expire' || transaction_status === 'cancel' || transaction_status === 'deny') {
            // Payment failed or expired
            order.status = 'canceled';
            await order.save();
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('Midtrans callback error:', err);
        res.status(500).send('Error');
    }
};

const generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        if (req.user.role !== 'penjual' && order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Akses ditolak.' });
        }

        // --- START PDF ---
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        let y = 800; // starting point

        const draw = (text, x, size = 12) => {
            page.drawText(text, { x, y, size, font });
            y -= size + 6;
        };

        // Header
        draw("INVOICE PESANAN", 50, 20);
        y -= 10;

        draw(`Nomor Pesanan: ${order._id}`, 50);
        draw(`Nama Pelanggan: ${order.userInfo.nama}`, 50);
        draw(`Email: ${order.userInfo.email}`, 50);
        draw(`No Telepon: ${order.userInfo.nomorTelepon}`, 50);
        draw(`Alamat: ${order.alamatPengirimanText || '-'}`, 50);
        draw(`Metode: ${order.metodePengambilan}`, 50);
        draw(`Tanggal Pesanan: ${new Date(order.createdAt || order.tanggalPesanan).toLocaleDateString('id-ID')}`, 50);

        y -= 20;
        draw("Rincian Pesanan:", 50, 16);
        y -= 10;

        // Table header
        page.drawText("Item", { x: 50, y, size: 12, font });
        page.drawText("Harga", { x: 250, y, size: 12, font });
        page.drawText("Jumlah", { x: 350, y, size: 12, font });
        page.drawText("Total", { x: 450, y, size: 12, font });
        y -= 20;

        let grandTotal = 0;

        // Check if multi-day order (has deliveries) or single-day order (has items)
        if (order.deliveries && order.deliveries.length > 0) {
            // Multi-day order - iterate through deliveries
            order.deliveries.forEach(delivery => {
                // Draw day header
                page.drawText(`=== ${delivery.hari} ===`, { x: 50, y, size: 11, font });
                y -= 18;

                delivery.items.forEach(item => {
                    const namaItem = item.namaItem;
                    const harga = item.harga;
                    const jumlah = item.jumlah;
                    const total = harga * jumlah;
                    grandTotal += total;

                    page.drawText(`${namaItem}`, { x: 50, y, size: 10, font });
                    page.drawText(`Rp ${harga.toLocaleString()}`, { x: 250, y, size: 10, font });
                    page.drawText(`${jumlah}`, { x: 350, y, size: 10, font });
                    page.drawText(`Rp ${total.toLocaleString()}`, { x: 450, y, size: 10, font });

                    y -= 18;
                });
            });
        } else if (order.items && order.items.length > 0) {
            // Single-day order - iterate through items
            order.items.forEach(item => {
                const namaItem = item.namaItem;
                const harga = item.harga;
                const jumlah = item.jumlah;
                const total = harga * jumlah;
                grandTotal += total;

                page.drawText(`${namaItem}`, { x: 50, y, size: 10, font });
                page.drawText(`Rp ${harga.toLocaleString()}`, { x: 250, y, size: 10, font });
                page.drawText(`${jumlah}`, { x: 350, y, size: 10, font });
                page.drawText(`Rp ${total.toLocaleString()}`, { x: 450, y, size: 10, font });

                y -= 18;
            });
        }

        y -= 20;
        draw(`TOTAL AKHIR: Rp ${grandTotal.toLocaleString()}`, 50, 14);
        draw(`Status: ${order.status.toUpperCase()}`, 50, 12);

        const pdfBytes = await pdfDoc.save();
        // --- END PDF ---

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=invoice_${order._id}.pdf`);
        res.send(Buffer.from(pdfBytes));

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).populate('items.menuItemId', 'nama harga');
        res.json(orders);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Seller approve paid order
const approveOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('userId', 'nama email');

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        // Only allow approval for paid orders
        if (order.status !== 'paid') {
            return res.status(400).json({ message: 'Hanya pesanan dengan status "paid" yang dapat diapprove.' });
        }

        // Check if multi-day or single-day order
        if (order.isMultiDay) {
            // Multi-day order - reduce stok biasa (bukan quota)
            for (const delivery of order.deliveries) {
                for (const item of delivery.items) {
                    const menuItem = await MenuItem.findById(item.menuItemId);

                    if (!menuItem) {
                        return res.status(404).json({
                            message: `Menu ${item.namaItem} tidak ditemukan.`
                        });
                    }

                    // Cek stok cukup
                    if (menuItem.stok < item.jumlah) {
                        return res.status(400).json({
                            message: `Stok tidak cukup untuk ${menuItem.nama}. Tersedia: ${menuItem.stok}, dibutuhkan: ${item.jumlah}`
                        });
                    }

                    // Kurangi stok
                    menuItem.stok -= item.jumlah;
                    await menuItem.save();
                }
            }

        } else {
            // Single-day order - reduce stock from MenuItem
            for (const item of order.items) {
                const menuItem = await MenuItem.findById(item.menuItemId);
                if (!menuItem) {
                    return res.status(404).json({
                        message: `Menu ${item.namaItem} tidak ditemukan.`
                    });
                }

                // Cek stok cukup
                if (menuItem.stok < item.jumlah) {
                    return res.status(400).json({
                        message: `Stok tidak cukup untuk ${menuItem.nama}. Tersedia: ${menuItem.stok}, dibutuhkan: ${item.jumlah}`
                    });
                }

                // Kurangi stok
                menuItem.stok -= item.jumlah;
                await menuItem.save();
            }
        }

        // Update status to confirmed
        order.status = 'confirmed';
        await order.save();

        // Send email notification
        if (order.userId && order.userId.email) {
            sendEmail(
                order.userId.email,
                'Pesanan Dikonfirmasi',
                `Halo ${order.userId.nama},\n\nPesanan Anda (ID: ${order._id}) telah dikonfirmasi oleh penjual dan sedang diproses.\n\nTerima kasih!`
            );
        }

        res.json({ message: 'Pesanan berhasil diapprove.', order });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Seller reject paid order with auto-refund
const rejectOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const order = await Order.findById(id).populate('userId', 'nama email');

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        // Only allow rejection for paid orders
        if (order.status !== 'paid') {
            return res.status(400).json({ message: 'Hanya pesanan dengan status "paid" yang dapat ditolak.' });
        }

        // ⚠️ LOCALHOST MODE: Skip Midtrans refund API (hanya notifikasi)
        // Untuk production, uncomment code di bawah untuk actual refund via Midtrans

        /* PRODUCTION MODE - Uncomment untuk actual Midtrans refund:
        if (order.midtransTransactionId) {
            try {
                const refundParams = {
                    refund_key: `refund-${order._id}-${Date.now()}`,
                    amount: order.totalHarga,
                    reason: reason || 'Pesanan ditolak oleh penjual - kapasitas tidak mencukupi'
                };

                await coreApi.refund(order.midtransTransactionId, refundParams);
                console.log('Midtrans refund successful');

            } catch (midtransErr) {
                console.error('Midtrans refund error:', midtransErr);
                return res.status(500).json({
                    message: 'Gagal memproses refund ke Midtrans.',
                    error: midtransErr.message
                });
            }
        }
        */

        // LOCALHOST: Cukup log saja, tidak actual refund
        if (order.midtransTransactionId) {
            console.log(`[TESTING] Refund will be processed for order ${order._id}`);
            console.log(`[TESTING] Amount: Rp ${order.totalHarga}`);
            console.log(`[TESTING] Reason: ${reason || 'Kapasitas tidak mencukupi'}`);
        }

        // Update status to canceled
        order.status = 'canceled';
        await order.save();

        // Send email notification
        if (order.userId && order.userId.email) {
            sendEmail(
                order.userId.email,
                'Pesanan Ditolak - Refund Diproses',
                `Halo ${order.userId.nama},\n\nMohon maaf, pesanan Anda (ID: ${order._id}) ditolak oleh penjual.\n\nAlasan: ${reason || 'Kapasitas tidak mencukupi'}\n\nUang Anda akan dikembalikan otomatis dalam 1-3 hari kerja.\n\nTerima kasih atas pengertiannya.`
            );
        }

        res.json({
            message: 'Pesanan ditolak dan refund telah diproses.',
            order,
            refundStatus: 'Processing - Dana akan dikembalikan dalam 1-3 hari kerja'
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Update delivery status (untuk multi-day orders)
const updateDeliveryStatus = async (req, res) => {
    try {
        const { id, deliveryId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id).populate('userId', 'nama email');

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        if (!order.isMultiDay) {
            return res.status(400).json({
                message: 'Endpoint ini hanya untuk multi-day orders.'
            });
        }

        // Validasi status
        const validStatuses = ['pending', 'ready', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status harus salah satu dari: ${validStatuses.join(', ')}`
            });
        }

        // Update delivery status
        await order.updateDeliveryStatus(deliveryId, status);

        // Send email jika semua delivered
        if (order.status === 'completed' && order.userId && order.userId.email) {
            sendEmail(
                order.userId.email,
                'Semua Pesanan Selesai',
                `Halo ${order.userId.nama},\n\nSemua pesanan Anda (ID: ${order._id}) telah selesai dikirim.\n\nTerima kasih telah memesan di Lala Catering!`
            );
        }

        res.json({
            message: 'Delivery status updated',
            order
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ⚠️ TESTING ONLY - Manual status change (localhost testing tanpa Midtrans callback)
const testChangeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validasi status yang diperbolehkan
        const validStatuses = ['pending', 'paid', 'confirmed', 'completed', 'canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Status harus salah satu dari: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order tidak ditemukan' });
        }

        const oldStatus = order.status;
        order.status = status;
        await order.save();

        console.log(`[TESTING] Order ${id} status changed: ${oldStatus} → ${status}`);

        res.json({
            success: true,
            message: `Status berhasil diubah dari '${oldStatus}' ke '${status}'`,
            order: {
                _id: order._id,
                oldStatus,
                newStatus: status
            }
        });
    } catch (err) {
        console.error('[TESTING] Change status error:', err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createOrder,
    createMultiDayOrder,
    getOrders,
    getOrderById,
    checkout,
    handleMidtransCallback,
    generateInvoice,
    myOrders,
    approveOrder,
    rejectOrder,
    markOrderReady,   // NEW: Mark order as ready
    completeOrder,
    updateDeliveryStatus,
    testChangeStatus  // Export endpoint testing
};
