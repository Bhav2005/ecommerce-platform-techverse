const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/analytics
// @desc    Get dashboard analytics metrics
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find();
    const products = await Product.find();
    const users = await User.find({ role: 'customer' });

    // Calculate revenue
    let totalRevenue = 0;
    let paidOrdersCount = 0;
    const categorySales = Object.create(null);

    orders.forEach(order => {
      if (order.paymentStatus === 'paid') {
        totalRevenue += order.total;
        paidOrdersCount++;

        // Calculate sales by category
        order.items.forEach(item => {
          // Find item category (fallback if product category changes)
          let category = item.category || 'Other';
          if (category === '__proto__' || category === 'constructor' || category === 'prototype') {
            category = 'Other';
          }
          const salesVal = item.price * item.quantity;
          categorySales[category] = (categorySales[category] || 0) + salesVal;
        });
      }
    });

    // If categories are empty in order items, fill from current products database
    if (Object.keys(categorySales).length === 0 && orders.length > 0) {
      // Create product-to-category map
      const prodCatMap = new Map();
      products.forEach(p => {
        if (p._id) {
          prodCatMap.set(p._id.toString(), p.category || 'Other');
        }
      });

      orders.forEach(order => {
        if (order.paymentStatus === 'paid') {
          order.items.forEach(item => {
            const productIdStr = item.productId ? item.productId.toString() : '';
            let cat = prodCatMap.get(productIdStr) || 'Electronics';
            if (cat === '__proto__' || cat === 'constructor' || cat === 'prototype') {
              cat = 'Electronics';
            }
            const salesVal = item.price * item.quantity;
            categorySales[cat] = (categorySales[cat] || 0) + salesVal;
          });
        }
      });
    }

    // Inventory alerts
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach(product => {
      if (product.stock === 0) {
        outOfStockCount++;
      } else if (product.stock <= 3) {
        lowStockCount++;
      }
    });

    // Recent orders (last 5)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentOrders = sortedOrders.slice(0, 5).map(o => ({
      _id: o._id,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      total: o.total,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt
    }));

    // User growth metrics (simulate month-wise registrations or total user count)
    const totalCustomers = users.length;

    res.json({
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders: orders.length,
        paidOrders: paidOrdersCount,
        totalCustomers,
        lowStockCount,
        outOfStockCount
      },
      categorySales,
      recentOrders
    });
  } catch (err) {
    console.error('Analytics aggregation error:', err);
    res.status(500).json({ message: 'Server error compiling analytics.' });
  }
});

module.exports = router;
