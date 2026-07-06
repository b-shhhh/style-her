import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import HeroSection from '../components/HeroSection.jsx';

// Map category keys to display labels
const categoryLabels = {
  'top': 'Tops',
  'bottom': 'Bottoms',
  'dress': 'Dresses',
  'ethnic-wear': 'Ethnic Wear'
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Fetch failed');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const heroProduct = useMemo(() => products[0] || null, [products]);

  return (
    <div className="home-page-full">
      <HeroSection product={heroProduct} />

      <main className="store-layout">
        <aside className="category-rail">
          <p>Categories</p>
          {loadingCategories ? (
            <div className="status-message">Loading categories...</div>
          ) : categories.length ? (
            categories.map((category) => (
              <Link
                key={category}
                to={`/${category}`}
                className="category-rail-link"
              >
                {categoryLabels[category] || category}
              </Link>
            ))
          ) : (
            <div className="status-message">No categories available.</div>
          )}
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
