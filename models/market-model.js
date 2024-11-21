const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Market Modeli
const market_shema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    subDepo: {  // Ara depoyu buraya ekliyoruz
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ara Depo'  // Ara depo modeline referans
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'  // Depoda bulunan ürünler (Product modeline referans)
      }
    ]
  },
  {
    timestamps: true  // createdAt ve updatedAt otomatik olarak eklenir
  }
);

// Modeli dışa aktarma
const market = mongoose.model('market', market_shema);

module.exports = market;
