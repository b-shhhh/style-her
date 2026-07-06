import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.status === 404) {
          setError('Product not found');
          setProduct(null);
        } else if (!response.ok) {
          throw new Error('Unable to load product');
        } else {
          const data = await response.json();
          setProduct({
            ...data,
            tags: Array.isArray(data.tags) ? data.tags : JSON.parse(data.tags || '[]'),
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="page-shell status-message">Loading product details…</div>;
  }

  if (error) {
    return (
      <div className="page-shell status-message">
        <p>{error}</p>
        <button className="action-button" type="button" onClick={() => navigate(-1)}>
          Back to shop
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  return (
    <div className="page-shell detail-page">
      <div className="detail-hero">
        <div>
          <p className="eyebrow">{product.category}</p>
          <h2>{product.name}</h2>
          <p className="hero-description">{product.description}</p>
          <div className="price-row">
            <span className="price">₹{Number(product.price).toFixed(2)}</span>
            <button className="primary-button" type="button" onClick={handleAddToCart}>
              Add to bag
            </button>
          </div>
          <div className="tag-list">
            {product.tags.map((tag) => (
              <span key={tag} className="tag-label">
                {tag}
              </span>
            ))}
          </div>
          <div className="detail-actions">
            <Link className="secondary-button" to="/home">
              Back to shop
            </Link>
          </div>
        </div>
        <img className="detail-image" src={product.image} alt={product.name} />
      </div>

      <div className="detail-panel">
        <section className="product-section">
          <h3>Highlights</h3>
          <p>{product.description}</p>
        </section>
        <section className="product-section">
          <h3>Suitable for</h3>
          <ul>
            <li>Style-forward wardrobes</li>
            <li>Gift-ready packaging</li>
            <li>All-season versatility</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
