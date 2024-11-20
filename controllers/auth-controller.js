const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Kullanıcı Kaydı
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Aynı e-posta ile kayıtlı bir kullanıcı var mı kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Bu e-posta zaten kullanılıyor." });
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const user = new User({ username, email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu."});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Kullanıcı Girişi
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Geçersiz kimlik bilgileri." });
        }

        // Şifre doğrulama
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Geçersiz kimlik bilgileri." });
        }

        // Token oluştur
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Giriş başarılı.", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};