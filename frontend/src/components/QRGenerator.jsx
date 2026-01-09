import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getBackendUrl } from '../services/api';
import api from '../services/api';
import './QRGenerator.css';

export default function QRGenerator({ onClose }) {
    const [qrData, setQrData] = useState('');
    const [contentType, setContentType] = useState('text');
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [formData, setFormData] = useState({
        text: '',
        url: '',
        musicUrl: '',
        videoUrl: '',
        imageUrl: ''
    });

    const handleTypeChange = (type) => {
        setContentType(type);
        setQrData('');
        setUploadedFile(null);
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type based on content type
        const validTypes = {
            'upload-video': ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
            'upload-image': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
            'upload-audio': ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/mpeg']
        };

        const allowedTypes = validTypes[contentType] || [];
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            alert(`File không đúng định dạng! Vui lòng chọn file ${contentType.replace('upload-', '')}.`);
            return;
        }

        setUploading(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('file', file);

            const response = await api.post('/upload/qr-content', formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const fileUrl = response.data.data.url;
                const warning = response.data.data.warning;
                
                setUploadedFile({
                    url: fileUrl,
                    name: file.name,
                    type: file.type
                });
                // Auto generate QR after upload
                setQrData(fileUrl);
                
                // Hiện cảnh báo nếu URL chứa localhost
                if (warning) {
                    alert(`⚠️ CẢNH BÁO:\n\n${warning}\n\n💡 Giải pháp:\n- Dùng Ngrok: ngrok http 5000\n- Hoặc deploy backend lên Render\n- Xem file QR-FIX-LOCALHOST.md để biết chi tiết`);
                } else if (fileUrl.includes('localhost') || fileUrl.includes('127.0.0.1')) {
                    alert('⚠️ CẢNH BÁO:\n\nQR code chứa localhost, chỉ truy cập được từ máy này.\n\n💡 Để quét từ điện thoại:\n1. Dùng Ngrok: ngrok http 5000\n2. Hoặc deploy backend\n\nXem QR-FIX-LOCALHOST.md để biết chi tiết!');
                } else {
                    alert('✅ Upload thành công! QR code đã được tạo.\n\n🎉 Bạn có thể quét QR từ bất kỳ thiết bị nào!');
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(error.response?.data?.message || 'Lỗi khi upload file');
        } finally {
            setUploading(false);
        }
    };

    const generateQR = () => {
        let data = '';
        
        switch (contentType) {
            case 'text':
                data = formData.text;
                break;
            case 'url':
                data = formData.url;
                break;
            case 'music':
                data = formData.musicUrl;
                break;
            case 'video':
                data = formData.videoUrl;
                break;
            case 'image':
                data = formData.imageUrl;
                break;
            default:
                data = '';
        }

        if (data.trim()) {
            setQrData(data);
        } else {
            alert('Vui lòng nhập nội dung để tạo QR code');
        }
    };

    const downloadQR = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            
            const downloadLink = document.createElement('a');
            downloadLink.download = 'qr-code.png';
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="qr-generator-overlay">
            <div className="qr-generator-modal">
                <div className="qr-generator-header">
                    <h2>🎨 Tạo QR Code Tùy Chỉnh</h2>
                    <button className="qr-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="qr-generator-content">
                    {/* Type Selection */}
                    <div className="qr-type-selection">
                        <button
                            className={`qr-type-btn ${contentType === 'text' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('text')}
                        >
                            📝 Văn bản
                        </button>
                        <button
                            className={`qr-type-btn ${contentType === 'url' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('url')}
                        >
                            🔗 Link (Website, YouTube, Nhạc, Video)
                        </button>
                        <button
                            className={`qr-type-btn ${contentType === 'upload-image' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('upload-image')}
                        >
                            🖼️ Upload Hình ảnh
                        </button>
                        <button
                            className={`qr-type-btn ${contentType === 'upload-video' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('upload-video')}
                        >
                            🎬 Upload Video
                        </button>
                        <button
                            className={`qr-type-btn ${contentType === 'upload-audio' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('upload-audio')}
                        >
                            🎵 Upload Nhạc
                        </button>
                    </div>

                    {/* Input Forms */}
                    <div className="qr-input-section">
                        {contentType === 'text' && (
                            <div className="qr-form-group">
                                <label>Nhập văn bản của bạn:</label>
                                <textarea
                                    value={formData.text}
                                    onChange={(e) => handleInputChange('text', e.target.value)}
                                    placeholder="Nhập bất kỳ văn bản nào bạn muốn..."
                                    rows="4"
                                />
                            </div>
                        )}

                        {contentType === 'url' && (
                            <div className="qr-form-group">
                                <label>Nhập URL (Website, YouTube, Nhạc, Video...):</label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => handleInputChange('url', e.target.value)}
                                    placeholder="https://example.com"
                                />
                                <small>Ví dụ: https://google.com, https://youtube.com/watch?v=..., https://spotify.com/...</small>
                            </div>
                        )}

                        {contentType === 'upload-image' && (
                            <div className="qr-form-group">
                                <label>📤 Upload Hình ảnh từ máy:</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <small>Chọn file hình ảnh (.jpg, .png, .gif). Sau khi quét QR sẽ hiển thị ảnh trực tiếp.</small>
                                {uploading && <p className="upload-status">⏳ Đang upload...</p>}
                                {uploadedFile && (
                                    <div className="upload-preview">
                                        <p>✅ Đã upload: {uploadedFile.name}</p>
                                        <img src={uploadedFile.url} alt="Preview" style={{maxWidth: '200px', marginTop: '10px'}} />
                                    </div>
                                )}
                            </div>
                        )}

                        {contentType === 'upload-video' && (
                            <div className="qr-form-group">
                                <label>📤 Upload Video từ máy:</label>
                                <input
                                    type="file"
                                    accept="video/mp4,video/avi,video/mov,video/webm"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <small>Chọn file video (.mp4, .avi, .mov, .webm). Sau khi quét QR sẽ xem video trực tiếp.</small>
                                {uploading && <p className="upload-status">⏳ Đang upload...</p>}
                                {uploadedFile && (
                                    <div className="upload-preview">
                                        <p>✅ Đã upload: {uploadedFile.name}</p>
                                        <video src={uploadedFile.url} controls style={{maxWidth: '300px', marginTop: '10px'}} />
                                    </div>
                                )}
                            </div>
                        )}

                        {contentType === 'upload-audio' && (
                            <div className="qr-form-group">
                                <label>📤 Upload Nhạc/Audio từ máy:</label>
                                <input
                                    type="file"
                                    accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/mpeg"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <small>Chọn file audio (.mp3, .wav, .m4a, .ogg). Sau khi quét QR sẽ nghe nhạc trực tiếp.</small>
                                {uploading && <p className="upload-status">⏳ Đang upload...</p>}
                                {uploadedFile && (
                                    <div className="upload-preview">
                                        <p>✅ Đã upload: {uploadedFile.name}</p>
                                        <audio src={uploadedFile.url} controls style={{marginTop: '10px', width: '100%'}} />
                                    </div>
                                )}
                            </div>
                        )}

                        {!contentType.startsWith('upload-') && (
                            <button className="qr-generate-btn" onClick={generateQR}>
                                ✨ Tạo QR Code
                            </button>
                        )}
                    </div>

                    {/* QR Code Display */}
                    {qrData && (
                        <div className="qr-display-section">
                            <div className="qr-code-container">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={qrData}
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                    bgColor="#ffffff"
                                    fgColor="#5d4e37"
                                />
                            </div>
                            <div className="qr-preview-info">
                                <p className="qr-info-label">Nội dung:</p>
                                <p className="qr-info-content">{qrData.length > 100 ? qrData.substring(0, 100) + '...' : qrData}</p>
                            </div>
                            <button className="qr-download-btn" onClick={downloadQR}>
                                📥 Tải QR Code
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
