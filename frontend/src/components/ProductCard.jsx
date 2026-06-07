import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, Star } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addItemToCart } = useContext(CartContext);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <div
      className="glass-panel glass-panel-hover animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'var(--transition-smooth)'
      }}
    >
      <Link
        to={`/products/${product._id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', flex: 1 }}
      >
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          <img
            src={product.images[0]}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {isOutOfStock && (
            <span
              className="badge badge-danger"
              style={{ position: 'absolute', top: '12px', right: '12px' }}
            >
              Out of Stock
            </span>
          )}
          {isLowStock && (
            <span
              className="badge badge-warning"
              style={{ position: 'absolute', top: '12px', right: '12px' }}
            >
              Low Stock ({product.stock})
            </span>
          )}
        </div>
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600
            }}
          >
            {product.category}
          </span>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: '0.1rem 0',
              fontFamily: 'var(--font-display)'
            }}
            title={product.name}
          >
            {product.name}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', margin: '0.1rem 0' }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.round(product.rating) ? 'var(--color-warning)' : 'none'}
                color={i < Math.round(product.rating) ? 'var(--color-warning)' : 'rgba(255, 255, 255, 0.2)'}
              />
            ))}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
              ({product.reviews?.length || 0})
            </span>
          </div>
          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-display)',
              marginTop: '0.2rem'
            }}
          >
            ${product.price.toFixed(2)}
          </span>
        </div>
      </Link>
      <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', gap: '0.5rem', borderRadius: 'var(--radius-sm)' }}
          disabled={isOutOfStock}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItemToCart(product);
          }}
        >
          <ShoppingCart size={15} />
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
export default ProductCard;
