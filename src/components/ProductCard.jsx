import { Link } from 'react-router-dom';

const tileClasses = ['blush', 'sand', 'lilac', 'ochre', 'clay', 'sage', 'rose', 'lavender'];

export default function ProductCard({ product }) {
  // MongoDB uses _id, convert to string for display
  const productId = product._id || product.id;
  const tileClass = tileClasses[(Number(productId) - 1) % tileClasses.length];

  return (
    <Link to={`/product/${productId}`} className="product-card">
      <div className={`product-art ${tileClass}`}>
        <span>IMG {productId}</span>
        <span className="heart-dot">♡</span>
      </div>
      <div className="product-card-content">
        <h3>Product Name</h3>
        <p>{product.name}</p>
        <span className="product-price">${Number(product.price).toFixed(2)}</span>
        <span className="add-dot">+</span>
      </div>
    </Link>
  );
}
