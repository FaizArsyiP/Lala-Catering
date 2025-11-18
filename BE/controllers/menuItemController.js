const MenuItem = require("../models/MenuItem");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: "uploads/" });

const getMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.json(menuItems);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res
                .status(404)
                .json({ message: "Menu item tidak ditemukan" });
        }
        res.json(menuItem);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const createMenuItem = async (req, res) => {


    try {
        let { nama, deskripsi, harga, stok, jadwal, isActive } = req.body;

        // Parse jadwal if it's a JSON string (from FormData)
        if (typeof jadwal === "string") {
            try {
                jadwal = JSON.parse(jadwal);
            } catch (e) {
                return res
                    .status(400)
                    .json({ message: "Format jadwal tidak valid" });
            }
        }

        // Validasi jadwal
        if (!jadwal || !Array.isArray(jadwal) || jadwal.length === 0) {
            return res
                .status(400)
                .json({ message: "Jadwal harus diisi minimal 1 hari" });
        }

        // Parse isActive (dari FormData string "true"/"false" → boolean)
        if (typeof isActive === "string") {
            isActive = isActive === "true";
        }

        let imageUrl = null;
        const filePath = req.file ? req.file.path : null;
        if (filePath) {
            const result = await cloudinary.uploader.upload(filePath);
            imageUrl = result.secure_url;
        }
        const newItem = new MenuItem({
            nama,
            deskripsi,
            harga,
            imageUrl,
            stok,
            jadwal,
            isActive: isActive !== undefined ? isActive : true, // Default true jika tidak dikirim
        });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        return res
            .status(500)
            .json({ message: "Terjadi kesalahan server", error: err.message });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await MenuItem.findByIdAndDelete(id);
        if (!deletedItem) {
            return res
                .status(404)
                .json({ message: "Menu item tidak ditemukan" });
        }
        res.json({ message: "Menu item berhasil dihapus", item: deletedItem });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        let { nama, deskripsi, harga, stok, jadwal, isActive } = req.body;

        // Parse jadwal if it's a JSON string (from FormData)
        if (jadwal && typeof jadwal === "string") {
            try {
                jadwal = JSON.parse(jadwal);
            } catch (e) {
                return res
                    .status(400)
                    .json({ message: "Format jadwal tidak valid" });
            }
        }

        // Validasi jadwal jika dikirim
        if (jadwal !== undefined) {
            if (!Array.isArray(jadwal) || jadwal.length === 0) {
                return res
                    .status(400)
                    .json({ message: "Jadwal harus diisi minimal 1 hari" });
            }
        }

        // Parse isActive (dari FormData string "true"/"false" → boolean)
        if (typeof isActive === "string") {
            isActive = isActive === "true";
        }

        let updateData = { nama, deskripsi, harga, stok };
        if (jadwal) {
            updateData.jadwal = jadwal;
        }
        if (isActive !== undefined) {
            updateData.isActive = isActive;
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updateData.imageUrl = result.secure_url;
        }

        const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedItem) {
            return res
                .status(404)
                .json({ message: "Menu item tidak ditemukan" });
        }
        res.json(updatedItem);
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message });
        }
        return res
            .status(500)
            .json({ message: "Terjadi kesalahan server", error: err.message });
    }
};

module.exports = {
    getMenuItems,
    getMenuItemById,
    createMenuItem,
    upload,
    updateMenuItem,
    deleteMenuItem,
};
