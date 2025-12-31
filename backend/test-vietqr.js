// Test VietQR Service
const vietqrService = require('./services/vietqrService');

async function testVietQR() {
    console.log('Testing VietQR service...');
    
    try {
        const paymentInfo = await vietqrService.createPaymentInfo(
            'TEST123',
            100000,
            'Test payment'
        );
        
        console.log('✅ Success!');
        console.log('Payment Info:', JSON.stringify(paymentInfo, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Stack:', error.stack);
    }
}

testVietQR();
