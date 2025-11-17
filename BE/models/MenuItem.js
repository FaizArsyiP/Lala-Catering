const mongoose = require('mongoose');

// Sub-schema untuk daily quota
const dailyQuotaSchema = new mongoose.Schema({
    hari: {
        type: String,
        enum: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'],
        required: true
    },
    tanggal: {
        type: Date,
        required: true
    },
    quotaHarian: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    terjual: {
        type: Number,
        default: 0,
        min: 0
    }
});

// Sub-schema untuk weekly schedule (current week only)
const weeklyScheduleSchema = new mongoose.Schema({
    weekNumber: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    dailyQuotas: [dailyQuotaSchema]
});

const menuItemSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    deskripsi: {
        type: String,
        required: true
    },
    harga: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String
    },
    stok: {
        type: Number,
        default: 0
    },
    jadwal: {
        type: [String],
        enum: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'],
        default: []
    },
    // Current week schedule only
    currentWeekSchedule: weeklyScheduleSchema
});

// Virtual untuk available quota
dailyQuotaSchema.virtual('available').get(function() {
    return this.quotaHarian - this.terjual;
});

// Method untuk get quota by day (current week)
menuItemSchema.methods.getQuotaForDay = function(hari) {
    if (!this.currentWeekSchedule) return null;
    return this.currentWeekSchedule.dailyQuotas.find(dq => dq.hari === hari);
};

// Method untuk increment terjual
menuItemSchema.methods.incrementTerjual = async function(hari, jumlah) {
    if (!this.currentWeekSchedule) {
        throw new Error('Weekly schedule not found for this menu');
    }

    const dayQuota = this.currentWeekSchedule.dailyQuotas.find(dq => dq.hari === hari);

    if (!dayQuota) {
        throw new Error(`Quota untuk ${hari} tidak ditemukan`);
    }

    const available = dayQuota.quotaHarian - dayQuota.terjual;
    if (available < jumlah) {
        throw new Error(`Quota tidak cukup untuk ${this.nama} di ${hari}. Tersedia: ${available}, diminta: ${jumlah}`);
    }

    dayQuota.terjual += jumlah;
    return this.save();
};

// Method untuk set weekly schedule (replace current week)
menuItemSchema.methods.setCurrentWeekSchedule = async function(weekNumber, year, dailyQuotas) {
    this.currentWeekSchedule = {
        weekNumber,
        year,
        dailyQuotas
    };
    return this.save();
};

// Static method untuk get all menus with quota for specific day (current week)
menuItemSchema.statics.getMenusForDay = async function(weekNumber, year, hari) {
    const menus = await this.find({
        'currentWeekSchedule.weekNumber': weekNumber,
        'currentWeekSchedule.year': year,
        'currentWeekSchedule.dailyQuotas.hari': hari
    });

    return menus.map(menu => {
        const quota = menu.getQuotaForDay(hari);
        return {
            _id: menu._id,
            nama: menu.nama,
            deskripsi: menu.deskripsi,
            harga: menu.harga,
            imageUrl: menu.imageUrl,
            quotaHarian: quota?.quotaHarian || 0,
            terjual: quota?.terjual || 0,
            available: quota ? (quota.quotaHarian - quota.terjual) : 0,
            tanggal: quota?.tanggal,
            isWeeklySchedule: true
        };
    }).filter(menu => menu.quotaHarian > 0);
};

// Ensure virtuals are included
dailyQuotaSchema.set('toJSON', { virtuals: true });
dailyQuotaSchema.set('toObject', { virtuals: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;
