const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/coupons/validate
// @desc    Validate a coupon code
// @access  Private
router.post('/validate', protect, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code.' });
    }

    if (!coupon.active) {
      return res.status(400).json({ message: 'This coupon has been deactivated.' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (err) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ message: 'Server error validating coupon.' });
  }
});

// @route   GET /api/coupons
// @desc    Get all coupons
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    console.error('Get coupons error:', err);
    res.status(500).json({ message: 'Server error retrieving coupons.' });
  }
});

// @route   POST /api/coupons
// @desc    Create a new coupon
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Please enter code, type, and value.' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      active: true,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null
    });

    res.status(201).json(coupon);
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json({ message: 'Server error creating coupon.' });
  }
});

// @route   DELETE /api/coupons/:id
// @desc    Delete a coupon
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }
    res.json({ message: 'Coupon successfully deleted.' });
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json({ message: 'Server error deleting coupon.' });
  }
});

module.exports = router;
