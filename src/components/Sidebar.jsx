import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Map category keys to display labels
const categoryLabels = {
  'top': 'Tops',
  'bottom': 'Bottoms',
  'dress': 'Dresses',
  'ethnic-wear': 'Ethnic Wear'
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Fetch failed');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      <button className="sidebar-toggle" type="button" onClick={() => setIsOpen(!isOpen)} aria-label="Open menu">
        Menu
      </button>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Shop</h2>
          <button
            className="sidebar-close"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <nav className="category-list">
          {loading ? (
            <div className="status-message">Loading...</div>
          ) : categories.length ? (
            categories.map((cat) => (
              <Link
                key={cat}
                to={`/${cat}`}
                className="category-link"
                onClick={() => setIsOpen(false)}
              >
                {categoryLabels[cat] || cat}
              </Link>
            ))
          ) : (
            <div className="status-message">No categories</div>
          )}
        </nav>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
