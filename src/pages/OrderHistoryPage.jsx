import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error('Failed to load orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="page-shell status-message">Loading order history…</div>;
  }

  if (error) {
    return <div className="page-shell status-message">{error}</div>;
  }

  return (
    <div className="page-shell">
      <div className="order-history-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Order history</p>
            <h2>Recent purchases</h2>
          </div>
          <Link className="secondary-button" to="/home">
            Continue shopping
          </Link>
        </div>

         {orders.length ? (
           <div className="order-list">
             {orders.map((order) => (
               <div key={order._id || order.id} className="order-card">
                 <div>
                   <p className="eyebrow">Order #{order._id || order.id}</p>
                  <h3>{order.payment_method === 'wallet' ? 'eSewa payment' : 'Cash on Delivery'}</h3>
                  <p>Status: <strong>{order.status.replace('_', ' ')}</strong></p>
                </div>
                <div className="order-summary">
                  <span className="price">${Number(order.total).toFixed(2)}</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <span>{item.quantity}× {item.name}</span>
                      <span>${(item.quantity * Number(item.price)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="status-message">You have no orders yet.</div>
        )}
      </div>
    </div>
  );
}
