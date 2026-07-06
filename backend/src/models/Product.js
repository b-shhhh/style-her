import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true }, // Base64 data URL
  imageName: { type: String }, // Original image filename
  description: { type: String, default: 'A stylish product made for modern users.' },
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

export const Product = mongoose.model('Product', productSchema);