const MenuItem = require('../models/MenuItem');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ dest: 'uploads/' });

const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const createMenuItem = async (req, res) => {
    try {
        const { nama, deskripsi, harga, stok, jadwal } = req.body;
        let imageUrl = null;
        const filePath = req.file ? req.file.path : null;
        if (filePath) {
            const result = await cloudinary.uploader.upload(filePath);
            imageUrl = result.secure_url;
        }
        const newItem = new MenuItem({ nama, deskripsi, harga, imageUrl, stok, jadwal });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await MenuItem.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Menu item tidak ditemukan' });
        }
        res.json({ message: 'Menu item berhasil dihapus', item: deletedItem });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, deskripsi, harga, stok } = req.body;
        let updateData = { nama, deskripsi, harga, stok };

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.imageUrl = result.secure_url;
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedItem) {
            return res.status(404).json({ message: 'Menu item tidak ditemukan' });
        }
        res.json(updatedItem);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
    }
};

module.exports = { getMenuItems, createMenuItem, upload, updateMenuItem, deleteMenuItem };

