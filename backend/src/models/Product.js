const mongoose = require('mongoose');
const { getUseMock } = require('../config/db');
const { MockProduct } = require('../config/mockModels');

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
  reviews: [ReviewSchema],
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const MongooseProduct = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const ProductProxy = {
  find: (query) => getUseMock() ? MockProduct.find(query) : MongooseProduct.find(query),
  findOne: (query) => getUseMock() ? MockProduct.findOne(query) : MongooseProduct.findOne(query),
  findById: (id) => getUseMock() ? MockProduct.findById(id) : MongooseProduct.findById(id),
  create: (data) => getUseMock() ? MockProduct.create(data) : MongooseProduct.create(data),
  findByIdAndUpdate: (id, data, options) => getUseMock() ? MockProduct.findByIdAndUpdate(id, data, options) : MongooseProduct.findByIdAndUpdate(id, data, options),
  findByIdAndDelete: (id) => getUseMock() ? MockProduct.findByIdAndDelete(id) : MongooseProduct.findByIdAndDelete(id)
};

module.exports = ProductProxy;
