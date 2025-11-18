const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
    isOpen: {
        type: Boolean,
        default: true,
        required: true
    },
    closedReason: {
        type: String,
        default: null
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Ensure only one document exists (singleton pattern)
storeSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({ isOpen: true });
    }
    return settings;
};

storeSettingsSchema.statics.updateSettings = async function(isOpen, closedReason = null, userId = null) {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({ isOpen, closedReason, updatedBy: userId });
    } else {
        settings.isOpen = isOpen;
        settings.closedReason = closedReason;
        settings.lastUpdated = Date.now();
        settings.updatedBy = userId;
        await settings.save();
    }
    return settings;
};

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
