const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },

  status: {
    type: String,
    enum: ['pending', 'on going', 'done'],
    default: 'pending',
  },

  email: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Order', orderSchema);
