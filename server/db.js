import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.join(__dirname, 'store.db');

sqlite3.verbose();
const db = new sqlite3.Database(dbFile);

const runDb = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

const getDb = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const allDb = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

export const initializeDb = async () => {
  await runDb(
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      tags TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`
  );

  const existing = await getDb('SELECT COUNT(*) AS count FROM products');

  if (!existing || existing.count === 0) {
    const seeds = [
      {
        name: 'Velvet Midi Dress',
        price: 68,
        category: 'dress',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
        description: 'A feminine midi dress with soft velvet texture and a flattering silhouette.',
        tags: ['new', 'limited'],
      },
      {
        name: 'Embroidered Crop Top',
        price: 45,
        category: 'top',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        description: 'A beautifully embroidered crop top perfect for layering.',
        tags: ['bestseller'],
      },
      {
        name: 'Tailored Blazer',
        price: 120,
        category: 'top',
        image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
        description: 'A smart blazer crafted for structured, all-day tailoring.',
        tags: ['classic', 'sale'],
      },
      {
        name: 'Saree with Blouse',
        price: 89,
        category: 'ethnic-wear',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
        description: 'Traditional saree with elegant embroidery and matching blouse.',
        tags: ['new'],
      },
      {
        name: 'High Waist Denim',
        price: 74,
        category: 'bottom',
        image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=900&q=80',
        description: 'Comfort stretch denim with a modern high-rise shape.',
        tags: ['popular'],
      },
    ];

    for (const product of seeds) {
      await runDb(
        'INSERT INTO products (name, price, category, image, description, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          product.name,
          product.price,
          product.category,
          product.image,
          product.description,
          JSON.stringify(product.tags),
          new Date().toISOString(),
        ]
      );
    }
  }
};

export { db, runDb, getDb, allDb };
