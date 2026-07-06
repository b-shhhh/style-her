import { Order } from '../models/Order.js';

export const createOrder = async ({ items, total, payment_method, status }) => {
  const order = new Order({ items, total, payment_method, status });
  return await order.save();
};

export const getOrder = async (id) => {
  return await Order.findById(id);
};

export const listOrders = async () => {
  return await Order.find().sort({ created_at: -1 });
};

export const updateOrderStatus = async ({ id, status, payment_reference = null }) => {
  const updateDoc = { status };
  if (payment_reference) {
    updateDoc.payment_reference = payment_reference;
  }
  return await Order.findByIdAndUpdate(id, updateDoc, { new: true });
};