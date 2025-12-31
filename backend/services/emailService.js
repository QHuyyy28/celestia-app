const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../config/email');

// Hàm helper để load và render template
const renderTemplate = (templateName, variables = {}) => {
    try {
        const templatePath = path.join(__dirname, `../templates/emails/${templateName}`);
        let html = fs.readFileSync(templatePath, 'utf8');

        // Replace tất cả các biến
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, variables[key] || '');
        });

        return html;
    } catch (error) {
        console.error(`Error rendering template ${templateName}:`, error);
        throw error;
    }
};

// Hàm kiểm tra nếu hôm nay là sinh nhật
const isBirthdayToday = (birthday) => {
    if (!birthday) return false;
    const today = new Date();
    const birthDate = new Date(birthday);
    return today.getMonth() === birthDate.getMonth() && 
           today.getDate() === birthDate.getDate();
};

// Hàm tạo lời chúc sinh nhật
const getBirthdayGreeting = (name) => {
    const greetings = [
        `🎂 Hôm nay là sinh nhật của ${name}! Chúc bạn một ngày tuyệt vời đầy niềm vui và may mắn! 🎉`,
        `🌟 Sinh nhật vui vẻ ${name}! Chúc bạn sức khỏe, hạnh phúc và thành công! 🎊`,
        `🎈 Ngày sinh nhật của ${name} rồi! Mong bạn luôn tươi cười và có những điều tốt đẹp! 💝`,
        `🎁 Chúc mừng sinh nhật ${name}! Cảm ơn bạn đã tin tưởng Celestia! 🌹`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
};

// 1. Gửi email xác nhận đơn hàng
const sendOrderConfirmationEmail = async (order, customer) => {
    try {
        const orderItems = order.orderItems.map(item => `
            <tr>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td class="price">${item.price.toLocaleString('vi-VN')}đ</td>
                <td class="price">${(item.quantity * item.price).toLocaleString('vi-VN')}đ</td>
            </tr>
        `).join('');

        // Check if today is customer's birthday
        const birthdayGreeting = isBirthdayToday(customer.birthday) ? getBirthdayGreeting(customer.name) : '';

        const html = renderTemplate('orderConfirmation.html', {
            customerName: customer.name,
            orderId: order._id.toString().slice(-8).toUpperCase(),
            orderDate: new Date(order.createdAt).toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            orderItems: orderItems,
            recipientName: order.shippingAddress.fullName,
            recipientPhone: order.shippingAddress.phone,
            deliveryAddress: `${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`,
            subtotal: order.itemsPrice.toLocaleString('vi-VN') + 'đ',
            shippingFee: order.shippingPrice.toLocaleString('vi-VN') + 'đ',
            totalAmount: order.totalPrice.toLocaleString('vi-VN') + 'đ',
            birthdayGreeting: birthdayGreeting,
            trackingLink: process.env.FRONTEND_URL + `/profile`,
            supportEmail: process.env.SUPPORT_EMAIL || 'support@celestia.com'
        });

        await sendEmail(
            customer.email,
            `✓ Xác nhận đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
            html
        );

        return true;
    } catch (error) {
        console.error('Error sending order confirmation:', error);
        throw error;
    }
};

// 2. Gửi email cập nhật trạng thái đơn hàng
const sendOrderStatusUpdateEmail = async (order, customer, statusData) => {
    try {
        const statusMap = {
            pending: { text: 'Đơn hàng đang chờ xử lý', badge: 'Chờ xử lý', type: 'pending' },
            confirmed: { text: 'Đơn hàng đã xác nhận', badge: 'Đã xác nhận', type: 'confirmed' },
            processing: { text: 'Đang chuẩn bị hàng', badge: 'Đang xử lý', type: 'processing' },
            shipped: { text: 'Đơn hàng đã gửi đi', badge: 'Đã gửi đi', type: 'shipped' },
            delivered: { text: '✓ Giao hàng thành công!', badge: 'Đã giao', type: 'delivered' },
            cancelled: { text: 'Đơn hàng đã hủy', badge: 'Đã hủy', type: 'cancelled' }
        };

        const currentStatus = statusMap[order.status] || statusMap.pending;

        // Tạo timeline events
        const timelineEvents = (order.statusHistory || [])
            .slice()
            .reverse()
            .map((event, index) => {
                const isActive = index === 0;
                return `
                    <div class="timeline-item ${isActive ? 'active' : ''}">
                        <div class="timeline-time">${new Date(event.updatedAt).toLocaleDateString('vi-VN')} ${new Date(event.updatedAt).toLocaleTimeString('vi-VN')}</div>
                        <div class="timeline-title">${statusMap[event.status]?.badge || event.status}</div>
                        <div class="timeline-desc">${event.note || ''}</div>
                    </div>
                `;
            })
            .join('');

        const html = renderTemplate('orderStatusUpdate.html', {
            statusText: currentStatus.text,
            orderId: order._id.toString().slice(-8).toUpperCase(),
            customerName: customer.name,
            statusBadge: currentStatus.badge,
            statusType: currentStatus.type,
            timelineEvents: timelineEvents,
            shippingProvider: statusData?.shippingProvider || 'GHN',
            trackingNumber: statusData?.trackingNumber || 'N/A',
            estimatedDelivery: statusData?.estimatedDelivery || 'Đang cập nhật',
            trackingLink: process.env.FRONTEND_URL + `/orders/${order._id}`,
            supportEmail: process.env.SUPPORT_EMAIL
        });

        await sendEmail(
            customer.email,
            `📦 ${currentStatus.text} - Đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`,
            html
        );

        return true;
    } catch (error) {
        console.error('Error sending order status update:', error);
        throw error;
    }
};

// 3. Gửi email xác nhận tài khoản
const sendVerificationEmail = async (user, verificationToken) => {
    try {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        const html = renderTemplate('verifyEmail.html', {
            userName: user.name,
            verificationLink: verificationLink,
            supportEmail: process.env.SUPPORT_EMAIL
        });

        await sendEmail(
            user.email,
            'Xác nhận tài khoản Celestia',
            html
        );

        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

// 4. Gửi email đặt lại mật khẩu
const sendResetPasswordEmail = async (user, resetToken) => {
    try {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const html = renderTemplate('resetPassword.html', {
            userName: user.name,
            resetLink: resetLink,
            supportEmail: process.env.SUPPORT_EMAIL
        });

        await sendEmail(
            user.email,
            'Đặt lại mật khẩu Celestia',
            html
        );

        return true;
    } catch (error) {
        console.error('Error sending reset password email:', error);
        throw error;
    }
};

// 5. Gửi email thông báo sale
const sendSaleNotificationEmail = async (users, saleData) => {
    try {
        // Tạo HTML sản phẩm sale
        let productHTML = '';
        if (saleData.featuredProducts && saleData.featuredProducts.length > 0) {
            productHTML = saleData.featuredProducts.map(product => `
                <div class="product-card">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">
                        <span class="original-price">${product.originalPrice.toLocaleString('vi-VN')}đ</span>
                        <span class="sale-price">${product.salePrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
            `).join('');
        }

        const html = renderTemplate('saleNotification.html', {
            customerName: users[0]?.name || 'Quý khách',
            discountPercent: saleData.discountPercent || '50',
            saleTitle: saleData.title || 'Flash Sale',
            saleDescription: saleData.description || 'Khuyến mãi đặc biệt chỉ dành cho bạn',
            saleProducts: productHTML,
            countdownTime: saleData.countdownTime || '12:00:00',
            shopLink: process.env.FRONTEND_URL + '/products',
            saleConditions: saleData.conditions || 'Áp dụng cho tất cả sản phẩm',
            unsubscribeLink: process.env.FRONTEND_URL + '/unsubscribe'
        });

        // Gửi cho tất cả người dùng
        const emailPromises = users.map(user =>
            sendEmail(
                user.email,
                `🎊 ${saleData.title} - Giảm giá lên đến ${saleData.discountPercent}%`,
                html
            )
        );

        await Promise.all(emailPromises);
        console.log(`✓ Sale notification sent to ${users.length} users`);

        return true;
    } catch (error) {
        console.error('Error sending sale notification:', error);
        throw error;
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail,
    sendVerificationEmail,
    sendResetPasswordEmail,
    sendSaleNotificationEmail,
    renderTemplate
};
