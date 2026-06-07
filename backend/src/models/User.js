const mongoose = require('mongoose');
const { getUseMock } = require('../config/db');
const { MockUser } = require('../config/mockModels');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.models.User || mongoose.model('User', UserSchema);

const UserProxy = {
  find: (query) => getUseMock() ? MockUser.find(query) : MongooseUser.find(query),
  findOne: (query) => getUseMock() ? MockUser.findOne(query) : MongooseUser.findOne(query),
  findById: (id) => getUseMock() ? MockUser.findById(id) : MongooseUser.findById(id),
  create: (data) => getUseMock() ? MockUser.create(data) : MongooseUser.create(data),
  findByIdAndUpdate: (id, data, options) => getUseMock() ? MockUser.findByIdAndUpdate(id, data, options) : MongooseUser.findByIdAndUpdate(id, data, options),
  findByIdAndDelete: (id) => getUseMock() ? MockUser.findByIdAndDelete(id) : MongooseUser.findByIdAndDelete(id)
};

module.exports = UserProxy;
