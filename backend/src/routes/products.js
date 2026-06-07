const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with filtering, search, and sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    let products = await Product.find(query);

    // Apply sorting
    if (sort) {
      if (sort === 'price-asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating-desc') {
        products.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'newest') {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }

    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error retrieving products.' });
  }
});

// @route   GET /api/products/autocomplete
// @desc    Get product names for autocomplete search
// @access  Public
router.get('/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const query = { name: { $regex: q, $options: 'i' } };
    const products = await Product.find(query);
    
    // Return only names and IDs
    const suggestions = products.slice(0, 10).map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category
    }));
    
    res.json(suggestions);
  } catch (err) {
    console.error('Autocomplete error:', err);
    res.status(500).json({ message: 'Server error during autocomplete.' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ message: 'Server error retrieving product details.' });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description, price, category, stock, images } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'],
      reviews: [],
      rating: 0
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error creating product.' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, description, price, category, stock, images } = req.body;

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (category) updates.category = category;
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (images) updates.images = images;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error updating product.' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json({ message: 'Product successfully deleted.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Submit a product review
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide rating and comment.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user === req.user.username
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed.' });
    }

    const review = {
      user: req.user.username,
      rating: Number(rating),
      comment,
      date: new Date().toISOString()
    };

    product.reviews.push(review);

    // Recompute average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));

    await Product.findByIdAndUpdate(req.params.id, {
      reviews: product.reviews,
      rating: product.rating
    });

    res.status(201).json({ message: 'Review added.', product });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ message: 'Server error adding review.' });
  }
});

module.exports = router;
