import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Laptop, Headphones, Keyboard, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCat, setHoveredCat] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching home products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const featuredProducts = products.slice(0, 4);
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }} className="animate-fade-in">

      {/* Hero Section */}
      <section
        className="glass-panel"
        style={{
          padding: '4rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'flex-start',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '2px solid rgba(99, 102, 241, 0.4)'
        }}
      >
        <span className="badge badge-info" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          Special Launch Event
        </span>
        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: '700px',
            fontFamily: 'var(--font-display)',
            color: '#1c1917'
          }}
        >
          Elevate Your Digital Lifestyle Experience in this new era,
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.15rem',
            maxWidth: '600px',
            lineHeight: 1.6,
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic'
          }}
        >
          Discover cutting-edge gadgets, designer peripherals, and premium ergonomic setups crafted for elite efficiency.
        </p>
        <Link to="/search" className="btn btn-primary" style={{ gap: '0.75rem', marginTop: '1rem', padding: '1rem 2rem' }}>
          Explore Collection
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Categories Section */}
      <section>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Shop by Category</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {[
            { name: 'Electronics', icon: <Laptop size={32} />, count: 'PC, LAPTOPS, MONITORS' },
            { name: 'Audio', icon: <Headphones size={32} />, count: 'AIRDOPES, HEADPHONES' },
            { name: 'Accessories', icon: <Keyboard size={32} />, count: 'KEYBOARD, MOUSE, PRINTER' }
          ].map(cat => (
            <Link
              key={cat.name}
              to={`/search?category=${cat.name}`}
              className="glass-panel"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                background: hoveredCat === cat.name ? 'rgba(99, 102, 241, 0.08)' : 'white',
                transform: hoveredCat === cat.name ? 'translateY(-4px)' : 'translateY(0)',
                borderColor: hoveredCat === cat.name ? 'rgba(99, 102, 241, 0.4)' : 'var(--glass-border)',
                boxShadow: hoveredCat === cat.name ? '0 8px 30px rgba(99, 102, 241, 0.15)' : '0 4px 20px rgba(0,0,0,0.08)'
              }}
              onMouseEnter={() => setHoveredCat(cat.name)}
              onMouseLeave={() => setHoveredCat(null)}
            >
              <div
                style={{
                  color: 'var(--primary-color)',
                  background: hoveredCat === cat.name ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                  padding: '1rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#1c1917' }}>{cat.name}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Featured Creations</h2>
          <Link to="/search" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Syncing inventory catalog...</div>
        ) : featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No products in stock. Check back later.</div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Brand Values */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          borderTop: '1px solid var(--glass-border)',
          paddingTop: '4rem',
          paddingBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--accent-cyan)', background: 'rgba(8, 145, 178, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <Truck size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Priority Carrier Delivery</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Free Express logistics on all store transactions exceeding ₹5000.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--primary-color)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Secure PCI Compliance</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Stripe secure gateway and encrypted tokenization safeguards your data.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--secondary-color)', background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <RefreshCw size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>30-Day Support Warranty</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>Hassle-free return policy with instant automated refund processes.</p>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>New Additions</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Syncing arrivals...</div>
        ) : newArrivals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No products found.</div>
        ) : (
          <div className="product-grid">
            {newArrivals.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Home;