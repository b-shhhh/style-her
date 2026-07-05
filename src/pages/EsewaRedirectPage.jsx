import { Link, useSearchParams } from 'react-router-dom';

export default function EsewaRedirectPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const isSuccess = status === 'success';

  return (
    <div className="page-shell">
      <div className={`payment-result-card ${isSuccess ? 'success' : 'failure'}`}>
        <p className="eyebrow">eSewa payment</p>
        <h2>{isSuccess ? 'Payment completed' : 'Payment was not completed'}</h2>
        <p>
          {isSuccess
            ? `Order #${orderId} has been marked as paid.`
            : 'Your order is saved, but the wallet payment did not finish. You can review it in order history.'}
        </p>
        <div className="cart-footer-actions">
          <Link className="primary-button" to="/orders">
            View orders
          </Link>
          <Link className="secondary-button" to="/home">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
