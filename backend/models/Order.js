const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    image: { type: String, required: true }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    ward: { type: String, default: '' },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, default: '' }
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'VietQR'],
    default: 'COD'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 30000 // 30k phí ship
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'customer_transferred', 'admin_confirmed', 'failed'],
    default: 'pending',
    description: 'pending: Chưa thanh toán | customer_transferred: Khách đã chuyển khoản (chờ admin xác nhận) | admin_confirmed: Admin đã xác nhận | failed: Thanh toán thất bại'
  },
  paymentVerifiedAt: {
    type: Date,
    description: 'Thời gian admin xác nhận thanh toán'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    },
    note: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
  }],
  shippingInfo: {
    provider: { type: String, default: 'GHN' },
    trackingNumber: { type: String, default: '' },
    estimatedDelivery: { type: Date }
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);