import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2 } from 'lucide-react';

interface Student {
  id: number;
  fullName: string;
  code: string;
  email: string;
  class?: {
    id: number;
    name: string;
    gradeLevel: number;
  };
}

interface StudentSelectorProps {
  selectedStudentId?: number;
  onStudentSelect: (student: Student | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  filterByClass?: number;
  showClassInfo?: boolean;
}

const StudentSelector: React.FC<StudentSelectorProps> = ({
  selectedStudentId,
  onStudentSelect,
  placeholder = "Chọn học sinh",
  disabled = false,
  className = "",
  filterByClass,
  showClassInfo = true,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [filterByClass]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      let url = '/api/students';
      if (filterByClass) {
        url += `?classId=${filterByClass}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data.students || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-lg text-left
            focus:outline-none focus:ring-2 focus:ring-blue-500
            bg-white hover:bg-gray-50 transition-colors
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            {selectedStudent ? (
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {selectedStudent.fullName}
                </div>
                {showClassInfo && selectedStudent.class && (
                  <div className="text-xs text-gray-500">
                    {selectedStudent.code} • {selectedStudent.class.name}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 text-gray-500">
                {placeholder}
              </div>
            )}
            <div className="flex items-center gap-1">
              {loading && <Loader2 size={14} className="animate-spin text-gray-400" />}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Student list */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {searchTerm ? 'Không tìm thấy học sinh nào' : 'Chưa có học sinh nào'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    onStudentSelect(student);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors
                    border-b border-gray-100 last:border-0
                    ${selectedStudentId === student.id ? 'bg-blue-50 text-blue-600' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users size={14} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {student.fullName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.code}
                        {showClassInfo && student.class && (
                          <span> • {student.class.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Clear button */}
          {selectedStudent && (
            <div className="p-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  onStudentSelect(null);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Xóa lựa chọn
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default StudentSelector;
