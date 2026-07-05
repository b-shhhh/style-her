import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';

export default function CartPage() {
  const { items, total, quantity, updateQuantity, removeFromCart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [status, setStatus] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const submitEsewaForm = ({ formUrl, fields }) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = formUrl;

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleCheckout = async () => {
    if (!items.length || isCheckingOut) return;
    setStatus('Processing order...');
    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          payment_method: paymentMethod,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Unable to place order');
      }

      const order = await response.json();
      if (paymentMethod === 'wallet') {
        setStatus('Opening eSewa wallet checkout...');
        const paymentResponse = await fetch('/api/payments/esewa/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        });

        if (!paymentResponse.ok) {
          const result = await paymentResponse.json();
          throw new Error(result.message || 'Unable to start eSewa payment');
        }

        const payment = await paymentResponse.json();
        clearCart();
        submitEsewaForm(payment);
      } else {
        clearCart();
        navigate('/orders');
      }
    } catch (err) {
      setStatus(err.message);
      setIsCheckingOut(false);
    }
  };

  if (!items.length) {
    return (
      <div className="page-shell">
        <div className="cart-empty-card">
          <p className="eyebrow">Your bag</p>
          <h2>Your cart is empty</h2>
          <p>Add products from the shop to start styling your look.</p>
          <Link className="primary-button" to="/home">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell cart-page">
      <div className="cart-summary-card">
        <div className="cart-header">
          <h2>Your Cart</h2>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item, index) => (
              <div key={item.id} className="cart-item">
                <div className={`cart-art ${['blush', 'sand', 'lilac'][index % 3]}`}>IMG {index + 1}</div>
                <div className="cart-item-copy">
                  <div>
                    <h3>Product Description</h3>
                    <p>Size: M · Color: {item.category}</p>
                  </div>
                  <div className="cart-actions">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button type="button" className="remove-link" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
                <span className="cart-price">${(item.quantity * Number(item.price)).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <h3>Order Summary</h3>
            <div className="summary-line">
              <span>Items ({quantity})</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Discount</span>
              <span>-$20.00</span>
            </div>
            <div className="voucher-row">
              <input placeholder="Voucher code" />
              <button type="button">Apply</button>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <span>${Math.max(0, total - 20).toFixed(2)}</span>
            </div>

            <div className="cart-footer-actions">
              <button
                className={`primary-button ${paymentMethod === 'wallet' ? 'selected-pay' : ''}`}
                type="button"
                onClick={() => setPaymentMethod('wallet')}
              >
                Pay via wallet
              </button>
              <button
                className={`primary-button ${paymentMethod === 'cod' ? 'selected-pay' : ''}`}
                type="button"
                onClick={() => setPaymentMethod('cod')}
              >
                COD
              </button>
            </div>

            {status ? <p className="status-message">{status}</p> : null}

            <button className="primary-button" type="button" onClick={handleCheckout} disabled={isCheckingOut}>
              {isCheckingOut
                ? 'Processing...'
                : paymentMethod === 'wallet'
                  ? 'Pay with eSewa'
                  : 'Place order with COD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
