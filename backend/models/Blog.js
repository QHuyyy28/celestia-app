const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề'],
    trim: true,
    maxlength: [200, 'Tiêu đề không được quá 200 ký tự']
  },
  content: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung'],
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Tóm tắt không được quá 500 ký tự']
  },
  image: {
    type: String,
    required: [true, 'Vui lòng thêm ảnh đại diện']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  tags: [{
    type: String
  }],
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  views: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Tự động tạo slug
blogSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
});

module.exports = mongoose.model('Blog', blogSchema);