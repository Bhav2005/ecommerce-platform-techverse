import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const totalCartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <ShoppingBag size={24} style={{ stroke: 'url(#brand-grad)' }} />
        <svg width="0" height="0">
          <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </svg>
        <span>TechVerse</span>
      </Link>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/search" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            Explore Products
          </NavLink>
        </li>
        {user && user.role === 'admin' && (
          <li>
            <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LayoutDashboard size={16} />
              Admin Portal
            </NavLink>
          </li>
        )}
      </ul>

      <div className="nav-actions">
        <Link to="/cart" className="cart-icon-btn" title="View Cart">
          <ShoppingCart size={22} />
          {totalCartQty > 0 && <span className="cart-badge">{totalCartQty}</span>}
        </Link>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={18} />
              <span style={{ fontSize: '0.95rem' }}>{user.username}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem' }}
            >
              <LogOut size={14} />
              Log Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="nav-link" style={{ fontSize: '0.95rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
