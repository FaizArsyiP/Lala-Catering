# 🍽️ Lala-Catering

## 📖 Deskripsi Aplikasi

**Lala Catering** adalah aplikasi full-stack berbasis web yang memiliki fungsi utama sebagai migrasi dari sistem pemesanan katering manual ke sistem digital yang modern dan efisien.

### Fitur Utama:
* **Pelanggan (Pembeli)**:
  - Menelusuri menu mingguan dengan filter hari
  - Memesan katering (single-day & multi-day orders)
  - Melakukan pembayaran online dengan Midtrans
  - Mengecek status pesanan real-time
  - Download invoice pesanan
  - Membatalkan pesanan dengan refund

* **Administrator (Penjual/Bu Lala)**:
  - Dashboard monitoring pesanan dan statistik
  - Mengelola menu (CRUD operations)
  - Mengatur jadwal menu mingguan
  - Memperbarui status pesanan
  - Membuka/menutup toko dengan custom message
  - Upload gambar menu ke cloud storage

---

## 👥 Nama Kelompok & Anggota

**Nama Kelompok:** `Katering LaBuBu`

| Nama Anggota                      | NIM                |
| --------------------------------- | ------------------ |
| Bisuk Artahsasta Waradana Siahaan | 23/522507/TK/57686 |
| Faiz Arsyi Pragata                | 23/518958/TK/57199 |
| Haidar Faruqi Al Ghifari          | 23/518252/TK/57023 |
| Maritza Vania Adelia              | 23/517643/TK/56944 |
| Taufiqurrahman                    | 23/517921/TK/56978 |

---

## 📂 Struktur Folder & File

```bash
Lala-Catering/
├── BE/                              # Backend (Node.js + Express.js)
│   ├── controllers/
│   │   ├── jadwalController.js      # Manage weekly schedules
│   │   ├── menuItemController.js    # Menu CRUD operations
│   │   ├── orderController.js       # Order management & payment
│   │   ├── storeController.js       # Store open/close management
│   │   └── userController.js        # Authentication & user management
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication & role-based access
│   ├── models/
│   │   ├── MenuItem.js              # Menu item schema
│   │   ├── Order.js                 # Order schema with status tracking
│   │   ├── StoreSettings.js         # Store open/close status (singleton)
│   │   └── User.js                  # User schema with roles
│   ├── routes/
│   │   ├── jadwalRoutes.js          # Schedule API routes
│   │   ├── menuItemRoutes.js        # Menu API routes
│   │   ├── orderRoutes.js           # Order API routes
│   │   ├── storeRoutes.js           # Store management routes
│   │   └── userRoutes.js            # Auth & user routes
│   ├── services/
│   │   └── emailService.js          # Nodemailer email notifications
│   ├── .dockerignore                # Docker ignore configuration
│   ├── .gitignore                   # Git ignore configuration
│   ├── fly.toml                     # Fly.io deployment configuration
│   ├── index.js                     # Express server entry point
│   ├── package.json                 # Backend dependencies
│   └── test.html                    # API external test page
│
├── lala-web/                        # Frontend (Next.js 15 + React 19)
│   ├── public/
│   │   └── assets/                  # Images & static files
│   ├── src/
│   │   ├── app/
│   │   │   ├── (protected)/         # Protected customer routes
│   │   │   │   ├── menu/            # Menu browsing page
│   │   │   │   ├── cart/            # Shopping cart page
│   │   │   │   └── profile/         # User profile & order history
│   │   │   ├── admin/               # Admin dashboard routes
│   │   │   │   ├── dashboard/       # Statistics & overview
│   │   │   │   ├── kelola-toko/     # Menu & store management
│   │   │   │   └── kelola-pesanan/  # Order management
│   │   │   ├── page.jsx             # Landing/sign-in page
│   │   │   ├── layout.jsx           # Root layout
│   │   │   └── globals.css          # Global styles (Tailwind)
│   │   ├── components/
│   │   │   ├── admin/               # Admin-specific components
│   │   │   │   ├── dataTable.js     # Reusable data table
│   │   │   │   ├── menuActionButtons.js
│   │   │   │   └── statCard.js      # Dashboard statistics card
│   │   │   ├── layout/
│   │   │   │   └── header.js        # Navigation header
│   │   │   ├── cardMenu.js          # Menu item card
│   │   │   ├── dropdownFilter.js    # Filter dropdown component
│   │   │   ├── orderList.tsx        # Order list component
│   │   │   └── search.js            # Search input component
│   │   ├── context/
│   │   │   └── CartContext.js       # Shopping cart state management
│   │   └── utils/
│   │       └── axiosInstance.jsx    # Axios configuration with interceptors
│   ├── .gitignore
│   ├── package.json                 # Frontend dependencies
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── next.config.js               # Next.js configuration
│
├── .gitignore                       # Root git ignore
├── package.json                     # Root package (concurrently script)
└── README.md                        # Project documentation
```

---

## 🛠️ Teknologi yang Digunakan

### Backend Stack
| Kategori     | Teknologi           | Deskripsi                                                                  |
| ------------ | ------------------- | -------------------------------------------------------------------------- |
| Runtime      | Node.js v18+        | JavaScript runtime environment                                             |
| Framework    | Express.js          | Web application framework untuk RESTful API                                |
| Database     | MongoDB Atlas       | NoSQL cloud database                                                       |
| ODM          | Mongoose            | MongoDB object modeling untuk Node.js                                      |
| Otentikasi   | JWT & Google OAuth  | Token-based authentication & OAuth 2.0                                     |
| File Upload  | Multer              | Middleware untuk handle multipart/form-data                                |
| File Storage | Cloudinary          | Cloud storage untuk gambar menu                                            |
| Email        | Nodemailer (Gmail)  | Email notification service                                                 |
| Payment      | Midtrans Snap API   | Payment gateway (Sandbox mode untuk testing)                               |
| Security     | bcryptjs, CORS      | Password hashing & Cross-Origin Resource Sharing                           |

### Frontend Stack
| Kategori        | Teknologi              | Deskripsi                                                               |
| --------------- | ---------------------- | ----------------------------------------------------------------------- |
| Framework       | Next.js 15             | React framework dengan App Router                                       |
| UI Library      | React 19               | JavaScript library untuk building user interfaces                       |
| Styling         | Tailwind CSS           | Utility-first CSS framework                                             |
| HTTP Client     | Axios                  | Promise-based HTTP client                                               |
| State Management| React Context API      | Built-in state management                                               |
| Icons           | React Icons            | Icon library (Ionicons)                                                 |
| Payment UI      | Midtrans Snap.js       | Payment popup integration                                               |

### DevOps & Tools
| Kategori        | Teknologi              | Deskripsi                                                               |
| --------------- | ---------------------- | ----------------------------------------------------------------------- |
| Version Control | Git & GitHub           | Source code management                                                  |
| Backend Deploy  | Fly.io                 | Cloud platform untuk deployment backend                                 |
| Frontend Deploy | Vercel                 | Platform deployment untuk Next.js                                       |
| API Testing     | Postman/Thunder Client | REST API testing tools                                                  |

---

## 📎 Link Deploy Website

🔗 [Katering Bu Lala](https://lala-catering.vercel.app/)

---

## 📎 Link GDrive

🔗 [Laporan Back End](https://drive.google.com/drive/folders/1RHci2y8BorgqR4ryJykzJW85flObGJpu?usp=sharing)

🔗 [Laporan Back End](https://drive.google.com/file/d/1mAsjHBpjChNknto8B63nMWqeGzhuBxyN/view?usp=drive_link)

🔗 [Link Video](https://drive.google.com/file/d/1ArR3Ju-Lzob3Nt_n9NEEdZuTBoumCqiI/view?usp=drivesdk)

