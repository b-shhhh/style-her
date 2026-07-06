import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [{ type: mongoose.Schema.Types.Mixed, required: true }],
  total: { type: Number, required: true },
  payment_method: { type: String, required: true },
  status: { type: String, required: true },
  payment_reference: { type: String },
  created_at: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', orderSchema);