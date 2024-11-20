const main_depo = require('../models/main-model'); // Ana depo modelini import ediyoruz

// Ana Depo Oluşturma
exports.create_main = async (req, res) => {
  // Sadece admin ve manager yetkisi kontrol ediliyor
  if (req.user.role !== "admin" ) {
    return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok." });
  }

  try {
    // İstekten gelen verileri alıyoruz
    const { name, location } = req.body;

    // Gerekli alanların varlığını kontrol edelim
    if (!name && !location) {
      return res.status(400).json({ message: "Tüm alanlar doldurulmalıdır." });
    }

    // Aynı isimde bir ana depo var mı kontrol edelim
    const existingMainDepo = await main_depo.findOne({ name, type: 'main' });
    if (existingMainDepo) {
      return res.status(400).json({ message: "Bu adı taşıyan bir ana depo zaten mevcut." });
    }

    // Yeni ana depo oluşturma
    const newMainDepo = new main_depo({
      name,
      location,
      type: 'main', // Ana depo türü
      products: [], // Başlangıçta boş
      subDepos: []  // Bağlı ara depolar başlangıçta boş
    });

    // Veritabanına kaydet
    await newMainDepo.save();

    res.status(201).json({
      message: "Ana depo başarıyla oluşturuldu.",
      depot: newMainDepo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

