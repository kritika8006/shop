const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  unit: { 
    type: String, 
    default: 'gm' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);