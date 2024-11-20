const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    // Authorization başlığını alıyoruz
    const token = req.header("Authorization");

    // Authorization başlığı yoksa veya boşsa 401 hatası dönüyoruz
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Yetkisiz erişim" });
    }

    // Token'ı "Bearer " kısmından temizliyoruz
    const cleanedToken = token.replace("Bearer ", "");

    try {
        // Token'ı doğruluyoruz
        const decoded = jwt.verify(cleanedToken, process.env.JWT_SECRET);
        req.user = decoded; // Kullanıcı bilgilerini request'e ekliyoruz
        next(); // Middleware zincirine devam ediyoruz
    } catch (err) {
        // Token geçersizse hata döndürüyoruz
        res.status(401).json({ message: "Geçersiz token" });
    }
};

