import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/styleher';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, default: 'A stylish product made for modern users.' },
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

// Product model
const Product = mongoose.model('Product', productSchema);

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

// Generate image URL based on image filename
const generateImageUrl = (imageFilename) => {
  if (imageFilename) {
    return `/fashion_images_export/${imageFilename}`;
  }
  return 'https://via.placeholder.com/900x600?text=Product';
};

const importCsv = async () => {
  const csvFile = 'fashion_dataset.csv';
  const allProducts = [];

  const csvPath = path.join(__dirname, '..', csvFile);
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
      image: generateImageUrl(imageFilename),
      description: description || 'A stylish product made for modern users.',
      tags: ['featured'],
      created_at: new Date().toISOString(),
    };
  });
  
  allProducts.push(...products);

  // Clear existing products and re-import
  await Product.deleteMany({});
  
  // Insert all products
  if (allProducts.length > 0) {
    await Product.insertMany(allProducts);
    console.log(`Re-imported ${allProducts.length} products from fashion_dataset.csv`);
  }
  
  process.exit(0);
};

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB with Mongoose');
    return importCsv();
  })
  .catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
  });