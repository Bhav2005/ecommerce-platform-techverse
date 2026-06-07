import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, ClipboardList, Clock, Truck, ShieldAlert, Key, CheckCircle2 } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile, getOrders } = useContext(AuthContext);

  // Profile forms state
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Orders list state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      fetchOrders();
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (password && password !== confirmPassword) {
      setProfileError('Passwords do not match.');
      return;
    }

    setProfileLoading(true);

    try {
      await updateProfile(username, email, password || undefined);
      setProfileSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Helper to map order status to timeline index
  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem', alignItems: 'start' }} className="animate-fade-in">
      {/* Left panel: Profile Info */}
      <aside className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} className="neon-text-primary" />
          Profile Settings
        </h2>

        {profileError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>{profileError}</div>}
        {profileSuccess && <div style={{ color: 'var(--color-success)', fontSize: '0.85rem', marginBottom: '1rem' }}>Profile details updated.</div>}

        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingOver: '1rem', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', margin: '1rem 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <Key size={14} />
              Change Password (Optional)
            </h3>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
            disabled={profileLoading}
          >
            {profileLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </aside>

      {/* Right panel: Order History */}
      <section>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardList size={22} />
          Purchased Orders History
        </h2>

        {ordersLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', color: 'var(--text-muted)' }}>Syncing order files...</div>
        ) : orders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={36} style={{ strokeWidth: 1.5, opacity: 0.5, marginBottom: '1rem' }} />
            <h3>No Orders Logged</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>You haven't checked out any products yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {orders.map((order) => {
              const currentStep = getStatusStep(order.orderStatus);
              const isCancelled = order.orderStatus === 'cancelled';

              return (
                <div key={order._id} className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                  {/* Order Card Header */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      flexWrap: 'wrap', 
                      gap: '1rem',
                      borderBottom: '1px solid var(--glass-border)',
                      paddingBottom: '1rem',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER REFERENCE</span>
                      <h3 style={{ fontSize: '1.1rem', marginTop: '0.15rem' }}>#{order._id}</h3>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>DATE PLACED</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 500, marginTop: '0.15rem' }}>{new Date(order.createdAt).toLocaleDateString()}</h4>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL VALUE</span>
                      <h4 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', fontWeight: 'bold', marginTop: '0.15rem' }}>${order.total.toFixed(2)}</h4>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>STATUS</span>
                      {isCancelled ? (
                        <span className="badge badge-danger">Cancelled</span>
                      ) : order.paymentStatus === 'paid' ? (
                        <span className="badge badge-success">Paid</span>
                      ) : (
                        <span className="badge badge-warning">Pending Payment</span>
                      )}
                    </div>
                  </div>

                  {/* Order Items grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.name}</span>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Progress timeline */}
                  {!isCancelled ? (
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1.25rem' }}>
                        REAL-TIME DELIVERY TRACKING
                      </span>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                        {/* Connecting line */}
                        <div style={{ position: 'absolute', top: '10px', left: '10%', right: '10%', height: '2px', background: 'var(--glass-border)', zIndex: 1 }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              background: 'var(--color-success)',
                              width: `${(currentStep / 3) * 100}%`,
                              transition: 'var(--transition-smooth)'
                            }}
                          />
                        </div>

                        {[
                          { index: 0, label: 'Order Placed', icon: <Clock size={12} /> },
                          { index: 1, label: 'Processing', icon: <CheckCircle2 size={12} /> },
                          { index: 2, label: 'Shipped', icon: <Truck size={12} /> },
                          { index: 3, label: 'Delivered', icon: <CheckCircle2 size={12} /> }
                        ].map(step => (
                          <div 
                            key={step.index} 
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              gap: '0.4rem', 
                              zIndex: 2,
                              color: currentStep >= step.index ? 'var(--text-main)' : 'var(--text-muted)'
                            }}
                          >
                            <div 
                              style={{ 
                                width: '22px', 
                                height: '22px', 
                                borderRadius: '50%', 
                                background: currentStep >= step.index ? 'var(--color-success)' : 'var(--bg-secondary)', 
                                border: '1px solid',
                                borderColor: currentStep >= step.index ? 'var(--color-success)' : 'var(--glass-border)',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white',
                                transition: 'var(--transition-smooth)'
                              }}
                            >
                              {step.icon}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-danger)', fontSize: '0.9rem' }}>
                      <ShieldAlert size={18} />
                      <span>This order has been cancelled and stocks have been refunded. Contact support for assistance.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
export default Profile;
