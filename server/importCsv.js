import { connectDb, getDb } from './mongoDb.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Generate image URL based on product name
const generateImageUrl = (name) => {
  const seed = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `https://picsum.photos/seed/${seed}/500/650`;
};

const importCsv = async () => {
  const csvFiles = ['Tops.csv', 'Bottoms.csv', 'Dress.csv', 'EthnicWear.csv'];
  const allProducts = [];

  for (const csvFile of csvFiles) {
    const csvPath = path.join(__dirname, '..', csvFile);
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n');
    
    // Skip header line
    const dataLines = lines.slice(1);
    
    const products = dataLines.map(line => {
      const [brandName, details, sizes, mrp, sellPrice, discount, category, productType] = parseCsvLine(line);
      
      // Create product name from brand and details
      const name = `${brandName} ${details}`.trim();
      
      // Use sellPrice as the price, fallback to MRP if sellPrice is empty
      const price = sellPrice ? Number(sellPrice) : Number(mrp);
      
      return {
        name,
        price: price || 0,
        category: mapCategory(productType),
        image: generateImageUrl(name),
        description: details,
        tags: ['featured'],
        created_at: new Date().toISOString(),
      };
    });
    
    allProducts.push(...products);
  }

  const db = getDb();
  
  // Clear existing products
  await db.collection('products').deleteMany({});
  
  // Insert all products
  if (allProducts.length > 0) {
    await db.collection('products').insertMany(allProducts);
    console.log(`Imported ${allProducts.length} products to MongoDB`);
  }
  
  process.exit(0);
};

connectDb()
  .then(importCsv)
  .catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
  });