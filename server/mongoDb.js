import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'styleher';

const client = new MongoClient(MONGODB_URI);
let db;

export const connectDb = async () => {
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB');
};

export const getDb = () => db;

export const initializeDb = async () => {
  const db = getDb();
  
  // Check if products collection is empty
  const count = await db.collection('products').countDocuments();
  
  if (count === 0) {
    const seeds = [
      {
        name: 'Velvet Midi Dress',
        price: 68,
        category: 'dress',
        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
        description: 'A feminine midi dress with soft velvet texture and a flattering silhouette.',
        tags: ['new', 'limited'],
        created_at: new Date().toISOString(),
      },
      {
        name: 'Embroidered Crop Top',
        price: 45,
        category: 'top',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        description: 'A beautifully embroidered crop top perfect for layering.',
        tags: ['bestseller'],
        created_at: new Date().toISOString(),
      },
      {
        name: 'Tailored Blazer',
        price: 120,
        category: 'top',
        image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
        description: 'A smart blazer crafted for structured, all-day tailoring.',
        tags: ['classic', 'sale'],
        created_at: new Date().toISOString(),
      },
      {
        name: 'Saree with Blouse',
        price: 89,
        category: 'ethnic-wear',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
        description: 'Traditional saree with elegant embroidery and matching blouse.',
        tags: ['new'],
        created_at: new Date().toISOString(),
      },
      {
        name: 'High Waist Denim',
        price: 74,
        category: 'bottom',
        image: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?auto=format&fit=crop&w=900&q=80',
        description: 'Comfort stretch denim with a modern high-rise shape.',
        tags: ['popular'],
        created_at: new Date().toISOString(),
      },
    ];

    await db.collection('products').insertMany(seeds);
    console.log('Seeded products collection');
  }
};

// Products operations
export const allProducts = async (filter = {}) => {
  const db = getDb();
  return await db.collection('products').find(filter).sort({ created_at: -1 }).toArray();
};

export const getProductById = async (id) => {
  const db = getDb();
  return await db.collection('products').findOne({ _id: id });
};

export const createProduct = async (product) => {
  const db = getDb();
  const result = await db.collection('products').insertOne({
    ...product,
    created_at: new Date().toISOString(),
  });
  return await getProductById(result.insertedId);
};

export const updateProduct = async (id, updates) => {
  const db = getDb();
  await db.collection('products').updateOne(
    { _id: id },
    { $set: updates }
  );
  return await getProductById(id);
};

export const deleteProduct = async (id) => {
  const db = getDb();
  await db.collection('products').deleteOne({ _id: id });
};

// Orders operations
export const initializeOrderDb = async () => {
  // MongoDB creates collections automatically on first insert
  console.log('Orders collection ready');
};

export const createOrder = async ({ items, total, payment_method, status }) => {
  const db = getDb();
  const result = await db.collection('orders').insertOne({
    items,
    total,
    payment_method,
    status,
    created_at: new Date().toISOString(),
  });
  return await getOrder(result.insertedId);
};

export const getOrder = async (id) => {
  const db = getDb();
  return await db.collection('orders').findOne({ _id: id });
};

export const listOrders = async () => {
  const db = getDb();
  return await db.collection('orders').find().sort({ created_at: -1 }).toArray();
};

export const updateOrderStatus = async ({ id, status, payment_reference = null }) => {
  const db = getDb();
  const updateDoc = { $set: { status } };
  if (payment_reference) {
    updateDoc.$set.payment_reference = payment_reference;
  }
  await db.collection('orders').updateOne(
    { _id: id },
    updateDoc
  );
  return await getOrder(id);
};

// Users operations
export const initializeUserDb = async () => {
  // MongoDB creates collections automatically on first insert
  console.log('Users collection ready');
};

export const createUser = async ({ email, password, name, image }) => {
  const db = getDb();
  const result = await db.collection('users').insertOne({
    email,
    password,
    name,
    image: image || '/stylerher.jpg',
    created_at: new Date().toISOString(),
  });
  return await getUserById(result.insertedId);
};

export const getUserByEmail = async (email) => {
  const db = getDb();
  return await db.collection('users').findOne({ email });
};

export const getUserById = async (id) => {
  const db = getDb();
  return await db.collection('users').findOne({ _id: id });
};

export const updateUser = async (id, updates) => {
  const db = getDb();
  await db.collection('users').updateOne(
    { _id: id },
    { $set: updates }
  );
  return await getUserById(id);
};
