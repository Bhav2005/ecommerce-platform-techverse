const mongoose = require('mongoose');
const { getUseMock } = require('../config/db');
const { MockCoupon } = require('../config/mockModels');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  active: { type: Boolean, default: true },
  expiryDate: { type: Date }
});

const MongooseCoupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

const CouponProxy = {
  find: (query) => getUseMock() ? MockCoupon.find(query) : MongooseCoupon.find(query),
  findOne: (query) => getUseMock() ? MockCoupon.findOne(query) : MongooseCoupon.findOne(query),
  findById: (id) => getUseMock() ? MockCoupon.findById(id) : MongooseCoupon.findById(id),
  create: (data) => getUseMock() ? MockCoupon.create(data) : MongooseCoupon.create(data),
  findByIdAndUpdate: (id, data, options) => getUseMock() ? MockCoupon.findByIdAndUpdate(id, data, options) : MongooseCoupon.findByIdAndUpdate(id, data, options),
  findByIdAndDelete: (id) => getUseMock() ? MockCoupon.findByIdAndDelete(id) : MongooseCoupon.findByIdAndDelete(id)
};

module.exports = CouponProxy;
