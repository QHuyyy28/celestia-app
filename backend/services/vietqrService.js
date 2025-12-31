const QRCode = require('qrcode');

/**
 * VietQR Service - Tạo mã QR thanh toán theo chuẩn VietQR
 * Hỗ trợ quét bằng app ngân hàng để chuyển khoản
 */

// Cấu hình thông tin ngân hàng nhận tiền
const BANK_CONFIG = {
    BANK_ID: '970403',            // Sacombank (VietQR)
    ACCOUNT_NO: '070133238679',   // Số tài khoản
    ACCOUNT_NAME: 'HA MINH HUY',  // Tên chủ tài khoản (VIETQR không dấu)
    TEMPLATE: 'qr_only'           // Chỉ hiển thị mã QR
};


/**
 * Tạo nội dung QR code theo chuẩn VietQR
 * @param {string} orderId - Mã đơn hàng
 * @param {number} amount - Số tiền thanh toán
 * @param {string} description - Mô tả thanh toán (tùy chọn)
 * @returns {Promise<string>} - Data URL của QR code
 */
exports.generateVietQR = async (orderId, amount, description = '') => {
    try {
        console.log('Generating VietQR for order:', orderId, 'Amount:', amount);
        
        // Chuyển đổi giá sang test amount (tối đa 50k VND)
        // Chia cho 1000 để test, ví dụ: 1,000,000 VND -> 1,000 VND
        const testAmount = Math.min(Math.round(amount / 1000), 50000);
        
        console.log('Test amount:', testAmount);
        
        // Format nội dung chuyển khoản (không dấu, viết hoa)
        const transferContent = (description || `DH ${orderId}`).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
        
        console.log('Transfer content:', transferContent);
        
        // Tạo URL VietQR API (sử dụng API miễn phí của VietQR)
        const vietqrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-${BANK_CONFIG.TEMPLATE}.png?amount=${testAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;
        
        console.log('VietQR URL generated:', vietqrUrl);
        
        return vietqrUrl;
    } catch (error) {
        console.error('Error generating VietQR:', error);
        throw new Error('Không thể tạo mã QR thanh toán');
    }
};

/**
 * Tạo QR code từ text thuần (backup method)
 * @param {string} content - Nội dung QR code
 * @returns {Promise<string>} - Data URL của QR code
 */
exports.generateQRCodeFromText = async (content) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(content, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Không thể tạo mã QR');
    }
};

/**
 * Lấy thông tin ngân hàng
 * @returns {object} - Thông tin ngân hàng
 */
exports.getBankInfo = () => {
    return {
        bankId: BANK_CONFIG.BANK_ID,
        accountNo: BANK_CONFIG.ACCOUNT_NO,
        accountName: BANK_CONFIG.ACCOUNT_NAME,
        bankName: getBankName(BANK_CONFIG.BANK_ID)
    };
};

/**
 * Lấy tên ngân hàng từ mã
 * @param {string} bankId - Mã ngân hàng
 * @returns {string} - Tên ngân hàng
 */
function getBankName(bankId) {
    const banks = {
        '970422': 'MB Bank (Quân đội)',
        '970436': 'Vietcombank',
        '970407': 'Techcombank',
        '970415': 'Vietinbank',
        '970405': 'Agribank',
        '970418': 'BIDV',
        '970432': 'VPBank',
        '970423': 'TPBank',
        '970403': 'Sacombank',
        '970416': 'ACB'
    };
    return banks[bankId] || 'Ngân hàng';
}

/**
 * Tạo thông tin thanh toán đầy đủ
 * @param {string} orderId - Mã đơn hàng
 * @param {number} amount - Số tiền
 * @param {string} description - Mô tả
 * @returns {Promise<object>} - Thông tin thanh toán
 */
exports.createPaymentInfo = async (orderId, amount, description = '') => {
    try {
        const qrCodeUrl = await exports.generateVietQR(orderId, amount, description);
        const bankInfo = exports.getBankInfo();
        const testAmount = Math.min(Math.round(amount / 1000), 50000);
        
        return {
            qrCodeUrl,
            amount,
            testAmount, // Số tiền test thực tế
            content: (description || `DH ${orderId}`).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(),
            bankInfo,
            orderId
        };
    } catch (error) {
        console.error('Error creating payment info:', error);
        throw error;
    }
};
