import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';

const categories = [
  { path: '/home', label: 'For You', key: 'home' },
  { path: '/top', label: 'Tops', key: 'top' },
  { path: '/bottom', label: 'Bottoms', key: 'bottom' },
  { path: '/dress', label: 'Dresses', key: 'dress' },
  { path: '/ethnic-wear', label: 'Ethnic Wear', key: 'ethnic-wear' },
];

export default function CategoryPage({ category, title }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?category=${category}`);
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
  }, [category]);

  return (
    <div className="category-page">
      <main className="store-layout">
        <aside className="category-rail">
          <p>Categories</p>
          {categories.map((cat) => (
            <Link
              key={cat.path}
              to={cat.path}
              className={`category-rail-link ${cat.key === category ? 'active' : ''}`}
            >
              {cat.label}
            </Link>
          ))}
        </aside>

        <section className="products-overview">
          <div className="section-header">
            <h2>{title}</h2>
            <span className="product-count">{products.length} items</span>
          </div>

          {loading ? (
            <div className="status-message">Loading products...</div>
          ) : products.length ? (
            <div className="product-grid figma-grid-large">
              {products.concat(products).slice(0, 8).map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={{ ...product, id: index + 1 }} />
              ))}
            </div>
          ) : (
            <div className="status-message">No products in this category.</div>
          )}
        </section>
      </main>
    </div>
  );
}
