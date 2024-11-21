const Market = require('../models/market-model'); // Market modelini import ediyoruz
const sub_depo=require("../models/sub-model")

//Todo
//Market Oluşturma 
exports.create_market = async (req, res) => {
  try {
    // Kullanıcının rolü kontrol ediliyor
    if (req.user.role == "manager") {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }

    // İstekten gelen verileri alıyoruz
    const { name, location, subDepo } = req.body;

    // Gerekli alanları kontrol edelim
    if (!name || !location || !subDepo) {
      return res.status(400).json({ message: "Market adı, lokasyon ve ara depo gereklidir." });
    }

    // SubDepo alanı varsa geçerliliğini kontrol edelim
    if (subDepo) {
      const invalidSubDepo = await sub_depo.findOne({ _id: subDepo, match: { type: "sub" } });
      if (!invalidSubDepo) {
        console.log(invalidSubDepo)
        return res.status(400).json({ message: "Geçersiz ara depo bağlantısı." });
      }
    }

    // Yeni market oluşturma
    const newMarket = new Market({
      name,
      location,
      subDepo, // Ana depo (subDepo)
      products: products || [], // Başlangıçta ürünler boş
    });

    // Marketi veritabanına kaydet
    await newMarket.save();

    res.status(201).json({
      message: "Market başarıyla oluşturuldu.",
      market: newMarket,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//Todo
//Ürün talep etme
exports.request_product = async (req, res) => {
  try {

    // Kullanıcının rolü kontrol ediliyor
    if (req.user.role == "manager") {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }

    // İstekten gelen verileri alıyoruz
    const { marketId, subDepoId, productId, quantity } = req.body;

    // Gerekli alanlar kontrol ediliyor
    if (!marketId || !subDepoId || !productId || !quantity) {
      return res.status(400).json({ message: "Tüm gerekli bilgiler sağlanmalıdır." });
    }

    // Marketi kontrol et
    const market = await Market.findById(marketId);
    if (!market) {
      return res.status(404).json({ message: "Geçerli bir market bulunamadı." });
    }

    // Ara depoyu kontrol et
    const subDepo = await main_depo.findById(subDepoId);
    if (!subDepo || subDepo.type !== "sub") {
      return res.status(404).json({ message: "Geçerli bir ara depo bulunamadı." });
    }

    // Ara depoda ürün var mı kontrol et
    const product = subDepo.products.find(
      (p) => p.productId.toString() === productId.toString()
    );

    if (!product || product.quantity < quantity) {
      return res.status(400).json({ message: "Ara depoda yeterli ürün bulunmamaktadır." });
    }

    // Ara depodan ürünü düş
    product.quantity -= quantity;

    // Marketin stoklarını güncelle
    const marketProductIndex = market.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (marketProductIndex > -1) {
      // Ürün zaten varsa miktarı artır
      market.products[marketProductIndex].quantity += quantity;
    } else {
      // Yeni ürün ekle
      market.products.push({ productId, quantity });
    }

    // Güncellemeleri kaydet
    await subDepo.save();
    await market.save();

    res.status(200).json({
      message: "Ürün talebi başarıyla gerçekleştirildi.",
      market,
      subDepot: subDepo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

