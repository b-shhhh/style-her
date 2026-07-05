import express from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { connectDb, initializeDb, allProducts, getProductById, createProduct, updateProduct, deleteProduct } from './mongoDb.js';
import { createOrder, getOrder, initializeOrderDb, listOrders, updateOrderStatus } from './mongoDb.js';
import { ObjectId } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${PORT}`;
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_FORM_URL =
  process.env.ESEWA_FORM_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductById(new ObjectId(req.params.id));
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
    const product = await getProductById(new ObjectId(req.params.id));
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

    const updated = await updateProduct(new ObjectId(req.params.id), updates);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await getProductById(new ObjectId(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await deleteProduct(new ObjectId(req.params.id));
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
    const order = await getOrder(new ObjectId(orderId));
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
        id: new ObjectId(orderId),
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
      await updateOrderStatus({ id: new ObjectId(orderId), status: 'payment_failed' });
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
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed', error);
    process.exit(1);
  });
