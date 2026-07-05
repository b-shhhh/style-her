import { NavLink } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';
import { useAuth } from '../AuthContext.jsx';
import Sidebar from './Sidebar.jsx';

export default function Header() {
  const { quantity } = useCart();
  const { user } = useAuth();

  return (
    <header className="app-header">
      <Sidebar />

      <div className="brand-identity">
        <h1 className="brand-title">Style Her</h1>
      </div>

      <nav className="top-nav">
        <NavLink to="/cart">Cart{quantity ? ` (${quantity})` : ''}</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        {user && (
          <NavLink to="/profile" className="profile-link">
            {user.name}
          </NavLink>
        )}
      </nav>
    </header>
  );
}