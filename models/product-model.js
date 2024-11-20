const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const product_schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    depo: { type: Schema.Types.ObjectId, ref: 'MainDepo' },  // Hangi ana depoya ait olduğunu belirtir
  }
);

// Modeli dışa aktarma
const Product = mongoose.model('Product', product_schema);

module.exports = Product;
