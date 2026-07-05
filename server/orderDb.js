import { runDb, getDb, allDb } from './db.js';

export const initializeOrderDb = async () => {
  await runDb(
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      payment_reference TEXT,
      created_at TEXT NOT NULL
    );`
  );

  try {
    await runDb('ALTER TABLE orders ADD COLUMN payment_reference TEXT');
  } catch (error) {
    if (!String(error.message).includes('duplicate column name')) {
      throw error;
    }
  }
};

export const createOrder = async ({ items, total, payment_method, status }) => {
  const result = await runDb(
    'INSERT INTO orders (items, total, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [JSON.stringify(items), total, payment_method, status, new Date().toISOString()]
  );
  return getDb('SELECT * FROM orders WHERE id = ?', [result.lastID]);
};

const hydrateOrder = (order) => {
  if (!order) return order;
  return {
    ...order,
    items: JSON.parse(order.items || '[]'),
  };
};

export const listOrders = async () => {
  const orders = await allDb('SELECT * FROM orders ORDER BY created_at DESC', []);
  return orders.map(hydrateOrder);
};

export const getOrder = async (id) => {
  const order = await getDb('SELECT * FROM orders WHERE id = ?', [Number(id)]);
  return hydrateOrder(order);
};

export const updateOrderStatus = async ({ id, status, payment_reference = null }) => {
  await runDb(
    'UPDATE orders SET status = ?, payment_reference = COALESCE(?, payment_reference) WHERE id = ?',
    [status, payment_reference, Number(id)]
  );
  return getOrder(id);
};
