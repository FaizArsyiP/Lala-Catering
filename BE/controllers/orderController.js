const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const midtransClient = require('midtrans-client');
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { getCurrentWeek, getDateFromDay, isValidH1, formatDate } = require('../utils/weekHelper');

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

// NEW: Multi-day order (Weekly system)
const createMultiDayOrder = async (req, res) => {
    try {
        const { deliveries, lokasiPengiriman, metodePengambilan, weekNumber, year } = req.body;
        const user = await User.findById(req.user.id);

        // Validasi input
        if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
            return res.status(400).json({ message: 'deliveries array required dan tidak boleh kosong' });
        }

        // Get atau validasi week
        const currentWeek = getCurrentWeek();
        const orderWeekNumber = weekNumber || currentWeek.weekNumber;
        const orderYear = year || currentWeek.year;

        // Check apakah ada menu dengan weekly schedule untuk minggu ini
        const menusWithSchedule = await MenuItem.find({
            'currentWeekSchedule.weekNumber': orderWeekNumber,
            'currentWeekSchedule.year': orderYear
        });

        if (!menusWithSchedule || menusWithSchedule.length === 0) {
            return res.status(404).json({
                message: `Jadwal mingguan untuk minggu ${orderWeekNumber}/${orderYear} belum dibuat. Hubungi penjual.`
            });
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

            // Get tanggal dari hari
            const tanggalPengiriman = getDateFromDay(hari, orderWeekNumber, orderYear);

            // Validasi H-1
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

                // Check apakah menu punya quota untuk hari ini
                const quota = menuItem.getQuotaForDay(hari.toLowerCase());
                if (!quota) {
                    return res.status(404).json({
                        message: `Menu ${menuItem.nama} tidak tersedia untuk ${hari} di minggu ini`
                    });
                }

                // Check quota availability (belum dikurangi, hanya validasi)
                const available = quota.quotaHarian - quota.terjual;
                if (available < jumlah) {
                    return res.status(400).json({
                        message: `Quota tidak cukup untuk ${menuItem.nama} di ${hari}. Tersedia: ${available}, diminta: ${jumlah}`
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

        // Create order
        const newOrder = new Order({
            userId: req.user.id,
            userInfo: {
                nama: user.nama,
                nomorTelepon: user.nomorTelepon,
                email: user.email
            },
            deliveries: processedDeliveries,
            weekNumber: orderWeekNumber,
            year: orderYear,
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

// Complete order (confirmed → completed)
const completeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).populate('userId', 'nama email');

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        // Only allow completion for confirmed orders
        if (order.status !== 'confirmed') {
            return res.status(400).json({ message: 'Hanya pesanan dengan status "confirmed" yang dapat diselesaikan.' });
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
        const order = await Order.findById(id)
            .populate('userId', 'nama email alamatPengiriman')
            .populate('items.menuItemId', 'nama harga');

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }

        if (req.user.role !== 'penjual' && order.userId._id.toString() !== req.user.id) {
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
        draw(`Nama Pelanggan: ${order.userId.nama}`, 50);
        draw(`Alamat Pengiriman: ${order.userId.alamatPengiriman}`, 50);
        draw(`Tanggal Pesanan: ${new Date(order.tanggalPesanan).toLocaleDateString()}`, 50);

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

        // Table rows
        order.items.forEach(item => {
            const namaItem = item.namaItem || item.menuItemId?.nama;
            const harga = item.harga || item.menuItemId?.harga;
            const jumlah = item.jumlah;

            const total = harga * jumlah;
            grandTotal += total;

            page.drawText(`${namaItem}`, { x: 50, y, size: 12, font });
            page.drawText(`Rp ${harga}`, { x: 250, y, size: 12, font });
            page.drawText(`${jumlah}`, { x: 350, y, size: 12, font });
            page.drawText(`Rp ${total}`, { x: 450, y, size: 12, font });

            y -= 20;
        });

        y -= 20;
        draw(`TOTAL AKHIR: Rp ${grandTotal}`, 50, 14);

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
            // NEW: Multi-day order - reduce quota dari MenuItem.currentWeekSchedule
            for (const delivery of order.deliveries) {
                // Reduce terjual untuk setiap item
                for (const item of delivery.items) {
                    const menuItem = await MenuItem.findById(item.menuItemId);

                    if (!menuItem) {
                        return res.status(404).json({
                            message: `Menu ${item.namaItem} tidak ditemukan.`
                        });
                    }

                    try {
                        // Increment terjual menggunakan method dari MenuItem
                        await menuItem.incrementTerjual(delivery.hari, item.jumlah);
                    } catch (err) {
                        return res.status(400).json({
                            message: err.message
                        });
                    }
                }
            }

        } else {
            // OLD: Single-day order - reduce stock from MenuItem
            for (const item of order.items) {
                const menuItem = await MenuItem.findById(item.menuItemId);
                if (menuItem) {
                    menuItem.stok -= item.jumlah;
                    await menuItem.save();
                }
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

        // Trigger Midtrans refund
        if (order.midtransTransactionId) {
            try {
                const refundParams = {
                    refund_key: `refund-${order._id}-${Date.now()}`,
                    amount: order.totalHarga,
                    reason: reason || 'Pesanan ditolak oleh penjual - kapasitas tidak mencukupi'
                };

                await coreApi.refund(order.midtransTransactionId, refundParams);

            } catch (midtransErr) {
                console.error('Midtrans refund error:', midtransErr);
                return res.status(500).json({
                    message: 'Gagal memproses refund ke Midtrans.',
                    error: midtransErr.message
                });
            }
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

module.exports = {
    createOrder,
    createMultiDayOrder,
    getOrders,
    checkout,
    handleMidtransCallback,
    generateInvoice,
    myOrders,
    approveOrder,
    rejectOrder,
    completeOrder,
    updateDeliveryStatus
};
