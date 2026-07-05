import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

const previewProducts = [
  { id: 1, price: 42, name: 'Rose Wrap Top' },
  { id: 2, price: 58, name: 'Linen Wide Pants' },
  { id: 3, price: 76, name: 'Two Silk Dress' },
  { id: 4, price: 64, name: 'Embroidered Kurta' },
];

export default function SplashPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const openShop = () => {
    navigate(user ? '/home' : '/login');
  };

  return (
    <div className="splash-page">
      <header className="splash-topbar">
        <div className="brand-title">Style Her</div>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="hero-section splash-hero">
        <div className="hero-copy">
          <p className="eyebrow">New season edit</p>
          <h1>Style for Every Woman</h1>
          <p className="hero-description">
            Curated fits for every mood and moment, from everyday tops to festive ethnic wear, all in one wardrobe.
          </p>
          <button className="primary-button" type="button" onClick={openShop}>
            Shop the edit
          </button>
        </div>
      </section>

      <main className="store-layout splash-store">
        <aside className="category-rail">
          <p>Categories</p>
          <span className="category-rail-link active">All Products</span>
          <span className="category-rail-link">For You</span>
          <span className="category-rail-link">Tops</span>
          <span className="category-rail-link">Bottoms</span>
          <span className="category-rail-link">Dresses</span>
          <span className="category-rail-link">Ethnic Wear</span>
        </aside>

        <section className="products-overview">
          <div className="section-header">
            <h2>Products</h2>
            <span className="product-count">View all +</span>
          </div>
          <div className="product-grid">
            {previewProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className={`product-art ${['blush', 'sand', 'lilac', 'ochre'][product.id - 1]}`}>
                  IMG {product.id}
                  <span className="heart-dot">♡</span>
                </div>
                <div className="product-card-content">
                  <h3>Product Name</h3>
                  <p>{product.name}</p>
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <span className="add-dot">+</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="figma-bottom-bar">
        <span>© Style Her</span>
        <span>All rights reserved</span>
      </div>
    </div>
  );
}
