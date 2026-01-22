import { useState, useEffect } from 'react';
import './MediaManagement.css';

const MediaManagement = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, image, video, audio
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/upload/files', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setFiles(data.data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            alert('Lỗi khi tải danh sách file');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Kiểm tra kích thước file (100MB)
        if (file.size > 100 * 1024 * 1024) {
            alert('File quá lớn! Vui lòng chọn file nhỏ hơn 100MB');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/upload/qr-content', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                alert('Upload thành công!');
                fetchFiles(); // Refresh danh sách
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Lỗi khi upload file');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDelete = async (filename) => {
        if (!confirm(`Bạn có chắc muốn xóa file "${filename}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/upload/files/${filename}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                alert('Xóa file thành công!');
                fetchFiles(); // Refresh danh sách
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Lỗi khi xóa file');
        }
    };

    const handleDownload = (downloadUrl, filename) => {
        // Tạo link ảo để download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    };

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'image':
                return '🖼️';
            case 'video':
                return '🎬';
            case 'audio':
                return '🎵';
            default:
                return '📄';
        }
    };

    const filteredFiles = filter === 'all' 
        ? files 
        : files.filter(file => file.fileType === filter);

    if (loading) {
        return <div className="media-management"><p>Đang tải...</p></div>;
    }

    return (
        <div className="media-management">
            <div className="media-header">
                <h2>Quản lý Media (Hình ảnh, Video, Audio)</h2>
                <div className="upload-section">
                    <label className="upload-btn">
                        {uploading ? 'Đang upload...' : '📤 Upload File'}
                        <input 
                            type="file" 
                            accept="image/*,video/*,audio/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>

            <div className="filter-section">
                <button 
                    className={filter === 'all' ? 'active' : ''} 
                    onClick={() => setFilter('all')}
                >
                    Tất cả ({files.length})
                </button>
                <button 
                    className={filter === 'image' ? 'active' : ''} 
                    onClick={() => setFilter('image')}
                >
                    🖼️ Hình ảnh ({files.filter(f => f.fileType === 'image').length})
                </button>
                <button 
                    className={filter === 'video' ? 'active' : ''} 
                    onClick={() => setFilter('video')}
                >
                    🎬 Video ({files.filter(f => f.fileType === 'video').length})
                </button>
                <button 
                    className={filter === 'audio' ? 'active' : ''} 
                    onClick={() => setFilter('audio')}
                >
                    🎵 Audio ({files.filter(f => f.fileType === 'audio').length})
                </button>
            </div>

            {filteredFiles.length === 0 ? (
                <p className="no-files">Chưa có file nào được upload.</p>
            ) : (
                <div className="files-grid">
                    {filteredFiles.map((file) => (
                        <div key={file.filename} className="file-card">
                            <div className="file-preview">
                                {file.fileType === 'image' && (
                                    <img src={file.downloadUrl} alt={file.filename} />
                                )}
                                {file.fileType === 'video' && (
                                    <video src={file.downloadUrl} controls />
                                )}
                                {file.fileType === 'audio' && (
                                    <div className="audio-preview">
                                        <span className="file-icon-large">🎵</span>
                                        <audio src={file.downloadUrl} controls />
                                    </div>
                                )}
                            </div>
                            
                            <div className="file-info">
                                <div className="file-name" title={file.filename}>
                                    {getFileIcon(file.fileType)} {file.originalname || file.filename}
                                </div>
                                <div className="file-meta">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span>{formatDate(file.uploadDate)}</span>
                                </div>
                                {file.orderNumber && (
                                    <div className="order-badge" style={{
                                        backgroundColor: '#667eea',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        marginTop: '5px',
                                        display: 'inline-block',
                                        fontWeight: 'bold'
                                    }}>
                                        📦 Đơn: {file.orderNumber}
                                    </div>
                                )}
                                {file.customerName && (
                                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                        👤 {file.customerName}
                                    </div>
                                )}
                            </div>

                            <div className="file-actions">
                                <button 
                                    className="btn-download"
                                    onClick={() => handleDownload(file.downloadUrl, file.filename)}
                                    title="Tải về để tạo QR code thủ công"
                                >
                                    ⬇️ Tải về
                                </button>
                                <button 
                                    className="btn-view"
                                    onClick={() => window.open(file.viewUrl, '_blank')}
                                    title="Xem trong trình duyệt"
                                >
                                    👁️ Xem
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDelete(file.filename)}
                                    title="Xóa file"
                                >
                                    🗑️ Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="instructions">
                <h3>📝 Hướng dẫn:</h3>
                <ol>
                    <li>Người dùng upload hình ảnh/video/audio lên hệ thống</li>
                    <li>Admin xem danh sách file đã upload ở đây</li>
                    <li>Admin click "Tải về" để download file về máy</li>
                    <li>Admin tự tạo QR code thủ công từ file đã tải về</li>
                    <li>In QR code và sử dụng trong đời thực</li>
                </ol>
            </div>
        </div>
    );
};

export default MediaManagement;
