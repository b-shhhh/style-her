import express from 'express';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Admin dashboard route
router.get('/dashboard', requireAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

// Admin products management
router.get('/products', requireAdmin, (req, res) => {
  res.json({ message: 'Admin products list' });
});

// Admin orders management
router.get('/orders', requireAdmin, (req, res) => {
  res.json({ message: 'Admin orders list' });
});

// Admin users management
router.get('/users', requireAdmin, (req, res) => {
  res.json({ message: 'Admin users list' });
});

export default router;