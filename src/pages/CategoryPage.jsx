import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';

// Fixed categories for the category page
const fixedCategories = ['top', 'bottom', 'dress', 'ethnic-wear'];

// Map category keys to display labels
const categoryLabels = {
  'top': 'Tops',
  'bottom': 'Bottoms',
  'dress': 'Dresses',
  'ethnic-wear': 'Ethnic Wear'
};

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
          {fixedCategories.map((cat) => (
            <Link
              key={cat}
              to={`/${cat}`}
              className={`category-rail-link ${cat === category ? 'active' : ''}`}
            >
              {categoryLabels[cat]}
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
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
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