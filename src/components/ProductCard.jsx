import { Link } from 'react-router-dom';

const tileClasses = ['blush', 'sand', 'lilac', 'ochre', 'clay', 'sage', 'rose', 'lavender'];

export default function ProductCard({ product }) {
  // MongoDB uses _id, convert to string for display
  const productId = product._id ? product._id.toString() : product.id;
  const tileClass = tileClasses[Math.abs(productId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) - 1) % tileClasses.length];

  return (
    <Link to={`/product/${productId}`} className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-card-content">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span className="product-price">₹{Number(product.price).toFixed(2)}</span>
        <span className="add-dot">+</span>
      </div>
    </Link>
  );
}