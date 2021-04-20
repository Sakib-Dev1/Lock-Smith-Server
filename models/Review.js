const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Review', reviewSchema);
