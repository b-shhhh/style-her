import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import HeroSection from '../components/HeroSection.jsx';

const categoryLinks = [
  { path: '/home', label: 'For You' },
  { path: '/top', label: 'Tops' },
  { path: '/bottom', label: 'Bottoms' },
  { path: '/dress', label: 'Dresses' },
  { path: '/ethnic-wear', label: 'Ethnic Wear' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const heroProduct = useMemo(() => products[0] || null, [products]);

  return (
    <div className="home-page-full">
      <HeroSection product={heroProduct} />

      <main className="store-layout">
        <aside className="category-rail">
          <p>Categories</p>
          {categoryLinks.map((category) => (
            <Link key={category.path} to={category.path} className="category-rail-link">
              {category.label}
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
    </div>
  );
}
