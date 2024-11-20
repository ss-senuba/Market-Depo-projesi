const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Ara Depo Modeli
const sub_shema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique:true,
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'manager',  
      required: true
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'  // Depoda bulunan ürünler (Product modeline referans)
      }
    ],
    mainDepo: {  // Ana depoyu buraya ekliyoruz
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ana Depo'  // Ana depo modeline referans
    }
  },
  {
    timestamps: true  // createdAt ve updatedAt otomatik olarak eklenir
  }
);

// Modeli dışa aktarma
const sub_depo = mongoose.model('sub-depo', sub_shema);

module.exports = sub_depo;
