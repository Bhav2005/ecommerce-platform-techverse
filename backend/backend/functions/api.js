const { MockUser, MockProduct, MockOrder, MockCoupon } = require('../src/config/mockModels');
const jwt = require('jsonwebtoken');

// Helper to send JSON response
const json = (statusCode, body) => ({ statusCode, body: JSON.stringify(body) });

// Verify token (used for protected routes)
const verifyToken = (event) => {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecommerce_secret_key_12345_dev');
    return decoded;
  } catch (e) {
    return null;
  }
};

exports.handler = async (event, context) => {
  const { httpMethod, path } = event; // e.g. /api/auth/login -> path = "/api/auth/login"
  const segments = path.split('/').filter(Boolean); // ['api','auth','login']
  if (segments[0] !== 'api') return json(404, { message: 'Not Found' });
  const resource = segments[1];
  const sub = segments[2] || '';
  // BODY parsing (Netlify provides string)
  const body = event.body ? JSON.parse(event.body) : {};

  // ---------- AUTH ----------
  if (resource === 'auth') {
    if (httpMethod === 'POST' && sub === 'login') {
      const { email, password } = body;
      const user = MockUser.find(u => u.email === email);
      if (!user) return json(400, { message: 'Invalid credentials' });
      // passwords are pre‑hashed in mock data
      const bcrypt = require('bcryptjs');
      const match = bcrypt.compareSync(password, user.password);
      if (!match) return json(400, { message: 'Invalid credentials' });
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role, username: user.username }, process.env.JWT_SECRET || 'ecommerce_secret_key_12345_dev', { expiresIn: '7d' });
      return json(200, { token, user: { id: user._id, email: user.email, username: user.username, role: user.role } });
    }
    if (httpMethod === 'POST' && sub === 'register') {
      const { username, email, password } = body;
      if (!username || !email || !password) return json(400, { message: 'All fields required' });
      if (MockUser.find(u => u.email === email)) return json(400, { message: 'User already exists' });
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync(password, 10);
      const newUser = {
        _id: `u${Date.now()}`,
        username,
        email,
        password: hash,
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      MockUser.insert(newUser);
      const token = jwt.sign({ id: newUser._id, email, role: newUser.role, username }, process.env.JWT_SECRET || 'ecommerce_secret_key_12345_dev', { expiresIn: '7d' });
      return json(201, { token, user: { id: newUser._id, email, username, role: newUser.role } });
    }
    // protected profile route
    if (httpMethod === 'GET' && sub === 'profile') {
      const decoded = verifyToken(event);
      if (!decoded) return json(401, { message: 'Invalid token' });
      const user = MockUser.find(u => u._id === decoded.id);
      if (!user) return json(404, { message: 'User not found' });
      const { _id, username, email, role, createdAt } = user;
      return json(200, { id: _id, username, email, role, createdAt });
    }
    return json(404, { message: 'Auth route not found' });
  }

  // ---------- PRODUCTS ----------
  if (resource === 'products') {
    if (httpMethod === 'GET') {
      return json(200, MockProduct.getAll());
    }
    return json(404, { message: 'Products route not found' });
  }

  // ---------- ORDERS ----------
  if (resource === 'orders') {
    const decoded = verifyToken(event);
    if (!decoded) return json(401, { message: 'Invalid token' });
    if (httpMethod === 'GET') {
      const orders = MockOrder.findAll(o => o.userId === decoded.id);
      return json(200, orders);
    }
    if (httpMethod === 'POST') {
      const { items, shippingAddress, paymentMethod } = body;
      const newOrder = {
        _id: `o${Date.now()}`,
        createdAt: new Date().toISOString(),
        userId: decoded.id,
        customerName: decoded.username,
        customerEmail: decoded.email,
        items,
        shippingAddress,
        paymentMethod,
        paymentStatus: 'paid',
        orderStatus: 'processing'
      };
      MockOrder.insert(newOrder);
      return json(201, newOrder);
    }
    return json(404, { message: 'Orders route not found' });
  }

  // ---------- COUPONS ----------
  if (resource === 'coupons') {
    if (httpMethod === 'GET') {
      return json(200, MockCoupon.getAll());
    }
    return json(404, { message: 'Coupons route not found' });
  }

  // ---------- ANALYTICS ----------
  if (resource === 'analytics') {
    // simple placeholder: return product count, order count
    if (httpMethod === 'GET') {
      const productCount = MockProduct.getAll().length;
      const orderCount = MockOrder.getAll().length;
      return json(200, { productCount, orderCount });
    }
    return json(404, { message: 'Analytics route not found' });
  }

  return json(404, { message: 'Route not found' });
};
