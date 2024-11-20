const Market = require('../models/market-model'); // Market modelini import ediyoruz

// Market Oluşturma
exports.create_market = async (req, res) => {
  try {
    // Kullanıcının rolü kontrol ediliyor
    if (req.user.role !== "admin" || req.user.role !== "person") {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }

    // İstekten gelen verileri alıyoruz
    const { name, location, linkedDepots } = req.body;

    // Gerekli alanları kontrol edelim
    if (!name || !location) {
      return res.status(400).json({ message: "Market adı ve lokasyonu gereklidir." });
    }

    // Bağlantılı depolar varsa geçerliliğini kontrol edelim
    if (linkedDepots && linkedDepots.length > 0) {
      const invalidDepots = await main_depo.find({
        _id: { $in: linkedDepots },
        type: { $nin: ["main", "sub"] },
      });

      if (invalidDepots.length > 0) {
        return res.status(400).json({ message: "Geçersiz depo bağlantıları mevcut." });
      }
    }

    // Yeni market oluşturma
    const newMarket = new Market({
      name,
      location,
      linkedDepots: linkedDepots || [], // İlişkili depolar varsa ekle, yoksa boş bırak
      products: [], // Başlangıçta boş
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

exports.request_product = async (req, res) => {
    try {
      // Kullanıcının rolü kontrol ediliyor
      if (req.user.role !== "admin" || req.user.role !== "person") {
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

