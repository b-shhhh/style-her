import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/styleher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Product Schema with image as binary data
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

// Order Schema
const orderSchema = new mongoose.Schema({
  items: [{ type: mongoose.Schema.Types.Mixed, required: true }],
  total: { type: Number, required: true },
  payment_method: { type: String, required: true },
  status: { type: String, required: true },
  payment_reference: { type: String },
  created_at: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, default: '/stylerher.jpg' },
  phone: { type: String },
  address: { type: String },
  created_at: { type: Date, default: Date.now }
});

// Product model
export const Product = mongoose.model('Product', productSchema);

// Order model
export const Order = mongoose.model('Order', orderSchema);

// User model
export const User = mongoose.model('User', userSchema);

export const connectDb = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB with Mongoose');
};

export const getDb = () => mongoose.connection;

// Parse CSV line handling quoted fields
const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

// Map product type to category
const mapCategory = (productType) => {
  const categoryMap = {
    'Tops': 'top',
    'Dress': 'dress',
    'Dresses': 'dress',
    'Ethnic Wear': 'ethnic-wear',
    'Bottoms': 'bottom'
  };
  return categoryMap[productType] || productType.toLowerCase();
};

// Read image file and convert to base64 data URL
const getImageDataUrl = (imageFilename) => {
  if (!imageFilename) {
    return 'https://via.placeholder.com/900x600?text=Product';
  }
  
  const imagePath = path.join(__dirname, '..', 'fashion_images_export', imageFilename);
  
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Data = imageBuffer.toString('base64');
    const mimeType = imageFilename.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error(`Error reading image ${imageFilename}:`, error.message);
    return 'https://via.placeholder.com/900x600?text=Product';
  }
};

export const initializeDb = async () => {
  // Check if products collection is empty
  const count = await Product.countDocuments();
  
  if (count === 0) {
    // Import from fashion_dataset.csv
    const csvPath = path.join(__dirname, '..', 'fashion_dataset.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    // Skip header line
    const dataLines = lines.slice(1);
    
    const products = dataLines.map(line => {
      const [category, productName, price, description, imageFilename] = parseCsvLine(line);
      
      return {
        name: productName || 'Unnamed Product',
        price: Number(price) || 0,
        category: mapCategory(category),
        image: getImageDataUrl(imageFilename),
        imageName: imageFilename,
        description: description || 'A stylish product made for modern users.',
        tags: ['featured'],
        created_at: new Date().toISOString(),
      };
    });
    
    if (products.length > 0) {
      await Product.insertMany(products);
      console.log(`Imported ${products.length} products from fashion_dataset.csv with images`);
    }
  } else {
    console.log('Products already exist in database');
  }
};

// Products operations
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

// Orders operations
export const initializeOrderDb = async () => {
  console.log('Orders collection ready');
};

export const createOrder = async ({ items, total, payment_method, status }) => {
  const order = new Order({ items, total, payment_method, status });
  return await order.save();
};

export const getOrder = async (id) => {
  return await Order.findById(id);
};

export const listOrders = async () => {
  return await Order.find().sort({ created_at: -1 });
};

export const updateOrderStatus = async ({ id, status, payment_reference = null }) => {
  const updateDoc = { status };
  if (payment_reference) {
    updateDoc.payment_reference = payment_reference;
  }
  return await Order.findByIdAndUpdate(id, updateDoc, { new: true });
};

// Users operations
export const initializeUserDb = async () => {
  console.log('Users collection ready');
};

export const createUser = async ({ email, password, name, image }) => {
  const user = new User({ email, password, name, image });
  return await user.save();
};

export const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const updateUser = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteUser = async (id) => {
  await User.findByIdAndDelete(id);
};