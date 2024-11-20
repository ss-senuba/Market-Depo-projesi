const main_depo = require('../models/main-model');  // Ana depo modelini import ediyoruz

// Ara Depo Oluşturma
exports.create_sub = async (req, res) => {
  if (req.user.role !== "admin" || req.user.role !== "manager") {
    return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
  }

  try {
    // İstekten gelen verileri alalım
    const { name, location, mainDepoId } = req.body;

    // Ana depo ID'si boş mu kontrol edelim
    if (!mainDepoId) {
      return res.status(400).json({ message: "Ana depo ID'si belirtilmelidir." });
    }

    // Ana depo bulunuyor mu kontrol edelim
    const mainDepo = await main_depo.findById(mainDepoId);
    if (!mainDepo || mainDepo.type !== "main") {
      return res.status(404).json({ message: "Geçerli bir ana depo bulunamadı." });
    }

    // Ara depo ismi zaten var mı diye kontrol edelim
    const existingsubDepo = await main_depo.findOne({ name, mainDepo: mainDepoId });
    if (existingsubDepo) {
      return res.status(400).json({ message: "Bu adı taşıyan bir ara depo zaten mevcut." });
    }

    // Yeni ara depo oluştur
    const newSubDepo = new main_depo({
      name,
      location,
      type: 'sub',  // Ara depo türü
      products: [],  // Başlangıçta boş
      mainDepo: mainDepoId  // Ana depo ile ilişkilendirildi
    });

    // Ara depoyu veritabanına kaydediyoruz
    await newSubDepo.save();

    // Ana depoya ara depoyu ekleyelim
    if (!mainDepo.subDepos) {
      mainDepo.subDepos = [];
    }
    mainDepo.subDepos.push(newSubDepo._id);

    // Ana depoyu güncelle
    await mainDepo.save();

    res.status(201).json({
      message: "Ara depo başarıyla oluşturuldu.",
      depot: newSubDepo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Ürün Talep Etme
exports.request_product = async (req, res) => {
  try {
    // İstekten gelen verileri alalım
    const { subDepoId, productId, quantity } = req.body;

    // Kullanıcının rolü kontrol ediliyor
    if (req.user.role !== "manager" || req.user.role !== "admin") {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
    }

    // Gerekli alanlar kontrol ediliyor
    if (!subDepoId || !productId || !quantity) {
      return res.status(400).json({ message: "Tüm gerekli bilgiler sağlanmalıdır." });
    }

    // Ara depo var mı kontrol edelim
    const subDepo = await main_depo.findById(subDepoId);
    if (!subDepo || subDepo.type !== "sub") {
      return res.status(404).json({ message: "Geçerli bir ara depo bulunamadı." });
    }

    // Ana depo var mı kontrol edelim
    const mainDepo = await main_depo.findById(subDepo.mainDepo);
    if (!mainDepo || mainDepo.type !== "main") {
      return res.status(404).json({ message: "Geçerli bir ana depo bulunamadı." });
    }

    // Ana depoda ürün var mı kontrol edelim
    const product = mainDepo.products.find(
      (p) => p.productId.toString() === productId.toString()
    );

    if (!product || product.quantity < quantity) {
      return res.status(400).json({ message: "Ana depoda yeterli ürün bulunmamaktadır." });
    }

    // Ana depodan ürünü düş
    product.quantity -= quantity;

    // Ara depoya ürün ekle
    const subProductIndex = subDepo.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (subProductIndex > -1) {
      // Ürün zaten varsa miktarı artır
      subDepo.products[subProductIndex].quantity += quantity;
    } else {
      // Yeni ürün ekle
      subDepo.products.push({ productId, quantity });
    }

    // Güncellemeleri kaydet
    await mainDepo.save();
    await subDepo.save();

    res.status(200).json({
      message: "Ürün talebi başarıyla gerçekleştirildi.",
      mainDepot: mainDepo,
      subDepot: subDepo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
