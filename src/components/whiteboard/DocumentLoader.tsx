import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Download, 
  Eye, 
  X,
  Loader
} from 'lucide-react';
import { documentsApi, handleApiError, downloadFile, type Document } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface DocumentLoaderProps {
  classId: number;
  onDocumentLoad: (imageUrls: string[]) => void;
  onClose: () => void;
}

const DocumentLoader: React.FC<DocumentLoaderProps> = ({ classId, onDocumentLoad, onClose }) => {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [documentPages, setDocumentPages] = useState<any[]>([]);

  useEffect(() => {
    loadDocuments();
  }, [classId, selectedDate]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedDate) {
        params.date = selectedDate;
      }

      const response = await documentsApi.getByClass(classId, params);
      setDocuments(response.data.data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      alert('Lỗi khi tải danh sách tài liệu: ' + handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = async (document: Document) => {
    if (document.status !== 'completed') {
      alert('Tài liệu đang được xử lý, vui lòng thử lại sau.');
      return;
    }

    try {
      setLoadingDocument(true);
      setSelectedDocument(document);

      // Get document details with pages
      const response = await documentsApi.getById(document.id);
      const { document: docDetails, pages } = response.data.data;
      
      setDocumentPages(pages || []);

      if (pages && pages.length > 0) {
        // Convert page paths to full URLs
        const imageUrls = pages.map((page: any) => {
          // Assuming the backend serves static files from /uploads
          return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${page.image_path}`;
        });
        
        onDocumentLoad(imageUrls);
        alert(`✅ Đã tải tài liệu "${document.title}" với ${pages.length} trang`);
      } else if (document.file_type === '.pdf') {
        alert('⚠️ Tài liệu PDF chưa được xử lý thành ảnh. Vui lòng thử lại sau.');
      } else {
        // For non-PDF files, we might want to show a placeholder or handle differently
        alert('📄 Tài liệu không phải PDF. Bạn có thể tải xuống để xem.');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      alert('Lỗi khi tải tài liệu: ' + handleApiError(error));
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await documentsApi.download(document.id);
      downloadFile(response.data, document.original_filename);
    } catch (error) {
      console.error('Download error:', error);
      alert('Lỗi khi tải xuống: ' + handleApiError(error));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Sẵn sàng';
      case 'processing':
        return 'Đang xử lý';
      case 'failed':
        return 'Lỗi';
      default:
        return 'Không xác định';
    }
  };

  // Get unique dates from documents
  const availableDates = [...new Set(documents.map(doc => doc.lesson_date))].sort().reverse();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                📚 Tài liệu lớp học
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Chọn tài liệu để hiển thị trong bảng trắng
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Date filter */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Lọc theo ngày:
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả ngày</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-500">
                {documents.length} tài liệu
              </div>
            </div>
          </div>

          {/* Document list */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Đang tải tài liệu...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài liệu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedDate 
                    ? 'Không có tài liệu nào cho ngày đã chọn.' 
                    : 'Chưa có tài liệu nào được tải lên cho lớp này.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      selectedDocument?.id === document.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {document.title}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                            {getStatusText(document.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(document.lesson_date)}
                          </div>
                          <div>{formatFileSize(document.file_size)}</div>
                          <div>{document.file_type}</div>
                          {document.total_pages > 0 && (
                            <div>{document.total_pages} trang</div>
                          )}
                        </div>
                        
                        {document.lesson_topic && (
                          <p className="text-xs text-gray-600 mt-1">
                            📖 {document.lesson_topic}
                          </p>
                        )}
                        
                        {document.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {document.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {/* Load to whiteboard button */}
                        {document.status === 'completed' && document.file_type === '.pdf' && (
                          <button
                            onClick={() => handleDocumentSelect(document)}
                            disabled={loadingDocument}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingDocument && selectedDocument?.id === document.id ? (
                              <>
                                <Loader className="h-3 w-3 mr-1 animate-spin" />
                                Đang tải...
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Hiển thị
                              </>
                            )}
                          </button>
                        )}

                        {/* Download button */}
                        <button
                          onClick={() => handleDownload(document)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          title="Tải xuống file gốc"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Tải về
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                💡 <strong>Hướng dẫn:</strong> Chọn "Hiển thị" để tải tài liệu PDF vào bảng trắng, "Tải về" để download file gốc
              </div>
              <div className="text-xs">
                {user?.role === 'teacher' ? '👨‍🏫 Giáo viên' : '👨‍🎓 Học sinh'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLoader;
