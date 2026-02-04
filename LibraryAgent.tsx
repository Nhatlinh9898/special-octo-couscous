import React, { useState, useEffect } from 'react';
import { Search, Book, Download, Star, Clock, Filter, Plus, BookOpen, HeadphonesIcon, FileText } from 'lucide-react';

interface BookItem {
  title: string;
  author: string;
  source: string;
  url: string;
  download_url: string;
  format: string;
  language: string;
  pages?: string;
  publication_year?: string;
  description: string;
  relevance_score: number;
  accessibility: string;
}

interface LibraryResponse {
  agent: string;
  task: string;
  response: {
    combined_results?: BookItem[];
    real_api_results?: { results: BookItem[] };
    ai_generated?: { search_results: BookItem[] };
    total_found?: number;
    sources?: string[];
  };
  confidence: number;
  processing_time: number;
  suggestions: string[];
}

export const LibraryAgent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [language, setLanguage] = useState('vi');
  const [format, setFormat] = useState('all');
  const [results, setResults] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [readingLists, setReadingLists] = useState<any[]>([]);
  const [showCreateList, setShowCreateList] = useState(false);

  const searchLibrary = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/v1/ai/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'search_digital_library',
          data: {
            query,
            subject,
            language,
            format_type: format,
            max_results: 20
          }
        })
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching library:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToReadingList = async (book: BookItem) => {
    try {
      const response = await fetch('/api/v1/ai/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'manage_reading_lists',
          data: {
            action: 'create',
            user_id: 'current_user',
            list_name: 'My Reading List',
            books: [book]
          }
        })
      });
      
      const data = await response.json();
      console.log('Added to reading list:', data);
    } catch (error) {
      console.error('Error adding to reading list:', error);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'ebook':
      case 'pdf':
        return <BookOpen className="w-4 h-4" />;
      case 'audiobook':
        return <HeadphonesIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getAccessibilityColor = (accessibility: string) => {
    switch (accessibility) {
      case 'free':
        return 'text-green-600 bg-green-100';
      case 'partial_free':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Book className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Thư Viện Số AI</h1>
        </div>

        {/* Search Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm sách
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nhập tên sách, tác giả..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && searchLibrary()}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="literature">Văn học</option>
                <option value="science">Khoa học</option>
                <option value="mathematics">Toán học</option>
                <option value="history">Lịch sử</option>
                <option value="technology">Công nghệ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngôn ngữ
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="all">Tất cả</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Định dạng
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="ebook">Ebook</option>
                <option value="audiobook">Audiobook</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={searchLibrary}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
            </button>

            <button
              onClick={() => setShowCreateList(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Tạo danh sách đọc
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Kết quả tìm kiếm ({results.response.total_found || 0} sách)
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {results.processing_time.toFixed(2)}s
              </div>
            </div>

            {results.response.sources && (
              <div className="flex flex-wrap gap-2 mb-4">
                {results.response.sources.map((source, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {source}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(results.response.combined_results || results.response.real_api_results?.results || []).map((book: BookItem, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Tác giả: {book.author}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessibilityColor(book.accessibility)}`}>
                      {book.accessibility === 'free' ? 'Miễn phí' : book.accessibility}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {getFormatIcon(book.format)}
                    <span className="text-xs text-gray-500">{book.format}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{book.language}</span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {book.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">
                        {(book.relevance_score * 5).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Nguồn: {book.source}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      <BookOpen className="w-3 h-3" />
                      Xem
                    </a>
                    {book.download_url && (
                      <a
                        href={book.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        <Download className="w-3 h-3" />
                        Tải
                      </a>
                    )}
                    <button
                      onClick={() => addToReadingList(book)}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    >
                      <Plus className="w-3 h-3" />
                      Lưu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {results?.suggestions && results.suggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Gợi ý:</h3>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              {results.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{selectedBook.title}</h2>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="font-semibold">Tác giả:</span> {selectedBook.author}
              </div>
              <div>
                <span className="font-semibold">Nguồn:</span> {selectedBook.source}
              </div>
              <div>
                <span className="font-semibold">Mô tả:</span> {selectedBook.description}
              </div>
              <div>
                <span className="font-semibold">Ngôn ngữ:</span> {selectedBook.language}
              </div>
              <div>
                <span className="font-semibold">Định dạng:</span> {selectedBook.format}
              </div>
              {selectedBook.pages && (
                <div>
                  <span className="font-semibold">Số trang:</span> {selectedBook.pages}
                </div>
              )}
              {selectedBook.publication_year && (
                <div>
                  <span className="font-semibold">Năm xuất bản:</span> {selectedBook.publication_year}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <a
                  href={selectedBook.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <BookOpen className="w-4 h-4" />
                  Đọc sách
                </a>
                {selectedBook.download_url && (
                  <a
                    href={selectedBook.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Tải xuống
                  </a>
                )}
                <button
                  onClick={() => addToReadingList(selectedBook)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  Thêm vào danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
