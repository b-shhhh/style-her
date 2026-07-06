import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, default: '/stylerher.jpg' },
  phone: { type: String },
  address: { type: String },
  created_at: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);