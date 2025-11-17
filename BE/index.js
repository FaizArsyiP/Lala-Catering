const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const menuRoutes = require("./routes/menuItemRoutes");
// const notificationRoutes = require("./routes/notificationRoutes");
const jadwalRoutes = require("./routes/jadwalRoutes");
// const faqRoutes = require("./routes/faqRoutes");

const app = express();
app.use(cors({
  origin: "*", // Allow all origins untuk testing (ganti dengan domain spesifik di production)
  credentials: true,
  allowedHeaders: ["Content-Type", "x-auth-token"],  // <-- WAJIB
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

// Koneksi ke MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/jadwal", jadwalRoutes);
//app.use("/api/faq", faqRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));