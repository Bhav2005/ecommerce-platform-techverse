import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  Plus, 
  X, 
  Check, 
  RefreshCw,
  FolderOpen,
  DollarSign
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders

  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Products list states
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: 'Electronics', stock: '', imageUrl: ''
  });

  // Orders list states
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`${API_URL}/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
      fetchProducts();
      fetchOrders();
    }
  }, [token]);

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      stock: parseInt(productForm.stock),
      images: productForm.imageUrl ? [productForm.imageUrl] : undefined
    };

    try {
      let response;
      if (editingProduct) {
        response = await fetch(`${API_URL}/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        alert(editingProduct ? 'Product details updated successfully.' : 'Product created successfully.');
        setProductForm({ name: '', description: '', price: '', category: 'Electronics', stock: '', imageUrl: '' });
        setEditingProduct(null);
        setShowProductForm(false);
        fetchProducts();
        fetchAnalytics(); // update low stock alerts
      } else {
        const errData = await response.json();
        alert(errData.message || 'Operation failed.');
      }
    } catch (err) {
      console.error('Product save error:', err);
    }
  };

  const startEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      category: prod.category,
      stock: prod.stock.toString(),
      imageUrl: prod.images[0] || ''
    });
    setShowProductForm(true);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Product deleted.');
        fetchProducts();
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  // Order Status update
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (response.ok) {
        alert(`Order status updated to "${newStatus}".`);
        fetchOrders();
        fetchAnalytics();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update order status.');
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  // Refresh data trigger
  const handleSyncData = () => {
    fetchAnalytics();
    fetchProducts();
    fetchOrders();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Admin header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)' }}>Store Administration Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review metrics, adjust inventory levels, and manage customer shipments.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleSyncData} style={{ gap: '0.4rem' }}>
          <RefreshCw size={14} />
          Sync Database
        </button>
      </div>

      {/* Tabs selectors */}
      <div 
        style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--glass-border)', 
          gap: '2rem' 
        }}
      >
        {[
          { id: 'overview', name: 'Overview Insights' },
          { id: 'products', name: 'Products Database' },
          { id: 'orders', name: 'Order Shipments' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: 'none',
              border: 'none',
              paddingBottom: '1rem',
              color: activeTab === t.id ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '1.05rem',
              fontWeight: activeTab === t.id ? 600 : 500,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'var(--transition-smooth)'
            }}
          >
            {t.name}
            {activeTab === t.id && (
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: '2px', 
                  background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))' 
                }} 
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {analyticsLoading || !analytics ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Syncing analytics dataset...</div>
          ) : (
            <>
              {/* Analytics metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL SALES</span>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '0.15rem' }}>${analytics.metrics.totalRevenue.toFixed(2)}</h3>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--primary-color)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL ORDERS</span>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '0.15rem' }}>{analytics.metrics.totalOrders}</h3>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--secondary-color)', background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CUSTOMERS</span>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '0.15rem' }}>{analytics.metrics.totalCustomers}</h3>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ color: 'var(--color-warning)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LOW STOCK BADGES</span>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '0.15rem', color: 'var(--color-warning)' }}>
                      {analytics.metrics.lowStockCount + analytics.metrics.outOfStockCount}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Grid: category charts + recent transactions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Category bar graph */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={18} className="neon-text-primary" />
                    Revenue Distribution
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {Object.keys(analytics.categorySales).length === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No category sales compiled yet.</span>
                    ) : (
                      Object.entries(analytics.categorySales).map(([cat, sales]) => {
                        // Max sales calculation for percentage
                        const maxVal = Math.max(...Object.values(analytics.categorySales), 1);
                        const percent = (sales / maxVal) * 100;

                        return (
                          <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span>{cat}</span>
                              <strong style={{ color: 'var(--accent-cyan)' }}>${sales.toFixed(2)}</strong>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  height: '100%', 
                                  background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
                                  width: `${percent}%`,
                                  borderRadius: '4px'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Recent orders */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FolderOpen size={18} className="neon-text-primary" />
                    Recent Activity Logs
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analytics.recentOrders.length === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders found.</span>
                    ) : (
                      analytics.recentOrders.map((o) => (
                        <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{o.customerName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{o._id.substring(0, 10)}...</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--accent-cyan)', display: 'block' }}>${o.total.toFixed(2)}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: Products Database */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Catalog Inventory</h3>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: '', description: '', price: '', category: 'Electronics', stock: '', imageUrl: '' });
                setShowProductForm(!showProductForm);
              }}
              style={{ gap: '0.4rem' }}
            >
              {showProductForm ? <X size={14} /> : <Plus size={14} />}
              {showProductForm ? 'Close Editor' : 'Create Product'}
            </button>
          </div>

          {/* Product form editor */}
          {showProductForm && (
            <div className="glass-panel animate-scale-in" style={{ padding: '2rem', border: '1px solid var(--primary-color)' }}>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingProduct ? <Edit size={16} /> : <Plus size={16} />}
                {editingProduct ? `Modify Product Spec: ${editingProduct.name}` : 'Create New Product Specification'}
              </h4>

              <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Quantum Core Charger"
                      className="form-control"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Audio">Audio</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    placeholder="Product specifications, specs, compatibility..."
                    className="form-control"
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="99.99"
                      className="form-control"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Inventory Stock</label>
                    <input
                      type="number"
                      required
                      placeholder="20"
                      className="form-control"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      className="form-control"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingProduct ? 'Save Specifications' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products inventory table */}
          {productsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Syncing products database...</div>
          ) : (
            <div className="glass-panel table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Level</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => {
                    const isOut = prod.stock === 0;
                    const isLow = prod.stock > 0 && prod.stock <= 3;
                    return (
                      <tr key={prod._id}>
                        <td>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <img 
                              src={prod.images[0]} 
                              alt={prod.name} 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <strong>{prod.name}</strong>
                          </div>
                        </td>
                        <td>{prod.category}</td>
                        <td style={{ color: 'var(--accent-cyan)' }}>${prod.price.toFixed(2)}</td>
                        <td>
                          {isOut ? (
                            <span className="badge badge-danger">Out of Stock (0)</span>
                          ) : isLow ? (
                            <span className="badge badge-warning">Low Stock ({prod.stock})</span>
                          ) : (
                            <span className="badge badge-success">In Stock ({prod.stock})</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-secondary btn-sm" 
                              onClick={() => startEditProduct(prod)}
                              style={{ padding: '0.4rem' }}
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => deleteProduct(prod._id)}
                              style={{ padding: '0.4rem' }}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Order Shipments */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Shipment Dispatch Logs</h3>
          
          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Syncing order datasets...</div>
          ) : (
            <div className="glass-panel table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Customer Name</th>
                    <th>Date Placed</th>
                    <th>Total Price</th>
                    <th>Payment Status</th>
                    <th>Delivery Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const isPaid = order.paymentStatus === 'paid';
                    return (
                      <tr key={order._id}>
                        <td>
                          <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>#{order._id.substring(0, 12)}...</span>
                        </td>
                        <td>
                          <div>
                            <strong>{order.customerName}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{order.customerEmail}</span>
                          </div>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>${order.total.toFixed(2)}</td>
                        <td>
                          {isPaid ? (
                            <span className="badge badge-success">Paid</span>
                          ) : (
                            <span className="badge badge-warning">Pending</span>
                          )}
                        </td>
                        <td>
                          <select
                            className="form-control"
                            style={{ 
                              padding: '0.4rem 0.6rem', 
                              fontSize: '0.85rem', 
                              borderColor: order.orderStatus === 'cancelled' ? 'var(--color-danger)' : order.orderStatus === 'delivered' ? 'var(--color-success)' : 'var(--glass-border)',
                              cursor: 'pointer' 
                            }}
                            value={order.orderStatus}
                            onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
