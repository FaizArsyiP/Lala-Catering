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

// CORS configuration - allow both localhost and production
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL, // Nanti diisi URL frontend production
] // Remove undefined values

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            // izinkan semua *.fly.dev
            const flyDomainRegex = /\.fly\.dev$/;

            if (
                allowedOrigins.includes(origin) ||
                flyDomainRegex.test(origin)
            ) {
                callback(null, true);
            } else {
                console.log("CORS BLOCK:", origin);
                callback(new Error("Not allowed by CORS"));
            }
        },
        allowedHeaders: ["Content-Type", "x-auth-token"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);
app.use(express.json());

// Koneksi ke MongoDB Atlas
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB error:", err));

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Lala Catering API is running!",
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        database:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/jadwal", jadwalRoutes);
//app.use("/api/faq", faqRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0",() => console.log(`🚀 Server running on port ${PORT}`));
