const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên sản phẩm'],
    trim: true,
    maxlength: [200, 'Tên sản phẩm không được quá 200 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sản phẩm'],
    maxlength: [5000, 'Mô tả không được quá 5000 ký tự']
  },
  price: {
    type: Number,
    required: [true, 'Vui lòng nhập giá sản phẩm'],
    min: [0, 'Giá không được âm']
  },
  comparePrice: {
    type: Number,
    default: 0,
    min: [0, 'Giá không được âm']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Vui lòng chọn danh mục']
  },
  stock: {
    type: Number,
    required: [true, 'Vui lòng nhập số lượng'],
    min: [0, 'Số lượng không được âm'],
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating tối thiểu là 0'],
    max: [5, 'Rating tối đa là 5']
  },
  numReviews: {
    type: Number,
    default: 0
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);