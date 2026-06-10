import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, Percent, X } from 'lucide-react';

export const Cart = () => {
  const {
    cartItems,
    removeItemFromCart,
    updateCartQuantity,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    getCartTotals
  } = useContext(CartContext);

  const [couponCodeInput, setCouponCodeInput] = useState('');

  const { subtotal, discount, total } = getCartTotals();

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const success = await applyCoupon(couponCodeInput);
    if (success) {
      setCouponCodeInput('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '5rem 2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '2rem auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}
      >
        <ShoppingBag size={48} style={{ opacity: 0.5, color: 'var(--primary-color)' }} />
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
          Looks like you haven't added any products to your cart yet. Explore our latest custom hardware and gear to get started!
        </p>
        <Link to="/search" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
          Start Shopping!!
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Shopping Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        {/* Cart items list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="glass-panel"
              style={{
                padding: '1.25rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}
              />

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <Link to={`/products/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600, fontSize: '1.05rem' }}>
                  {item.name}
                </Link>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Unit Price: ₹{item.price.toFixed(2)}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                  Total: ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>

              {/* Quantity selectors */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
                <button
                  onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem' }}
                >
                  -
                </button>
                <span style={{ width: '32px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem' }}
                >
                  +
                </button>
              </div>

              {/* Delete button */}
              <button
                onClick={() => removeItemFromCart(item.productId)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem', transition: 'var(--transition-smooth)' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Checkout Summary panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontSize: '0.95rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Percent size={14} />
                    Coupon Applied ({coupon.code})
                  </span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>FREE</span>
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: '0.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-cyan)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Form input */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
              {coupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Active Promo Code</span>
                    <strong style={{ color: 'var(--color-success)', fontSize: '0.95rem' }}>{coupon.code}</strong>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    title="Remove coupon"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponSubmit}>
                  <label className="form-label">Apply Promo Code</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      className="form-control"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-secondary">
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <div style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      {couponError}
                    </div>
                  )}
                </form>
              )}
            </div>

            <Link
              to="/checkout"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/search" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textDecoration: 'none' }}
              onMouseOver={(e) => e.target.style.color = 'var(--text-main)'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
            >
              Continue Discovering Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cart;