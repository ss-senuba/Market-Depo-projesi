const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const auth_routes=require("./routes/auth-routes")
const main_routes=require("./routes/main-routes")
const sub_routes=require("./routes/sub-routes")
const market_routes=require("./routes/market-routes")

require("dotenv").config();

const app = express();

// Portu .env dosyasından al
const port = process.env.PORT || 5000;

// Body parser middleware
app.use(bodyParser.json());

// MongoDB bağlantısı
mongoose.connect(process.env.DB_URI)
    .then(() => console.log("MongoDB'ye başarıyla bağlanıldı"))
    .catch((error) => console.error("MongoDB bağlantı hatası:", error));


// API route'larını kullanma
app.use("/api/auth",auth_routes)
app.use("/api/main",main_routes)
app.use("/api/sub",sub_routes)
app.use("/api/market",market_routes)

// Ana test route
app.get("/", (req, res) => {
    res.json({ success: true, message: "Depo Yönetim API'sine hoş geldiniz!" });
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor...`);
});


