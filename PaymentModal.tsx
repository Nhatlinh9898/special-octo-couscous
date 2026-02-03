import React, { useState, useEffect } from 'react';
import { DollarSign, Smartphone, QrCode, CheckCircle, X, CreditCard, Building2, AlertCircle } from 'lucide-react';
import { Button, Modal } from './components';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: {
    type: string;
    amount: number;
    description: string;
    recipient: string;
    transactionId: number;
  };
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, paymentData }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'transfer' | 'qr' | 'cash'>('transfer');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [senderInfo, setSenderInfo] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    phone: '',
    email: ''
  });
  const [showSenderForm, setShowSenderForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPaymentMethod('transfer');
      setIsProcessingPayment(false);
      setPaymentSuccess(false);
      setSenderInfo({
        accountNumber: '',
        accountName: '',
        bankName: '',
        phone: '',
        email: ''
      });
      setShowSenderForm(false);
    }
  }, [isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const processPayment = async () => {
    // Validation for sender information
    if (selectedPaymentMethod !== 'cash') {
      if (!senderInfo.accountNumber || !senderInfo.accountName || !senderInfo.bankName) {
        alert('Vui lòng điền đầy đủ thông tin người chuyển khoản (Số tài khoản, Chủ tài khoản, Ngân hàng)');
        return;
      }
    } else {
      if (!senderInfo.accountName || !senderInfo.phone) {
        alert('Vui lòng điền đầy đủ thông tin (Họ tên, Số điện thoại)');
        return;
      }
    }

    setIsProcessingPayment(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update transaction status
    const existingTransactions = JSON.parse(localStorage.getItem('financialTransactions') || '[]');
    const updatedTransactions = existingTransactions.map((transaction: any) => {
      if (transaction.id === paymentData.transactionId) {
        return {
          ...transaction,
          status: 'Completed',
          paymentMethod: selectedPaymentMethod,
          completedDate: new Date().toISOString(),
          senderInfo: selectedPaymentMethod !== 'cash' ? senderInfo : {
            name: senderInfo.accountName,
            phone: senderInfo.phone,
            email: senderInfo.email
          }
        };
      }
      return transaction;
    });
    
    localStorage.setItem('financialTransactions', JSON.stringify(updatedTransactions));
    
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    
    // Auto close after success
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thanh toán Quyên góp">
      <div className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="font-semibold text-blue-800 mb-2">Thông tin thanh toán</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Loại:</span>
              <span className="font-medium">Quyên góp {paymentData.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Người nhận:</span>
              <span className="font-medium">{paymentData.recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mô tả:</span>
              <span className="font-medium">{paymentData.description}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-700">Số tiền:</span>
              <span className="text-blue-600">{formatCurrency(paymentData.amount)}</span>
            </div>
          </div>
        </div>

        {!paymentSuccess ? (
          <>
            {/* Payment Methods */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Chọn phương thức thanh toán</h4>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setSelectedPaymentMethod('transfer')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'transfer'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`w-8 h-8 ${selectedPaymentMethod === 'transfer' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-500">Thanh toán qua Internet Banking</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod('qr')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'qr'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className={`w-8 h-8 ${selectedPaymentMethod === 'qr' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-medium">QR Code</div>
                      <div className="text-sm text-gray-500">Quét mã QR để thanh toán</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedPaymentMethod('cash')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedPaymentMethod === 'cash'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className={`w-8 h-8 ${selectedPaymentMethod === 'cash' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-medium">Tiền mặt</div>
                      <div className="text-sm text-gray-500">Thanh toán trực tiếp tại trường</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Thông tin thanh toán</h4>
              {selectedPaymentMethod === 'transfer' && (
                <div className="space-y-4">
                  {/* Sender Information Form */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-blue-800">Thông tin người chuyển khoản</h5>
                      <button
                        onClick={() => setShowSenderForm(!showSenderForm)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {showSenderForm ? 'Ẩn' : 'Hiển thị'} form
                      </button>
                    </div>
                    
                    {showSenderForm && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản *</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={senderInfo.accountNumber}
                              onChange={(e) => setSenderInfo({...senderInfo, accountNumber: e.target.value})}
                              placeholder="Nhập số tài khoản của bạn"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Chủ tài khoản *</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={senderInfo.accountName}
                              onChange={(e) => setSenderInfo({...senderInfo, accountName: e.target.value})}
                              placeholder="Tên chủ tài khoản"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng *</label>
                            <select
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={senderInfo.bankName}
                              onChange={(e) => setSenderInfo({...senderInfo, bankName: e.target.value})}
                            >
                              <option value="">Chọn ngân hàng</option>
                              <option value="VCB">Vietcombank</option>
                              <option value="TCB">Techcombank</option>
                              <option value="VTB">Vietinbank</option>
                              <option value="MBB">MB Bank</option>
                              <option value="ACB">ACB</option>
                              <option value="STB">Sacombank</option>
                              <option value="VAB">Vietcombank</option>
                              <option value="OTHER">Khác</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input
                              type="tel"
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={senderInfo.phone}
                              onChange={(e) => setSenderInfo({...senderInfo, phone: e.target.value})}
                              placeholder="09xxxxxxxx"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            value={senderInfo.email}
                            onChange={(e) => setSenderInfo({...senderInfo, email: e.target.value})}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recipient Information */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h5 className="font-semibold text-gray-800">Thông tin tài khoản nhận</h5>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Ngân hàng:</p>
                      <p className="text-sm">Vietcombank - Chi nhánh Hà Nội</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Số tài khoản:</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono bg-white p-2 rounded border flex-1">0011001234567</p>
                        <button 
                          onClick={() => navigator.clipboard.writeText('0011001234567')}
                          className="px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Chủ tài khoản:</p>
                      <p className="text-sm">QUỸ PHÁT TRIỂN TRƯỜNG ABC</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nội dung chuyển khoản:</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono bg-white p-2 rounded border flex-1">Quyen-gop-{paymentData.transactionId}</p>
                        <button 
                          onClick={() => navigator.clipboard.writeText(`Quyen-gop-${paymentData.transactionId}`)}
                          className="px-3 py-2 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                        >
                          Sao chép
                        </button>
                      </div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-700">
                        <AlertCircle className="inline w-4 h-4 mr-1" />
                        Vui lòng chuyển đúng số tiền và ghi đúng nội dung để chúng tôi có thể xác nhận.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'qr' && (
                <div className="space-y-4">
                  {/* Sender Information for QR */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-blue-800">Thông tin người thanh toán</h5>
                      <button
                        onClick={() => setShowSenderForm(!showSenderForm)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {showSenderForm ? 'Ẩn' : 'Hiển thị'} form
                      </button>
                    </div>
                    
                    {showSenderForm && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={senderInfo.accountName}
                              onChange={(e) => setSenderInfo({...senderInfo, accountName: e.target.value})}
                              placeholder="Nhập họ tên của bạn"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                            <input
                              type="tel"
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={senderInfo.phone}
                              onChange={(e) => setSenderInfo({...senderInfo, phone: e.target.value})}
                              placeholder="09xxxxxxxx"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            value={senderInfo.email}
                            onChange={(e) => setSenderInfo({...senderInfo, email: e.target.value})}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QR Code Display */}
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h5 className="font-semibold text-gray-800 mb-3">Quét mã QR để thanh toán</h5>
                    
                    {/* Generate QR Code URL */}
                    <div className="w-64 h-64 bg-white mx-auto rounded-lg flex items-center justify-center border-2 border-gray-200 mb-4">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bank:0011001234567?amount=${paymentData.amount}&message=Quyen-gop-${paymentData.transactionId}`}
                        alt="Payment QR Code"
                        className="w-56 h-56"
                        onError={(e) => {
                          // Fallback if QR generation fails
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden">
                        <QrCode size={120} className="text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">Sử dụng ứng dụng ngân hàng để quét mã QR</p>
                      <p className="text-gray-500">Mã QR sẽ hết hạn sau 15 phút</p>
                      <p className="font-medium text-blue-600">Số tiền: {formatCurrency(paymentData.amount)}</p>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-700">
                        <AlertCircle className="inline w-4 h-4 mr-1" />
                        Đảm bảo số tiền khớp với quyên góp của bạn
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'cash' && (
                <div className="space-y-4">
                  {/* Sender Information for Cash */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-blue-800">Thông tin người đóng góp</h5>
                      <button
                        onClick={() => setShowSenderForm(!showSenderForm)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {showSenderForm ? 'Ẩn' : 'Hiển thị'} form
                      </button>
                    </div>
                    
                    {showSenderForm && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={senderInfo.accountName}
                              onChange={(e) => setSenderInfo({...senderInfo, accountName: e.target.value})}
                              placeholder="Nhập họ tên của bạn"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                            <input
                              type="tel"
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              value={senderInfo.phone}
                              onChange={(e) => setSenderInfo({...senderInfo, phone: e.target.value})}
                              placeholder="09xxxxxxxx"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            value={senderInfo.email}
                            onChange={(e) => setSenderInfo({...senderInfo, email: e.target.value})}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                          <p className="text-sm text-amber-700">
                            <AlertCircle className="inline w-4 h-4 mr-1" />
                            Thông tin của bạn sẽ được dùng để xác nhận và gửi biên lai.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Location Information */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h5 className="font-semibold text-gray-800">Thông tin thanh toán</h5>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <DollarSign className="inline w-4 h-4 mr-1" />
                        Vui lòng mang tiền mặt đến Phòng Tài chính (Tầng 2, Tòa A)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Địa chỉ:</p>
                      <p className="text-sm">Phòng Tài chính, Tòa A, Tầng 2</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Giờ làm việc:</p>
                      <p className="text-sm">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Liên hệ:</p>
                      <p className="text-sm">Hotline: 1900-1234</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Số tiền cần đóng góp:</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(paymentData.amount)}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700">
                        <CheckCircle className="inline w-4 h-4 mr-1" />
                        Bạn sẽ nhận được biên lai ngay sau khi thanh toán.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} disabled={isProcessingPayment}>
                Hủy
              </Button>
              <Button 
                onClick={processPayment} 
                disabled={isProcessingPayment}
                className="flex-1"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} className="mr-2" />
                    Xác nhận thanh toán
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h3>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã quyên góp {formatCurrency(paymentData.amount)} cho {paymentData.recipient}
            </p>
            
            {/* Sender Information Display */}
            {(senderInfo.accountName || senderInfo.phone) && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Thông tin người đóng góp</h4>
                <div className="text-sm text-left space-y-1">
                  {senderInfo.accountName && (
                    <p className="text-blue-700">
                      <span className="font-medium">Họ tên:</span> {senderInfo.accountName}
                    </p>
                  )}
                  {senderInfo.phone && (
                    <p className="text-blue-700">
                      <span className="font-medium">Số điện thoại:</span> {senderInfo.phone}
                    </p>
                  )}
                  {senderInfo.email && (
                    <p className="text-blue-700">
                      <span className="font-medium">Email:</span> {senderInfo.email}
                    </p>
                  )}
                  {selectedPaymentMethod !== 'cash' && senderInfo.accountNumber && (
                    <p className="text-blue-700">
                      <span className="font-medium">Tài khoản:</span> {senderInfo.accountNumber} ({senderInfo.bankName})
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-700">
                Mã giao dịch: #{paymentData.transactionId}
              </p>
              <p className="text-sm text-green-700">
                Phương thức: {selectedPaymentMethod === 'transfer' ? 'Chuyển khoản' : 
                           selectedPaymentMethod === 'qr' ? 'QR Code' : 'Tiền mặt'}
              </p>
              <p className="text-sm text-green-700">
                Thời gian: {new Date().toLocaleString('vi-VN')}
              </p>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              Biên lai đã được gửi đến email của bạn (nếu có cung cấp)
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;
