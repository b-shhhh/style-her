import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/products.route.js';
import orderRoutes from './routes/orders.route.js';
import adminRoutes from './routes/admin/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/styleher';

export const connectDb = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB with Mongoose');
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../../dist');
const rootDir = path.join(__dirname, '../..');

app.use(express.static(rootDir));
app.use(express.static(clientDist));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
