// Test Order API với VietQR
// Chạy: node test-order-api.js

const testOrderAPI = async () => {
    try {
        // Thay YOUR_TOKEN_HERE bằng token thực từ localStorage
        const token = 'YOUR_TOKEN_HERE';
        
        const orderData = {
            orderItems: [
                {
                    product: '507f1f77bcf86cd799439011', // MongoDB ObjectId mẫu
                    name: 'Test Product',
                    quantity: 1,
                    price: 100000,
                    image: 'test.jpg'
                }
            ],
            shippingAddress: {
                fullName: 'Nguyen Van A',
                phone: '0123456789',
                address: '123 Test Street',
                ward: 'Ward 1',
                district: 'District 1',
                province: 'Ho Chi Minh'
            },
            paymentMethod: 'VietQR',
            itemsPrice: 100000,
            shippingPrice: 0,
            totalPrice: 100000
        };

        console.log('Sending order request...');
        console.log('Order data:', JSON.stringify(orderData, null, 2));

        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        console.log('\nResponse status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

        if (data.success && data.paymentInfo) {
            console.log('\n✅ Success! QR Code URL:', data.paymentInfo.qrCodeUrl);
        } else {
            console.log('\n❌ Failed:', data.message);
        }
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
};

testOrderAPI();
