import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QRGenerator.css';

export default function QRGenerator({ onClose }) {
    const [qrData, setQrData] = useState('');
    const [contentType, setContentType] = useState('text');
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
    };

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
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
                            🔗 Website
                        </button>
                        <button
                            className={`qr-type-btn ${contentType === 'music' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('music')}
                        >
                            🎵 Nhạc
                        </button>
                        <button
                            className={`qr-type-btn ${contentType === 'video' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('video')}
                        >
                            🎬 Video
                        </button>
                        <button
                            className={`qr-type-btn ${contentType === 'image' ? 'active' : ''}`}
                            onClick={() => handleTypeChange('image')}
                        >
                            🖼️ Hình ảnh
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
                                <label>Nhập URL website:</label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => handleInputChange('url', e.target.value)}
                                    placeholder="https://example.com"
                                />
                                <small>Ví dụ: https://google.com, https://facebook.com</small>
                            </div>
                        )}

                        {contentType === 'music' && (
                            <div className="qr-form-group">
                                <label>Nhập link nhạc:</label>
                                <input
                                    type="url"
                                    value={formData.musicUrl}
                                    onChange={(e) => handleInputChange('musicUrl', e.target.value)}
                                    placeholder="https://spotify.com/track/..."
                                />
                                <small>Ví dụ: Spotify, YouTube Music, SoundCloud, Zing MP3</small>
                            </div>
                        )}

                        {contentType === 'video' && (
                            <div className="qr-form-group">
                                <label>Nhập link video:</label>
                                <input
                                    type="url"
                                    value={formData.videoUrl}
                                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                                <small>Ví dụ: YouTube, Vimeo, TikTok</small>
                            </div>
                        )}

                        {contentType === 'image' && (
                            <div className="qr-form-group">
                                <label>Nhập link hình ảnh:</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                <small>Link trực tiếp đến hình ảnh (.jpg, .png, .gif...)</small>
                            </div>
                        )}

                        <button className="qr-generate-btn" onClick={generateQR}>
                            ✨ Tạo QR Code
                        </button>
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
