const mongoose = require('mongoose');
const { getUseMock } = require('../config/db');
const { MockOrder } = require('../config/mockModels');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: { type: String, default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const MongooseOrder = mongoose.models.Order || mongoose.model('Order', OrderSchema);

const OrderProxy = {
  find: (query) => getUseMock() ? MockOrder.find(query) : MongooseOrder.find(query),
  findOne: (query) => getUseMock() ? MockOrder.findOne(query) : MongooseOrder.findOne(query),
  findById: (id) => getUseMock() ? MockOrder.findById(id) : MongooseOrder.findById(id),
  create: (data) => getUseMock() ? MockOrder.create(data) : MongooseOrder.create(data),
  findByIdAndUpdate: (id, data, options) => getUseMock() ? MockOrder.findByIdAndUpdate(id, data, options) : MongooseOrder.findByIdAndUpdate(id, data, options),
  findByIdAndDelete: (id) => getUseMock() ? MockOrder.findByIdAndDelete(id) : MongooseOrder.findByIdAndDelete(id)
};

module.exports = OrderProxy;
