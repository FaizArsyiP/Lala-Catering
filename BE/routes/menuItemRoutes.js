const express = require('express');
const router = express.Router();
const { getMenuItems, getMenuItemById, createMenuItem, upload, updateMenuItem, deleteMenuItem } = require('../controllers/menuItemController');
const authMiddleware = require('../middleware/auth');


// Ambil semua menu
router.get('/', getMenuItems);                      // GET /api/menu
// Ambil menu berdasarkan ID
router.get('/:id', getMenuItemById);                // GET /api/menu/:id
// Tambah menu baru dengan upload gambar
// field form-data: nama, deskripsi, harga, stok, gambar (type file)
router.post(                                        // POST /api/menu
  '/',
  authMiddleware(['penjual']),
  upload.single('gambar'),
  createMenuItem
);

router.put('/:id', authMiddleware(['penjual']), upload.single('gambar'), updateMenuItem);   // PUT /api/menu/:id
router.delete('/:id', authMiddleware(['penjual']), deleteMenuItem);             // DELETE /api/menu/:id

module.exports = router;
