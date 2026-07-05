import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { id: 'home', label: 'For You', path: '/home' },
    { id: 'dress', label: 'Dresses', path: '/dress' },
    { id: 'top', label: 'Tops', path: '/top' },
    { id: 'bottom', label: 'Bottoms', path: '/bottom' },
    { id: 'ethnic-wear', label: 'Ethnic Wear', path: '/ethnic-wear' },
  ];

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
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.path}
              className="category-link"
              onClick={() => setIsOpen(false)}
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
}
