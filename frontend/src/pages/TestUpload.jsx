import React, { useState } from 'react';
import './TestUpload.css';

const TestUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Tạo preview cho các ảnh
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
    setError('');
    setUploadedUrls([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Vui lòng chọn ảnh trước!');
      return;
    }

    setUploading(true);
    setError('');
    const formData = new FormData();
    
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/upload-simple/images', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedUrls(data.urls);
        alert(`✅ Upload thành công ${data.urls.length} ảnh!`);
      } else {
        setError(data.message || 'Upload thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('Đã copy URL vào clipboard!');
  };

  const copyAllUrls = () => {
    const allUrls = JSON.stringify(uploadedUrls, null, 2);
    navigator.clipboard.writeText(allUrls);
    alert('Đã copy tất cả URLs vào clipboard!');
  };

  return (
    <div className="test-upload-container">
      <div className="test-upload-card">
        <h1>🖼️ Test Upload Ảnh lên Cloudinary</h1>
        
        <div className="upload-section">
          <label htmlFor="file-input" className="file-label">
            📁 Chọn ảnh (có thể chọn nhiều)
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          
          {previews.length > 0 && (
            <div className="previews">
              <h3>Preview ({previews.length} ảnh):</h3>
              <div className="preview-grid">
                {previews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <p>{selectedFiles[index].name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="upload-btn"
          >
            {uploading ? '⏳ Đang upload...' : '🚀 Upload lên Cloudinary'}
          </button>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {uploadedUrls.length > 0 && (
            <div className="success-section">
              <h3>✅ Upload thành công!</h3>
              <button onClick={copyAllUrls} className="copy-all-btn">
                📋 Copy tất cả URLs
              </button>
              
              <div className="urls-list">
                {uploadedUrls.map((url, index) => (
                  <div key={index} className="url-item">
                    <img src={url} alt={`Uploaded ${index + 1}`} className="uploaded-thumb" />
                    <div className="url-info">
                      <code>{url}</code>
                      <button onClick={() => copyUrl(url)} className="copy-btn">
                        📋 Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="json-output">
                <h4>JSON format (để paste vào MongoDB):</h4>
                <pre>{JSON.stringify(uploadedUrls, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="instructions">
          <h3>📝 Hướng dẫn:</h3>
          <ol>
            <li><strong>KHÔNG CẦN</strong> cấu hình Cloudinary!</li>
            <li>Chạy backend server: <code>cd backend && npm start</code></li>
            <li>Chọn ảnh từ máy tính (có thể chọn nhiều ảnh cùng lúc)</li>
            <li>Click "Upload lên Cloudinary"</li>
            <li>Copy URLs để paste vào MongoDB Atlas</li>
          </ol>

          <div className="env-example">
            <h4>✅ Upload lên Server (Không cần Cloudinary)</h4>
            <p>
              Ảnh sẽ được lưu trong thư mục <code>backend/uploads/products</code>
            </p>
            <p>
              ⚠️ <strong>Lưu ý:</strong> Khi deploy lên Vercel/Netlify, ảnh sẽ bị mất. 
              Nên dùng Cloudinary cho production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestUpload;
