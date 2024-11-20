const Product = require('../models/product-model');
const MainDepo = require('../models/main-model');

//Ürün ekleme
exports.create_product = async (req, res) => {
  try {
    const { name, price, quantity, mainDepoId } = req.body;

    // Gerekli alanların kontrolü
    if (!name || price == null || quantity == null || !mainDepoId) {
      return res.status(400).json({ message: "Tüm gerekli alanlar doldurulmalıdır." });
    }

    // Ana depo bulunuyor mu kontrol edelim
    const mainDepo = await MainDepo.findById(mainDepoId);
    if (!mainDepo) {
      return res.status(404).json({ message: "Geçerli bir ana depo bulunamadı." });
    }

    // Yeni ürün oluşturma
    const newProduct = new Product({ name, price, quantity, depo: mainDepoId });
    await newProduct.save();

    // Ana depoya ürünü ekleyelim
    mainDepo.products.push(newProduct._id);
    await mainDepo.save();

    res.status(201).json({
      message: "Ürün başarıyla oluşturuldu ve ana depoya eklendi.",
      product: newProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//Ürün güncelleme
exports.update_product = async (req, res) => {
    try {
      const { id, name, price, quantity } = req.body;  // JSON body'den id, name, price, quantity alıyoruz
  
      // Gerekli alanların kontrolü
      if (!id) {
        return res.status(400).json({ message: "Ürün ID'si belirtilmelidir." });
      }
  
      // Ürün ID'sine göre ürünü buluyoruz
      const updatedProduct = await Product.findByIdAndUpdate(id, { name, price, quantity }, { new: true });
  
      if (!updatedProduct) {
        return res.status(404).json({ message: "Ürün bulunamadı." });
      }
  
      res.status(200).json({
        message: "Ürün başarıyla güncellendi.",
        product: updatedProduct
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  
//Todo burası olmuyor
//Ürün silme 
exports.delete_product = async (req, res) => {
    try {
      const { id } = req.body;  // JSON body'den ürün ID'sini alıyoruz
  
      if (!id) {
        return res.status(400).json({ message: "Silinecek ürün ID'si belirtilmelidir." });
      }
  
      // Ürün ID'sine göre ürünü buluyoruz
      const productToDelete = await Product.findById(id);
      if (!productToDelete) {
        return res.status(404).json({ message: "Ürün bulunamadı." });
      }
  
      // Ana depoyu bulup, ürünün ID'sini products dizisinden kaldırıyoruz
      const mainDepo = await MainDepo.findById(productToDelete.depo);
      if (mainDepo) {
        // Ana depodan ürünü kaldırıyoruz
        mainDepo.products.pull(productToDelete._id);
        await mainDepo.save();
      }
  
      // Ürünü veritabanından siliyoruz
      await productToDelete.findByIdAndDelete(id);
  
      res.status(200).json({
        message: "Ürün başarıyla silindi."
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  