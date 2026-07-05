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

const importCsv = async () => {
  const csvPath = path.join(__dirname, '..', 'products_dataset.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.trim().split('\n');
  
  // Skip header line
  const dataLines = lines.slice(1);
  
const products = dataLines.map(line => {
    const [id, category, name, description, price, image] = parseCsvLine(line);
    // Map CSV categories to match frontend expectations
    const categoryMap = {
      'Tops': 'top',
      'Dresses': 'dress',
      'Ethnic Wear': 'ethnic-wear',
      'Bottoms': 'bottom'
    };
    return {
      name,
      price: Number(price),
      category: categoryMap[category] || category.toLowerCase(),
      image,
      description,
      tags: ['featured'],
      created_at: new Date().toISOString(),
    };
  });
  
  const db = getDb();
  
  // Clear existing products
  await db.collection('products').deleteMany({});
  
  // Insert all products
  if (products.length > 0) {
    await db.collection('products').insertMany(products);
    console.log(`Imported ${products.length} products to MongoDB`);
  }
  
  process.exit(0);
};

connectDb()
  .then(importCsv)
  .catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
  });