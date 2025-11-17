const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    namaItem: {
        type: String,
        required: true
    },
    harga: {
        type: Number,
        required: true
    },
    jumlah: {
        type: Number,
        required: true,
        min: 1
    }
});

// Sub-schema untuk delivery (multi-day support)
const deliverySchema = new mongoose.Schema({
    hari: {
        type: String,
        enum: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'],
        required: true
    },
    tanggalPengiriman: {
        type: Date,
        required: true
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    statusDelivery: {
        type: String,
        enum: ['pending', 'ready', 'delivered'],
        default: 'pending'
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userInfo:{
        nama: {type :String},
        nomorTelepon: {type :String},
        email: {type :String}
    },
    // Multi-day deliveries
    deliveries: [deliverySchema],
    // Week info
    weekNumber: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    // Legacy support for old single-day orders
    items: [orderItemSchema],
    tanggalPesanan: {
        type: Date,
        default: Date.now
    },
    // Common fields
    totalHarga: {
        type: Number,
        required: true
    },
    lokasiPengiriman: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    alamatPengirimanText: String,
    metodePengambilan: {
        type: String,
        enum: ['delivery', 'pickup'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'canceled', 'paid', 'completed'],
        default: 'pending'
    },
    midtransTransactionId: {
        type: String
    }
}, { timestamps: true });

// Index untuk query yang efisien
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ weekNumber: 1, year: 1 });
orderSchema.index({ status: 1 });

// Virtual untuk check apakah multi-day order
orderSchema.virtual('isMultiDay').get(function() {
    return this.deliveries && this.deliveries.length > 0;
});

// Virtual untuk delivery progress
orderSchema.virtual('deliveryProgress').get(function() {
    if (!this.isMultiDay) return null;
    const delivered = this.deliveries.filter(d => d.statusDelivery === 'delivered').length;
    const total = this.deliveries.length;
    return `${delivered}/${total} delivered`;
});

// Method untuk update delivery status
orderSchema.methods.updateDeliveryStatus = function(deliveryId, newStatus) {
    const delivery = this.deliveries.id(deliveryId);
    if (!delivery) {
        throw new Error('Delivery not found');
    }
    delivery.statusDelivery = newStatus;

    // Auto-update order status jika semua delivered
    if (newStatus === 'delivered') {
        const allDelivered = this.deliveries.every(d => d.statusDelivery === 'delivered');
        if (allDelivered && this.status === 'confirmed') {
            this.status = 'completed';
        }
    }

    return this.save();
};

// Static method untuk find orders by week
orderSchema.statics.findByWeek = function(weekNumber, year) {
    return this.find({ weekNumber, year });
};

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
