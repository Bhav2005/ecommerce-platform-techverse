import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import ImageZoom from '../components/ImageZoom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Star, ShoppingCart, MessageSquare, ArrowLeft, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ProductDetails = () => {
  const { id } = useParams();
  const { addItemToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/products/${id}`);
      if (!response.ok) {
        throw new Error('Product not found.');
      }
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItemToCart(product, quantity);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setReviewSubmitLoading(true);
    setReviewError(null);
    setReviewSuccess(false);

    try {
      const response = await fetch(`${API_URL}/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review.');
      }

      setReviewSuccess(true);
      setComment('');
      setRating(5);
      // Reload product details to show new review
      fetchProduct();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>Syncing product specifications...</div>;
  }

  if (error || !product) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', margin: '2rem auto', maxWidth: '600px' }}>
        <h3 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Search Error</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'The requested product could not be located.'}</p>
        <Link to="/search" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Explore
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const hasUserReviewed = user && product.reviews?.some(r => r.user === user.username);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }} className="animate-fade-in">
      {/* Back button */}
      <div>
        <Link to="/search" style={{ textDecoration: 'none', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'var(--transition-smooth)' }} onMouseOver={(e)=>e.target.style.color='var(--text-main)'} onMouseOut={(e)=>e.target.style.color='var(--text-muted)'}>
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main product presentation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        {/* Left image column */}
        <div>
          <ImageZoom src={product.images[0]} alt={product.name} />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            {product.images.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                alt={`${product.name} thumbnail`} 
                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--primary-color)', cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        {/* Right specifications column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: '2.5rem', marginTop: '0.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
              {product.name}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(product.rating) ? 'var(--color-warning)' : 'none'}
                    color={i < Math.round(product.rating) ? 'var(--color-warning)' : 'rgba(255, 255, 255, 0.2)'}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {product.rating.toFixed(1)} ({product.reviews?.length || 0} customer reviews)
              </span>
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>
            ${product.price.toFixed(2)}
          </div>

          {/* Stock Tag Alerts */}
          <div>
            {isOutOfStock ? (
              <span className="badge badge-danger" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Out of Stock</span>
            ) : isLowStock ? (
              <span className="badge badge-warning" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Low Stock Alert: Only {product.stock} units remaining!</span>
            ) : (
              <span className="badge badge-success" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>In Stock ({product.stock} units available)</span>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem' }}>
            {product.description}
          </p>

          {/* Cart triggers */}
          {!isOutOfStock && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)' }}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  -
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  +
                </button>
              </div>

              <button 
                className="btn btn-primary"
                style={{ flex: 1, gap: '0.75rem', padding: '0.9rem' }}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews area */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} />
          Customer Evaluation Logs ({product.reviews?.length || 0})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Reviews list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {product.reviews?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No evaluations submitted for this product. Be the first to leave a comment!</p>
            ) : (
              product.reviews.map((rev, i) => (
                <div key={i} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{rev.user}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(rev.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.1rem' }}>
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        size={12}
                        fill={idx < rev.rating ? 'var(--color-warning)' : 'none'}
                        color={idx < rev.rating ? 'var(--color-warning)' : 'rgba(255, 255, 255, 0.2)'}
                      />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Review write panel */}
          <div>
            {token ? (
              hasUserReviewed ? (
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  You have already logged your feedback for this product. Thank you!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>Write an Evaluation</h3>
                  
                  {reviewError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{reviewError}</div>}
                  {reviewSuccess && <div style={{ color: 'var(--color-success)', fontSize: '0.85rem' }}>Evaluation logged successfully.</div>}

                  <div>
                    <label className="form-label">Product Rating</label>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          style={{ cursor: 'pointer' }}
                          fill={star <= rating ? 'var(--color-warning)' : 'none'}
                          color={star <= rating ? 'var(--color-warning)' : 'rgba(255, 255, 255, 0.3)'}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Review Comment</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      placeholder="Share details of your experience with this creation..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ alignSelf: 'flex-start', gap: '0.5rem' }}
                    disabled={reviewSubmitLoading}
                  >
                    <Send size={14} />
                    {reviewSubmitLoading ? 'Submitting...' : 'Submit Evaluation'}
                  </button>
                </form>
              )
            ) : (
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--text-muted)' }}>
                Please <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>login</Link> to write a customer review.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
export default ProductDetails;
