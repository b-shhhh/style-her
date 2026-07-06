import express from 'express';
import { createOrder, getOrder, listOrders, updateOrderStatus } from '../repositories/order.repository.js';
import { initiateEsewaPayment, decodeEsewaResponse } from '../services/payment.service.js';

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
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

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await listOrders();
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

// Initiate eSewa payment
router.post('/payments/esewa/initiate', async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: 'Order id is required' });
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentData = await initiateEsewaPayment(order, updateOrderStatus);
    res.json(paymentData);
  } catch (error) {
    if (error.message === 'This order is not configured for eSewa payment') {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Failed to start eSewa payment' });
  }
});

// eSewa payment success callback
router.all('/payments/esewa/success', async (req, res) => {
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

// eSewa payment failure callback
router.all('/payments/esewa/failure', async (req, res) => {
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

export default router;