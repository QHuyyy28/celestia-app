const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Vui lòng chọn rating'],
        min: [1, 'Rating tối thiểu là 1'],
        max: [5, 'Rating tối đa là 5']
    },
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề review'],
        trim: true,
        maxlength: [100, 'Tiêu đề không được quá 100 ký tự']
    },
    comment: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung review'],
        minlength: [10, 'Nội dung phải có ít nhất 10 ký tự'],
        maxlength: [1000, 'Nội dung không được quá 1000 ký tự']
    },
    verified: {
        type: Boolean,
        default: false // true nếu user đã mua sản phẩm
    },
    helpful: {
        type: Number,
        default: 0 // Số người click "helpful"
    },
    images: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tìm nhanh theo product
reviewSchema.index({ product: 1, user: 1 });
reviewSchema.index({ product: 1, rating: -1 });

// Middleware để update rating trung bình của product
reviewSchema.post('save', async function () {
    const Review = mongoose.model('Review', reviewSchema);
    const Product = mongoose.model('Product');

    const result = await Review.aggregate([
        { $match: { product: this.product } },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        await Product.findByIdAndUpdate(this.product, {
            rating: Math.round(result[0].averageRating * 10) / 10,
            numReviews: result[0].totalReviews
        });
    }
});

// Middleware để update rating khi xóa review
reviewSchema.post('deleteOne', async function () {
    const Review = mongoose.model('Review', reviewSchema);
    const Product = mongoose.model('Product');

    const result = await Review.aggregate([
        { $match: { product: this.product } },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        await Product.findByIdAndUpdate(this.product, {
            rating: Math.round(result[0].averageRating * 10) / 10,
            numReviews: result[0].totalReviews
        });
    } else {
        await Product.findByIdAndUpdate(this.product, {
            rating: 0,
            numReviews: 0
        });
    }
});

module.exports = mongoose.model('Review', reviewSchema);