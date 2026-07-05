import { Link } from 'react-router-dom';

const tileClasses = ['blush', 'sand', 'lilac', 'ochre', 'clay', 'sage', 'rose', 'lavender'];

export default function ProductCard({ product }) {
  // MongoDB uses _id, convert to string for display
  const productId = product._id || product.id;
  const tileClass = tileClasses[(Number(productId) - 1) % tileClasses.length];

  return (
    <Link to={`/product/${productId}`} className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-card-content">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <span className="product-price">${Number(product.price).toFixed(2)}</span>
        <span className="add-dot">+</span>
      </div>
    </Link>
  );
}
