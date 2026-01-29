import { useState } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ onImagesUploaded, maxImages = 5, existingImages = [] }) => {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState(existingImages);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;

        // Kiểm tra số lượng ảnh
        if (previews.length + files.length > maxImages) {
            setError(`Chỉ được upload tối đa ${maxImages} ảnh`);
            return;
        }

        // Kiểm tra kích thước file
        const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            setError('Mỗi ảnh không được vượt quá 5MB');
            return;
        }

        setError('');
        setUploading(true);

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/upload/product-images', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                const newImages = [...previews, ...data.data.images];
                setPreviews(newImages);
                onImagesUploaded(newImages);
            } else {
                setError(data.message || 'Lỗi khi upload ảnh');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Lỗi khi upload ảnh. Vui lòng thử lại.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        const newImages = previews.filter((_, i) => i !== index);
        setPreviews(newImages);
        onImagesUploaded(newImages);
    };

    return (
        <div className="image-uploader">
            <div className="upload-area">
                <label htmlFor="image-input" className="upload-label">
                    <div className="upload-content">
                        {uploading ? (
                            <>
                                <div className="spinner"></div>
                                <p>Đang upload...</p>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-cloud-upload-alt"></i>
                                <p>Click để chọn ảnh</p>
                                <span>Tối đa {maxImages} ảnh, mỗi ảnh &lt; 5MB</span>
                            </>
                        )}
                    </div>
                </label>
                <input
                    type="file"
                    id="image-input"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading || previews.length >= maxImages}
                    style={{ display: 'none' }}
                />
            </div>

            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            {previews.length > 0 && (
                <div className="preview-grid">
                    {previews.map((url, index) => (
                        <div key={index} className="preview-item">
                            <img src={url} alt={`Preview ${index + 1}`} />
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeImage(index)}
                                title="Xóa ảnh"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                            {index === 0 && (
                                <span className="primary-badge">Ảnh chính</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
