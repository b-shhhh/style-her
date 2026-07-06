import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';

// Map category keys to display labels
const categoryLabels = {
  'top': 'Tops',
  'bottom': 'Bottoms',
  'dress': 'Dresses',
  'ethnic-wear': 'Ethnic Wear'
};

export default function CategoryPage({ category, title }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

    fetchProducts();
    fetchCategories();
  }, [category]);

  return (
    <div className="category-page">
      <main className="store-layout">
        <aside className="category-rail">
          <p>Categories</p>
          {loadingCategories ? (
            <div className="status-message">Loading categories...</div>
          ) : categories.length ? (
            categories.map((cat) => (
              <Link
                key={cat}
                to={`/${cat}`}
                className={`category-rail-link ${cat === category ? 'active' : ''}`}
              >
                {categoryLabels[cat] || cat}
              </Link>
            ))
          ) : (
            <div className="status-message">No categories available.</div>
          )}
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
