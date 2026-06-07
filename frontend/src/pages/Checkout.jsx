import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { CreditCard, MapPin, CheckCircle, Smartphone, Landmark, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Checkout = () => {
  const { cartItems, coupon, getCartTotals, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  
  // Shipping info state
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  // Payment info state
  const [paymentMethod, setPaymentMethod] = useState('card'); // card, upi, net_banking
  const [cardInfo, setCardInfo] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('Chase');
  
  // Order status state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);

  // Confetti Canvas Ref
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  const { subtotal, discount, total } = getCartTotals();

  // Redirect if cart is empty and not on step 3
  useEffect(() => {
    if (cartItems.length === 0 && step !== 3) {
      navigate('/cart');
    }
  }, [cartItems, step, navigate]);

  // Canvas Confetti Effect
  useEffect(() => {
    if (step === 3 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
      const particles = Array.from({ length: 150 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      }));

      const drawConfetti = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
          p.tiltAngle += p.tiltAngleIncremental;
          p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
          p.x += Math.sin(p.tiltAngle);
          p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

          ctx.beginPath();
          ctx.lineWidth = p.r;
          ctx.strokeStyle = p.color;
          ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
          ctx.stroke();

          // Reset particle if off bottom
          if (p.y > canvas.height) {
            particles[index] = {
              ...p,
              x: Math.random() * canvas.width,
              y: -20,
              tilt: Math.random() * 10 - 5
            };
          }
        });

        animationFrameId.current = requestAnimationFrame(drawConfetti);
      };

      drawConfetti();

      // Handle resize
      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId.current);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [step]);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to place an order.');
      navigate('/login');
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      // 1. Create order and intent
      const createResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
          shippingAddress,
          couponCode: coupon ? coupon.code : null,
          paymentMethod
        })
      });

      const orderData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(orderData.message || 'Error creating order.');
      }

      const orderId = orderData.order._id;

      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Capture payment
      const payResponse = await fetch(`${API_URL}/orders/${orderId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const payData = await payResponse.json();

      if (!payResponse.ok) {
        throw new Error(payData.message || 'Payment capture failed.');
      }

      // Order created and paid!
      setCreatedOrder(payData.order);
      clearCart();
      setStep(3);
    } catch (err) {
      setPaymentError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }} className="animate-fade-in">
      {step === 3 && (
        <canvas 
          ref={canvasRef} 
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }}
        />
      )}

      <main className="content-area" style={{ maxWidth: '850px' }}>
        {/* Step tracker links */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '15px', left: '10%', right: '10%', height: '2px', background: 'var(--glass-border)', zIndex: 1 }}>
            <div 
              style={{ 
                height: '100%', 
                background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
                width: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                transition: 'var(--transition-smooth)'
              }}
            />
          </div>

          {[
            { num: 1, label: 'Shipping Address', icon: <MapPin size={16} /> },
            { num: 2, label: 'Payment Details', icon: <CreditCard size={16} /> },
            { num: 3, label: 'Confirmation', icon: <CheckCircle size={16} /> }
          ].map(s => (
            <div 
              key={s.num} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '0.5rem', 
                zIndex: 2,
                color: step >= s.num ? 'var(--text-main)' : 'var(--text-muted)'
              }}
            >
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: step > s.num 
                    ? 'var(--color-success)' 
                    : step === s.num 
                      ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' 
                      : 'var(--bg-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid var(--glass-border)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  boxShadow: step === s.num ? '0 0 10px var(--primary-glow)' : 'none',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {step > s.num ? <CheckCircle size={14} /> : s.num}
              </div>
              <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} className="neon-text-primary" />
                Shipping Details
              </h2>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Neon Parkway, Suite A"
                  className="form-control"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neo Tokyo"
                    className="form-control"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Postal / ZIP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100-0001"
                    className="form-control"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Japan"
                    className="form-control"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ alignSelf: 'flex-end', padding: '0.8rem 2rem', marginTop: '1rem' }}
              >
                Proceed to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} className="neon-text-primary" />
                Secure Checkout & Payment Gateway
              </h2>

              {paymentError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>{paymentError}</div>}

              {/* Payment selection tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { id: 'card', name: 'Credit Card', icon: <CreditCard size={18} /> },
                  { id: 'upi', name: 'UPI Gateway', icon: <Smartphone size={18} /> },
                  { id: 'net_banking', name: 'Net Banking', icon: <Landmark size={18} /> }
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id)}
                    style={{
                      padding: '1rem 0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: paymentMethod === p.id ? 'var(--primary-color)' : 'var(--glass-border)',
                      background: paymentMethod === p.id ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'var(--transition-smooth)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ color: paymentMethod === p.id ? 'var(--primary-color)' : 'var(--text-muted)' }}>{p.icon}</div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.name}</span>
                  </div>
                ))}
              </div>

              {/* Payment Fields according to choice */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                {paymentMethod === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '-0.5rem' }}>
                      Stripe Elements Card Emulation: You can enter any mock card details.
                    </span>
                    <div className="form-group">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        required={paymentMethod === 'card'}
                        placeholder="John Doe"
                        className="form-control"
                        value={cardInfo.name}
                        onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        required={paymentMethod === 'card'}
                        placeholder="4242 4242 4242 4242"
                        className="form-control"
                        value={cardInfo.number}
                        onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Expiration Date</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="MM/YY"
                          className="form-control"
                          value={cardInfo.expiry}
                          onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVV Security Code</label>
                        <input
                          type="text"
                          required={paymentMethod === 'card'}
                          placeholder="123"
                          className="form-control"
                          value={cardInfo.cvv}
                          onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">UPI ID / VPA</label>
                      <input
                        type="text"
                        required={paymentMethod === 'upi'}
                        placeholder="username@upi"
                        className="form-control"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.01)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--glass-border)' }}>
                      <div style={{ width: '130px', height: '130px', margin: '0 auto 1rem auto', background: 'var(--bg-secondary)', border: '1px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--primary-glow)' }}>
                        <Smartphone size={32} style={{ color: 'var(--accent-cyan)' }} />
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scan mock QR code in your mobile payments application</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'net_banking' && (
                  <div className="form-group">
                    <label className="form-label">Select Your Banking Institution</label>
                    <select
                      className="form-control"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="Chase">Chase Bank</option>
                      <option value="BankOfAmerica">Bank of America</option>
                      <option value="WellsFargo">Wells Fargo</option>
                      <option value="Citi">Citibank</option>
                      <option value="HSBC">HSBC Banking</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Totals description */}
              <div 
                style={{ 
                  margin: '1rem 0', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Total Amount Payable:</span>
                <strong style={{ fontSize: '1.3rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-display)' }}>${total.toFixed(2)}</strong>
              </div>

              {/* Triggers */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)} disabled={paymentLoading}>
                  Back to Address
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={paymentLoading}
                  style={{ minWidth: '150px' }}
                >
                  {paymentLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Loader size={16} className="animate-pulse" style={{ animation: 'spin 1s linear infinite' }} />
                      Processing...
                    </div>
                  ) : (
                    `Pay $${total.toFixed(2)}`
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && createdOrder && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center', padding: '1.5rem 0' }}>
              <div 
                style={{ 
                  color: 'var(--color-success)', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  padding: '1.5rem', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <CheckCircle size={48} />
              </div>
              
              <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Order Confirmed!</h2>
              
              <div style={{ color: 'var(--text-muted)', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p>
                  Thank you for your purchase, <strong>{user?.username}</strong>! Your transaction was successfully processed.
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  An order confirmation email notification has been dispatched to <strong>{createdOrder.customerEmail}</strong>.
                </p>
              </div>

              {/* Order summary invoice */}
              <div 
                className="glass-panel" 
                style={{ 
                  width: '100%', 
                  maxWidth: '500px', 
                  padding: '1.5rem', 
                  background: 'rgba(255, 255, 255, 0.01)', 
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order Reference</span>
                  <strong>#{createdOrder._id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                  <span style={{ textTransform: 'capitalize' }}>{createdOrder.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Status</span>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{createdOrder.paymentStatus}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '0.5rem', fontSize: '1.05rem', fontWeight: 'bold' }}>
                  <span>Paid Total</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>${createdOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Link to="/profile" className="btn btn-primary">
                  View Order History
                </Link>
                <Link to="/" className="btn btn-secondary">
                  Return to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default Checkout;
