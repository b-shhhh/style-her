import { Product } from '../models/Product.js';

export const allProducts = async (filter = {}) => {
  return await Product.find(filter).sort({ created_at: -1 });
};

export const getProductById = async (id) => {
  return await Product.findById(id);
};

export const createProduct = async (product) => {
  const newProduct = new Product({
    ...product,
    created_at: new Date().toISOString(),
  });
  return await newProduct.save();
};

export const updateProduct = async (id, updates) => {
  return await Product.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteProduct = async (id) => {
  await Product.findByIdAndDelete(id);
};

export const getCategories = async () => {
  return await Product.distinct('category');
};