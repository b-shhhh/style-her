import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';

// Fixed categories for the splash page
const fixedCategories = ['top', 'bottom', 'dress', 'ethnic-wear'];

// Map category keys to display labels
const categoryLabels = {
  'top': 'Tops',
  'bottom': 'Bottoms',
  'dress': 'Dresses',
  'ethnic-wear': 'Ethnic Wear'
};

export default function SplashPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const openShop = () => {
    navigate(user ? '/home' : '/login');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="splash-page">
      <header className="splash-topbar">
        <div className="brand-title red-text">Style Her</div>
        <nav>
          <Link to="/login" className="red-text">Login</Link>
          <Link to="/register" className="red-text">Register</Link>
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
          {fixedCategories.map((category) => (
            <Link
              key={category}
              to={`/${category}`}
              className="category-rail-link"
            >
              {categoryLabels[category]}
            </Link>
          ))}
        </aside>

        <section className="products-overview">
          <div className="section-header">
            <h2>Products</h2>
            <span className="product-count">View all +</span>
          </div>
          {loading ? (
            <div className="status-message">Loading products...</div>
          ) : products.length ? (
            <div className="product-grid">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="status-message">No products available.</div>
          )}
        </section>
      </main>

      <div className="figma-bottom-bar">
        <span>© Style Her</span>
        <span>All rights reserved</span>
      </div>
    </div>
  );
}