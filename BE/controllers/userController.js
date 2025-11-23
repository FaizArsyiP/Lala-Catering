const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
    try {
        const { nama, email, password, nomorTelepon, alamatPengiriman, role } =
            req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Email sudah terdaftar." });
        }

        const newUser = new User({
            nama,
            email,
            password,
            nomorTelepon,
            alamatPengiriman,
            loginType: "traditional",
            role: role || "pembeli",
        });
        await newUser.save();

        res.status(201).json({
            message: "Pendaftaran berhasil!",
            user: newUser,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");

        if (!user || user.loginType !== "traditional") {
            return res.status(401).json({ message: "Email salah." });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password salah." });
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            token,
            message: "Login berhasil!",
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                nomorTelepon: user.nomorTelepon,
                alamatPengiriman: user.alamatPengiriman,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        // DEBUG TOKEN
        if (!token) {
            return res
                .status(400)
                .json({ message: "Token tidak dikirim dari frontend" });
        }

        const googleResponse = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
        );

        const payload = await googleResponse.json();

        if (payload.error) {
            console.log("Google token INVALID:", payload.error);
            return res.status(401).json({ message: "Token tidak valid" });
        }

        const email = payload.email;
        const name = payload.name;

        let user = await User.findOne({ email });

        if (user && user.loginType === "traditional") {
            return res
                .status(400)
                .json({
                    message:
                        "Akun ini sudah terdaftar dengan email dan password.",
                });
        }

        if (!user) {
            user = new User({
                nama: name,
                email: email,
                loginType: "google",
                role: "pembeli",
                nomorTelepon: "000000000",
                alamatPengiriman: "MUST_UPDATE_PROFILE",
            });
            await user.save();
        }

        const jwtToken = jwt.sign(
            { user: { id: user.id, role: user.role } },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );


        res.status(200).json({
            token: jwtToken,
            message: "Login berhasil!",
            user: {
                _id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                nomorTelepon: user.nomorTelepon,
                alamatPengiriman: user.alamatPengiriman,
            },
        });
    } catch (err) {
        console.log("Catch err: ", err);
        return res
            .status(401)
            .json({ message: "Login gagal, token tidak valid." });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res
                .status(404)
                .json({ message: "Pengguna tidak ditemukan." });
        }
        res.json(user);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { nama, nomorTelepon, alamatPengiriman } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res
                .status(404)
                .json({ message: "Pengguna tidak ditemukan." });
        }

        user.nama = nama || user.nama;
        user.nomorTelepon = nomorTelepon || user.nomorTelepon;
        user.alamatPengiriman = alamatPengiriman || user.alamatPengiriman;

        await user.save();
        res.json({ message: "Profil berhasil diperbarui.", user });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getUserProfile,
    updateUserProfile,
};
