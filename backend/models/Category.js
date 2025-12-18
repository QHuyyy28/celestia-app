const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên danh mục'],
    unique: true,
    trim: true,
    maxlength: [50, 'Tên danh mục không được quá 50 ký tự']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Tự động tạo slug từ name
categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
});

module.exports = mongoose.model('Category', categorySchema);