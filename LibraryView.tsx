import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles, Loader2, BookOpen, CreditCard, Users, Calendar, AlertCircle, CheckCircle, XCircle, Edit, Trash2, Eye, UserCheck, Camera, ScanLine, Barcode } from 'lucide-react';
import { api } from './data';
import { aiService } from './aiService';
import { Book, AIAnalysisResult } from './types';
import { Button, Modal } from './components';

const LibraryView = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'books' | 'cards' | 'borrowing' | 'management'>('books');

  // AI States
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionResult, setSuggestionResult] = useState<AIAnalysisResult | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  // Book Management States
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    publisher: '',
    year: '',
    location: '',
    totalCopies: 1,
    availableCopies: 1
  });

  // Library Card States
  const [libraryCards, setLibraryCards] = useState<any[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [cardForm, setCardForm] = useState({
    userId: '',
    userType: 'STUDENT',
    fullName: '',
    email: '',
    phone: '',
    classId: ''
  });

  // Borrowing States
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowForm, setBorrowForm] = useState({
    bookId: '',
    cardId: '',
    dueDate: ''
  });

  // Barcode Scanner States
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannerMode, setScannerMode] = useState<'add' | 'borrow' | 'return'>('add');

  // Mock data
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    api.getBooks().then(setBooks);
    // Load mock data for library cards and borrowings
    setLibraryCards([
      { id: 1, userId: 1001, userType: 'STUDENT', fullName: 'Tran Minh Tuan', email: 'tuan@st.edu.vn', phone: '0987654321', classId: 1, status: 'ACTIVE', issueDate: '2023-09-01', expiryDate: '2024-09-01' },
      { id: 2, userId: 101, userType: 'TEACHER', fullName: 'Nguyen Van A', email: 'anv@school.edu.vn', phone: '0901234567', status: 'ACTIVE', issueDate: '2023-08-15', expiryDate: '2024-08-15' },
    ]);
    setBorrowings([
      { id: 1, bookId: 1, bookTitle: 'Đại số 10 Nâng cao', cardId: 1, borrowerName: 'Tran Minh Tuan', borrowDate: '2023-11-01', dueDate: '2023-11-15', returnDate: null, status: 'BORROWED' },
      { id: 2, bookId: 2, bookTitle: 'Vật Lý Đại Cương', cardId: 2, borrowerName: 'Nguyen Van A', borrowDate: '2023-10-20', dueDate: '2023-11-03', returnDate: '2023-11-02', status: 'RETURNED' },
    ]);
    setStudents([
      { id: 1001, code: 'HS001', fullName: 'Tran Minh Tuan', classId: 1, email: 'tuan@st.edu.vn' },
      { id: 1002, code: 'HS002', fullName: 'Le Thu Ha', classId: 1, email: 'ha@st.edu.vn' },
    ]);
    setTeachers([
      { id: 101, fullName: 'Nguyen Van A', email: 'anv@school.edu.vn', major: 'Toán Học' },
      { id: 102, fullName: 'Tran Thi B', email: 'btt@school.edu.vn', major: 'Ngữ Văn' },
    ]);
  }, []);

  const handleAISuggest = async () => {
    setIsSuggesting(true);
    try {
      const result = await aiService.library.suggestBooks();
      setSuggestionResult(result);
      setShowSuggestionModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddBook = () => {
    const newBook: Book = {
      id: Date.now(),
      title: bookForm.title,
      author: bookForm.author,
      category: bookForm.category,
      status: 'AVAILABLE',
      cover: `https://placehold.co/150x220/e2e8f0/1e293b?text=${encodeURIComponent(bookForm.title)}`,
    };
    setBooks([newBook, ...books]);
    setShowAddBookModal(false);
    setBookForm({
      title: '',
      author: '',
      category: '',
      isbn: '',
      publisher: '',
      year: '',
      location: '',
      totalCopies: 1,
      availableCopies: 1
    });
    alert('Thêm sách thành công!');
  };

  const handleAddLibraryCard = () => {
    const newCard = {
      id: Date.now(),
      ...cardForm,
      status: 'ACTIVE',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
    };
    setLibraryCards([newCard, ...libraryCards]);
    setShowAddCardModal(false);
    setCardForm({
      userId: '',
      userType: 'STUDENT',
      fullName: '',
      email: '',
      phone: '',
      classId: ''
    });
    alert('Cấp thẻ thư viện thành công!');
  };

  const handleBorrowBook = () => {
    const book = books.find(b => b.id === parseInt(borrowForm.bookId));
    const card = libraryCards.find(c => c.id === parseInt(borrowForm.cardId));
    
    if (book && card) {
      const newBorrowing = {
        id: Date.now(),
        bookId: book.id,
        bookTitle: book.title,
        cardId: card.id,
        borrowerName: card.fullName,
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: borrowForm.dueDate,
        returnDate: null,
        status: 'BORROWED'
      };
      
      setBorrowings([newBorrowing, ...borrowings]);
      setBooks(books.map(b => b.id === book.id ? { ...b, status: 'BORROWED' } : b));
      setShowBorrowModal(false);
      setBorrowForm({ bookId: '', cardId: '', dueDate: '' });
      alert('Mượn sách thành công!');
    }
  };

  const handleReturnBook = (borrowingId: number) => {
    const borrowing = borrowings.find(b => b.id === borrowingId);
    if (borrowing) {
      setBorrowings(borrowings.map(b => 
        b.id === borrowingId 
          ? { ...b, status: 'RETURNED', returnDate: new Date().toISOString().split('T')[0] }
          : b
      ));
      setBooks(books.map(b => b.id === borrowing.bookId ? { ...b, status: 'AVAILABLE' } : b));
      alert('Trả sách thành công!');
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    setScannedBarcode(barcode);
    setIsScanning(false);
    
    // Simulate barcode lookup
    const mockBookData: any = {
      '9781234567890': {
        title: 'Lập trình Python Cơ bản',
        author: 'Nguyễn Văn A',
        category: 'Tin Học',
        isbn: '9781234567890',
        publisher: 'Nhà xuất bản Giáo dục',
        year: '2023',
        location: 'Kệ A, Tầng 1'
      },
      '9780987654321': {
        title: 'Toán Học Nâng Cao',
        author: 'Trần Thị B',
        category: 'Sách Giáo Khoa',
        isbn: '9780987654321',
        publisher: 'Nhà xuất bản Khoa học',
        year: '2022',
        location: 'Kệ B, Tầng 2'
      }
    };

    const bookData = mockBookData[barcode];
    if (bookData) {
      if (scannerMode === 'add') {
        setBookForm({
          ...bookForm,
          ...bookData,
          totalCopies: 1,
          availableCopies: 1
        });
        setShowAddBookModal(true);
        alert(`Đã tìm thấy sách: ${bookData.title}`);
      } else if (scannerMode === 'borrow') {
        const existingBook = books.find(b => b.isbn === barcode);
        if (existingBook) {
          setBorrowForm({
            ...borrowForm,
            bookId: existingBook.id.toString()
          });
          setShowBorrowModal(true);
          alert(`Đã chọn sách: ${existingBook.title}`);
        } else {
          alert('Sách không có trong hệ thống!');
        }
      }
    } else {
      alert('Không tìm thấy thông tin sách cho mã vạch này!');
    }
    
    setShowBarcodeScanner(false);
  };

  const startBarcodeScan = (mode: 'add' | 'borrow' | 'return') => {
    setScannerMode(mode);
    setIsScanning(true);
    setShowBarcodeScanner(true);
    setScannedBarcode('');
    
    // Simulate barcode scanning
    setTimeout(() => {
      const mockBarcodes = ['9781234567890', '9780987654321'];
      const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      handleBarcodeScan(randomBarcode);
    }, 3000);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thư Viện</h2>
          <p className="text-gray-500">Quản lý sách, thẻ thư viện và mượn trả</p>
        </div>
        <div className="flex gap-2">
           <Button 
             variant="secondary" 
             className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100"
             onClick={handleAISuggest}
             disabled={isSuggesting}
           >
             {isSuggesting ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18}/>}
             {isSuggesting ? 'AI Đang tìm...' : 'AI Gợi ý Sách'}
           </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'books'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen size={16} className="inline mr-2" />
          Quản lý Sách
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'cards'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <CreditCard size={16} className="inline mr-2" />
          Thẻ Thư viện
        </button>
        <button
          onClick={() => setActiveTab('borrowing')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'borrowing'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Users size={16} className="inline mr-2" />
          Mượn/Trả
        </button>
      </div>

      {/* Books Management Tab */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative flex-1 mr-4">
              <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Tìm kiếm sách theo tên, tác giả..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddBookModal(true)}>
                <Plus size={18} /> Nhập Sách Mới
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => startBarcodeScan('add')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ScanLine size={18} /> Quét Mã Vạch
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
             {filteredBooks.map(book => (
               <div key={book.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group flex flex-col h-full">
                  <div className="aspect-[2/3] bg-gray-200 relative overflow-hidden">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    {book.status === 'BORROWED' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold rounded-full transform -rotate-12">ĐÃ MƯỢN</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                     <h3 className="font-bold text-gray-800 leading-tight mb-1 line-clamp-2" title={book.title}>{book.title}</h3>
                     <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                     <div className="mt-auto">
                       <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{book.category}</span>
                       <div className="flex gap-1 mt-2">
                         <Button variant="secondary" className="flex-1 text-xs !py-1" onClick={() => setShowBorrowModal(true)}>
                           Mượn sách
                         </Button>
                         <Button variant="secondary" className="p-1 !py-1" onClick={() => {setSelectedBook(book); setShowEditBookModal(true);}}>
                           <Edit size={12} />
                         </Button>
                       </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Library Cards Tab */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quản lý Thẻ Thư viện</h3>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddCardModal(true)}>
                <Plus size={18} /> Cấp Thẻ Mới
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => startBarcodeScan('borrow')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ScanLine size={18} /> Quét Mượn Sách
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Thẻ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Hết Hạn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {libraryCards.map(card => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">#{card.id}</td>
                    <td className="px-6 py-4 text-sm">{card.fullName}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        card.userType === 'STUDENT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {card.userType === 'STUDENT' ? 'Học sinh' : 'Giáo viên'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{card.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        card.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {card.status === 'ACTIVE' ? 'Hoạt động' : 'Khoá'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{card.expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Borrowing Management Tab */}
      {activeTab === 'borrowing' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Quản lý Mượn/Trả Sách</h3>
            <div className="flex gap-2">
              <Button onClick={() => setShowBorrowModal(true)}>
                <Plus size={18} /> Mượn Sách
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => startBarcodeScan('return')}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <ScanLine size={18} /> Quét Trả Sách
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sách</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người Mượn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Mượn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn Trả</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {borrowings.map(borrowing => (
                  <tr key={borrowing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{borrowing.bookTitle}</td>
                    <td className="px-6 py-4 text-sm">{borrowing.borrowerName}</td>
                    <td className="px-6 py-4 text-sm">{borrowing.borrowDate}</td>
                    <td className="px-6 py-4 text-sm">{borrowing.dueDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        borrowing.status === 'BORROWED' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {borrowing.status === 'BORROWED' ? 'Đang mượn' : 'Đã trả'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {borrowing.status === 'BORROWED' && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleReturnBook(borrowing.id)}
                        >
                          Trả sách
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showSuggestionModal} onClose={() => setShowSuggestionModal(false)} title="Gợi ý từ AI Thủ thư">
         {suggestionResult && (
            <div className="space-y-4">
               <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-bold text-purple-800 mb-2">{suggestionResult.title}</h4>
                  <p className="text-purple-700 text-sm">{suggestionResult.summary}</p>
               </div>
               
               <div>
                  <h5 className="font-semibold mb-2 flex items-center gap-2"><BookOpen size={16}/> Sách nên nhập thêm:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {suggestionResult.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                     ))}
                  </ul>
               </div>
               <div className="flex justify-end pt-2">
                  <Button onClick={() => setShowSuggestionModal(false)}>Đóng</Button>
               </div>
            </div>
         )}
      </Modal>

      {/* Add Book Modal */}
      <Modal isOpen={showAddBookModal} onClose={() => setShowAddBookModal(false)} title="Nhập Sách Mới" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách</label>
                  <input
                     type="text"
                     value={bookForm.title}
                     onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập tên sách"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                  <input
                     type="text"
                     value={bookForm.author}
                     onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập tác giả"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại</label>
                  <select
                     value={bookForm.category}
                     onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn thể loại</option>
                     <option value="Sách Giáo Khoa">Sách Giáo Khoa</option>
                     <option value="Tham Khảo">Tham Khảo</option>
                     <option value="Văn Học">Văn Học</option>
                     <option value="Khoa Học">Khoa Học</option>
                     <option value="Lịch Sử">Lịch Sử</option>
                     <option value="Tin Học">Tin Học</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                  <input
                     type="text"
                     value={bookForm.isbn}
                     onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập ISBN"
                  />
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà xuất bản</label>
                  <input
                     type="text"
                     value={bookForm.publisher}
                     onChange={(e) => setBookForm({...bookForm, publisher: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhà xuất bản"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm xuất bản</label>
                  <input
                     type="number"
                     value={bookForm.year}
                     onChange={(e) => setBookForm({...bookForm, year: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="2023"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                  <input
                     type="text"
                     value={bookForm.location}
                     onChange={(e) => setBookForm({...bookForm, location: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Kệ A, Tầng 1"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tổng</label>
                  <input
                     type="number"
                     value={bookForm.totalCopies}
                     onChange={(e) => setBookForm({...bookForm, totalCopies: parseInt(e.target.value)})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="1"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng có sẵn</label>
                  <input
                     type="number"
                     value={bookForm.availableCopies}
                     onChange={(e) => setBookForm({...bookForm, availableCopies: parseInt(e.target.value)})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     min="0"
                     max={bookForm.totalCopies}
                  />
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowAddBookModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleAddBook} disabled={!bookForm.title || !bookForm.author}>
                  Nhập sách
               </Button>
            </div>
         </div>
      </Modal>

      {/* Add Library Card Modal */}
      <Modal isOpen={showAddCardModal} onClose={() => setShowAddCardModal(false)} title="Cấp Thẻ Thư viện Mới" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại người dùng</label>
                  <select
                     value={cardForm.userType}
                     onChange={(e) => setCardForm({...cardForm, userType: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="STUDENT">Học sinh</option>
                     <option value="TEACHER">Giáo viên</option>
                     <option value="STAFF">Nhân viên</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                     type="text"
                     value={cardForm.fullName}
                     onChange={(e) => setCardForm({...cardForm, fullName: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Nhập họ và tên"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                     type="email"
                     value={cardForm.email}
                     onChange={(e) => setCardForm({...cardForm, email: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="email@example.com"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                     type="tel"
                     value={cardForm.phone}
                     onChange={(e) => setCardForm({...cardForm, phone: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="09xxxxxxxx"
                  />
               </div>
            </div>

            {cardForm.userType === 'STUDENT' && (
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                  <select
                     value={cardForm.classId}
                     onChange={(e) => setCardForm({...cardForm, classId: e.target.value})}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                     <option value="">Chọn lớp</option>
                     <option value="1">Lớp 10A1</option>
                     <option value="2">Lớp 11B2</option>
                     <option value="3">Lớp 12C3</option>
                  </select>
               </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowAddCardModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleAddLibraryCard} disabled={!cardForm.fullName || !cardForm.email}>
                  Cấp thẻ
               </Button>
            </div>
         </div>
      </Modal>

      {/* Borrow Book Modal */}
      <Modal isOpen={showBorrowModal} onClose={() => setShowBorrowModal(false)} title="Mượn Sách" maxWidth="max-w-2xl">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Chọn sách</label>
               <select
                  value={borrowForm.bookId}
                  onChange={(e) => setBorrowForm({...borrowForm, bookId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                  <option value="">Chọn sách</option>
                  {books.filter(book => book.status === 'AVAILABLE').map(book => (
                     <option key={book.id} value={book.id}>
                        {book.title} - {book.author}
                     </option>
                  ))}
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Chọn thẻ thư viện</label>
               <select
                  value={borrowForm.cardId}
                  onChange={(e) => setBorrowForm({...borrowForm, cardId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                  <option value="">Chọn thẻ</option>
                  {libraryCards.filter(card => card.status === 'ACTIVE').map(card => (
                     <option key={card.id} value={card.id}>
                        {card.fullName} ({card.userType === 'STUDENT' ? 'Học sinh' : 'Giáo viên'})
                     </option>
                  ))}
               </select>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Hạn trả</label>
               <input
                  type="date"
                  value={borrowForm.dueDate}
                  onChange={(e) => setBorrowForm({...borrowForm, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
               />
            </div>

            <div className="flex justify-end gap-2 pt-4">
               <Button variant="secondary" onClick={() => setShowBorrowModal(false)}>
                  Hủy
               </Button>
               <Button onClick={handleBorrowBook} disabled={!borrowForm.bookId || !borrowForm.cardId || !borrowForm.dueDate}>
                  Xác nhận mượn sách
               </Button>
            </div>
         </div>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal isOpen={showBarcodeScanner} onClose={() => setShowBarcodeScanner(false)} title="Quét Mã Vạch Sách" maxWidth="max-w-md">
         <div className="space-y-4">
            <div className="text-center">
               <div className="mb-4">
                  <div className="w-64 h-64 mx-auto border-4 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50">
                     {isScanning ? (
                        <>
                           <div className="animate-pulse mb-4">
                              <ScanLine size={48} className="text-blue-600" />
                           </div>
                           <p className="text-gray-600 font-medium">Đang quét mã vạch...</p>
                           <p className="text-sm text-gray-500 mt-2">Vui lòng đưa mã vạch vào vùng quét</p>
                           <div className="mt-4">
                              <div className="w-32 h-1 bg-blue-600 animate-pulse rounded"></div>
                           </div>
                        </>
                     ) : (
                        <>
                           <Camera size={48} className="text-gray-400 mb-4" />
                           <p className="text-gray-600 font-medium">Máy quét mã vạch</p>
                           <p className="text-sm text-gray-500 mt-2">Sẵn sàng quét</p>
                        </>
                     )}
                  </div>
               </div>

               {scannedBarcode && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <span className="font-medium text-green-800">Đã quét thành công!</span>
                     </div>
                     <p className="text-sm text-gray-700">
                        <strong>Mã vạch:</strong> {scannedBarcode}
                     </p>
                  </div>
               )}

               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                     <Barcode size={16} />
                     Hướng dẫn sử dụng:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                     <li>• Đưa mã vạch của sách vào vùng quét</li>
                     <li>• Đảm bảo ánh sáng đủ để quét rõ</li>
                     <li>• Giữ máy quét cách sách khoảng 10-15cm</li>
                     <li>• Chờ cho hệ thống nhận diện mã vạch</li>
                  </ul>
               </div>

               <div className="flex justify-end gap-2 pt-4">
                  <Button 
                     variant="secondary" 
                     onClick={() => {
                        setShowBarcodeScanner(false);
                        setIsScanning(false);
                        setScannedBarcode('');
                     }}
                  >
                     Hủy
                  </Button>
                  {!isScanning && !scannedBarcode && (
                     <Button 
                        onClick={() => {
                           setIsScanning(true);
                           // Simulate scanning again
                           setTimeout(() => {
                              const mockBarcodes = ['9781234567890', '9780987654321'];
                              const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
                              handleBarcodeScan(randomBarcode);
                           }, 2000);
                        }}
                     >
                        Quét lại
                     </Button>
                  )}
               </div>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default LibraryView;