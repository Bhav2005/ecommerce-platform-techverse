const MockModel = require('./jsonDb');
const bcrypt = require('bcryptjs');

// Pre-hashed password for 'adminpassword': bcrypt.hashSync('adminpassword', 10)
const adminPasswordHash = bcrypt.hashSync('adminpassword', 10);
// Pre-hashed password for 'customerpassword': bcrypt.hashSync('customerpassword', 10)
const customerPasswordHash = bcrypt.hashSync('customerpassword', 10);

const defaultUsers = [
  {
    _id: "u1_admin",
    username: "Store Manager",
    email: "admin@shop.com",
    password: adminPasswordHash,
    role: "admin",
    createdAt: new Date().toISOString()
  },
  {
    _id: "u2_customer",
    username: "Jane Doe",
    email: "customer@shop.com",
    password: customerPasswordHash,
    role: "customer",
    createdAt: new Date().toISOString()
  }
];

const defaultProducts = [
  {
    _id: "p1",
    name: "Quantum Pro Laptop",
    description: "High-performance laptop for developers and creators. Equipped with 32GB RAM, 1TB SSD, and an ultra-fast processing core.",
    price: 1299.99,
    category: "Electronics",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1496181130204-755241544e35?w=600&auto=format&fit=crop&q=60"],
    reviews: [
      { user: "Jane Doe", rating: 5, comment: "Absolutely blazing fast! Best laptop I have ever owned.", date: new Date().toISOString() }
    ],
    rating: 5,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p2",
    name: "AeroSound Max Headphones",
    description: "Comfortable over-ear wireless headphones with active hybrid noise cancellation (ANC), deep bass, and 40 hours of battery life.",
    price: 199.99,
    category: "Audio",
    stock: 5,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60"],
    reviews: [
      { user: "Bob Smith", rating: 4, comment: "Great sound quality, but tight fit on my head.", date: new Date().toISOString() }
    ],
    rating: 4,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p3",
    name: "NeoType Mechanical Keyboard",
    description: "Compact 75% layout RGB mechanical keyboard with hot-swappable tactile brown switches and double-shot PBT keycaps.",
    price: 89.99,
    category: "Accessories",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60"],
    reviews: [],
    rating: 0,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p4",
    name: "Chronos Fit Smartwatch",
    description: "Next-gen fitness watch with 24/7 heart rate monitor, sleep tracking, built-in GPS, and active stress management metrics.",
    price: 149.99,
    category: "Wearables",
    stock: 0, // Out of Stock item
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60"],
    reviews: [],
    rating: 0,
    createdAt: new Date().toISOString()
  },
  {
    _id: "p5",
    name: "Apex Ergonomic Chair",
    description: "Premium office chair designed with adaptive lumbar support, 3D armrests, and dynamic tension tilt tilt mechanism.",
    price: 299.99,
    category: "Furniture",
    stock: 2, // Low Stock item (threshold <= 3)
    images: ["https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&auto=format&fit=crop&q=60"],
    reviews: [],
    rating: 0,
    createdAt: new Date().toISOString()
  }
];

const defaultCoupons = [
  {
    _id: "c1",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    active: true,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  },
  {
    _id: "c2",
    code: "FLAT20",
    discountType: "fixed",
    discountValue: 20,
    active: true,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const MockUser = new MockModel('users.json', defaultUsers);
const MockProduct = new MockModel('products.json', defaultProducts);
const MockOrder = new MockModel('orders.json', []);
const MockCoupon = new MockModel('coupons.json', defaultCoupons);

module.exports = {
  MockUser,
  MockProduct,
  MockOrder,
  MockCoupon
};
