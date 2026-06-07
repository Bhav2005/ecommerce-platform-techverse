const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');
const stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripeClient = null;
if (STRIPE_SECRET_KEY) {
  try {
    stripeClient = stripe(STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn('Failed to initialize Stripe client. Mock checkout will be active.', err.message);
  }
}

// @route   POST /api/orders
// @desc    Create a new order & initiate payment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, couponCode, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items are required.' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return res.status(400).json({ message: 'Valid shipping address is required.' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Verify stock and calculate price
    for (const cartItem of items) {
      const product = await Product.findById(cartItem.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${cartItem.productId} not found.` });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ message: `Product "${product.name}" has insufficient stock. Only ${product.stock} left.` });
      }

      const itemPrice = product.price;
      subtotal += itemPrice * cartItem.quantity;

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: itemPrice,
        quantity: cartItem.quantity,
        image: product.images[0] || ''
      });
    }

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.active && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) {
        if (coupon.discountType === 'percentage') {
          discount = parseFloat((subtotal * (coupon.discountValue / 100)).toFixed(2));
        } else if (coupon.discountType === 'fixed') {
          discount = Math.min(coupon.discountValue, subtotal);
        }
      }
    }

    const total = parseFloat((subtotal - discount).toFixed(2));

    // Decr stock
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      const newStock = Math.max(0, product.stock - item.quantity);
      await Product.findByIdAndUpdate(item.productId, { stock: newStock });
    }

    let paymentIntentId = 'mock_pi_' + Math.random().toString(36).substring(2, 12);
    let clientSecret = 'mock_secret_' + Math.random().toString(36).substring(2, 12);

    // Create real Stripe PaymentIntent if Stripe is enabled
    if (stripeClient && paymentMethod === 'card') {
      try {
        const paymentIntent = await stripeClient.paymentIntents.create({
          amount: Math.round(total * 100), // in cents
          currency: 'usd',
          metadata: {
            userId: req.user.id,
            userEmail: req.user.email
          }
        });
        paymentIntentId = paymentIntent.id;
        clientSecret = paymentIntent.client_secret;
      } catch (stripeErr) {
        console.error('Stripe payment intent creation failed. Falling back to Mock payment.', stripeErr.message);
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      customerName: req.user.username,
      customerEmail: req.user.email,
      items: orderItems,
      subtotal,
      discount,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentMethod === 'upi' || paymentMethod === 'net_banking' ? 'pending' : 'pending',
      orderStatus: 'pending',
      paymentIntentId
    });

    res.status(201).json({
      order,
      clientSecret
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error creating order.' });
  }
});

// @route   POST /api/orders/:id/pay
// @desc    Update order payment status to paid
// @access  Private
router.post('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Verify ownership
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'paid', orderStatus: 'processing' },
      { new: true }
    );

    res.json({ message: 'Payment confirmed successfully.', order: updatedOrder });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ message: 'Server error processing payment.' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find();
    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Server error retrieving orders.' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order shipping/fulfillment status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    if (!orderStatus) {
      return res.status(400).json({ message: 'Order status is required.' });
    }

    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Revert stock if order gets cancelled
    if (orderStatus === 'cancelled' && existingOrder.orderStatus !== 'cancelled') {
      for (const item of existingOrder.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          await Product.findByIdAndUpdate(item.productId, { stock: product.stock + item.quantity });
        }
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Server error updating order status.' });
  }
});

module.exports = router;
