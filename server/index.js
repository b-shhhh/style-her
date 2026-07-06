import express from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { connectDb, initializeDb, allProducts, getProductById, createProduct, updateProduct, deleteProduct, initializeUserDb, createUser, getUserByEmail, getUserById, updateUser, deleteUser, Product } from './mongoDb.js';
import { createOrder, getOrder, initializeOrderDb, listOrders, updateOrderStatus } from './mongoDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${PORT}`;
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_FORM_URL =
  process.env.ESEWA_FORM_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/products', async (req, res) => {
  const { search, category } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  if (category && category !== 'all') {
    filter.category = { $regex: `^${category}$`, $options: 'i' };
  }

  try {
    const products = await allProducts(filter);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load products' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load product' });
  }
});

// Map category names from form to database format
const mapCategory = (cat) => {
  const categoryMap = {
    'Tops': 'top',
    'Dresses': 'dress',
    'Ethnic Wear': 'ethnic-wear',
    'Bottoms': 'bottom'
  };
  return categoryMap[cat] || cat.toLowerCase();
};

app.post('/api/products', async (req, res) => {
  const { name, price, category, image, description, tags } = req.body;
  if (!name || price === undefined || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }

  try {
    const product = await createProduct({
      name,
      price: Number(price),
      category: mapCategory(category),
      image: image || 'https://via.placeholder.com/900x600?text=Product',
      description: description || 'A stylish product made for modern users.',
      tags: tags || ['featured'],
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { name, price, category, image, description, tags } = req.body;
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = {
      name: name ?? product.name,
      price: price !== undefined ? Number(price) : product.price,
      category: category ?? product.category,
      image: image ?? product.image,
      description: description ?? product.description,
      tags: tags ?? product.tags,
    };

    const updated = await updateProduct(req.params.id, updates);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await deleteProduct(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { items, total, payment_method } = req.body;

  if (!Array.isArray(items) || items.length === 0 || total === undefined || !payment_method) {
    return res.status(400).json({ message: 'Invalid order payload' });
  }

  try {
    const status = payment_method === 'wallet' ? 'payment_pending' : 'cod_pending';
    const order = await createOrder({ items, total, payment_method, status });
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await listOrders();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

const toMoney = (value) => Number(value).toFixed(2);

const createEsewaSignature = (fields) => {
  const signedPayload = fields.signed_field_names
    .split(',')
    .map((fieldName) => `${fieldName}=${fields[fieldName]}`)
    .join(',');

  return crypto.createHmac('sha256', ESEWA_SECRET_KEY).update(signedPayload).digest('base64');
};

const decodeEsewaResponse = (encodedData) => {
  if (!encodedData) return null;
  try {
    return JSON.parse(Buffer.from(encodedData, 'base64').toString('utf8'));
  } catch {
    return null;
  }
};

app.post('/api/payments/esewa/initiate', async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Order id is required' });
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment_method !== 'wallet') {
      return res.status(400).json({ message: 'This order is not configured for eSewa payment' });
    }

    const transactionUuid = `STYLEHER-${order._id}-${Date.now()}`;
    const amount = toMoney(order.total);
    const fields = {
      amount,
      tax_amount: '0.00',
      total_amount: amount,
      transaction_uuid: transactionUuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: '0.00',
      product_delivery_charge: '0.00',
      success_url: `${CLIENT_URL}/api/payments/esewa/success?orderId=${order._id}`,
      failure_url: `${CLIENT_URL}/api/payments/esewa/failure?orderId=${order._id}`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
    };

    fields.signature = createEsewaSignature(fields);

    await updateOrderStatus({
      id: order._id,
      status: 'payment_started',
      payment_reference: transactionUuid,
    });

    res.json({
      formUrl: ESEWA_FORM_URL,
      fields,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to start eSewa payment' });
  }
});

app.all('/api/payments/esewa/success', async (req, res) => {
  const orderId = req.query.orderId;
  const paymentData = decodeEsewaResponse(req.query.data || req.body?.data);
  const paymentReference = paymentData?.transaction_uuid || paymentData?.transaction_code || null;

  if (orderId) {
    try {
      await updateOrderStatus({
        id: orderId,
        status: 'paid',
        payment_reference: paymentReference,
      });
    } catch (error) {
      console.error(error);
    }
  }

  res.redirect(`/esewa?status=success&orderId=${orderId || ''}`);
});

app.all('/api/payments/esewa/failure', async (req, res) => {
  const orderId = req.query.orderId;

  if (orderId) {
    try {
      await updateOrderStatus({ id: orderId, status: 'payment_failed' });
    } catch (error) {
      console.error(error);
    }
  }

  res.redirect(`/esewa?status=failure&orderId=${orderId || ''}`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../dist');
const rootDir = path.join(__dirname, '..');

// Authentication API endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, phone, image } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  try {
    const existing = await getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await createUser({ email, password, name, phone, image });
    res.status(201).json({ id: user._id, email: user.email, name: user.name, phone: user.phone, image: user.image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await getUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ id: user._id, email: user.email, name: user.name, phone: user.phone, address: user.address, image: user.image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  const { userId, name, email, phone, address, image } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updated = await updateUser(userId, { name, email, phone, address, image });
    res.json({ id: updated._id, email: updated.email, name: updated.name, phone: updated.phone, address: updated.address, image: updated.image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

app.delete('/api/auth/profile', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await deleteUser(userId);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete profile' });
  }
});

// Serve static files from root (for stylerher.jpg)
app.use(express.static(rootDir));
// Serve static files from dist
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

connectDb()
  .then(() => initializeDb())
  .then(() => initializeOrderDb())
  .then(() => initializeUserDb())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed', error);
    process.exit(1);
  });