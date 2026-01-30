import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Loader2, Users, Clock } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  code: string;
  type: string;
  credits: number;
  description?: string;
  maxStudents: number;
  school?: {
    id: number;
    name: string;
  };
  _count?: {
    enrollments: number;
    schedules: number;
  };
}

interface CourseSelectorProps {
  selectedCourseId?: number;
  onCourseSelect: (course: Course | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  filterByType?: string;
  filterBySchool?: number;
  showEnrollmentCount?: boolean;
  showCredits?: boolean;
  multiSelect?: boolean;
  selectedCourses?: number[];
  onCoursesSelect?: (courses: Course[]) => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourseId,
  onCourseSelect,
  placeholder = "Chọn khóa học",
  disabled = false,
  className = "",
  filterByType,
  filterBySchool,
  showEnrollmentCount = true,
  showCredits = true,
  multiSelect = false,
  selectedCourses = [],
  onCoursesSelect,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [filterByType, filterBySchool]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      let url = '/api/courses';
      const params = new URLSearchParams();
      
      if (filterByType) params.append('type', filterByType);
      if (filterBySchool) params.append('schoolId', filterBySchool.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.data.courses || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const selectedCourseObjects = courses.filter(c => selectedCourses.includes(c.id));

  const handleCourseClick = (course: Course) => {
    if (multiSelect) {
      const newSelection = selectedCourses.includes(course.id)
        ? selectedCourses.filter(id => id !== course.id)
        : [...selectedCourses, course.id];
      
      if (onCoursesSelect) {
        const newCourseObjects = courses.filter(c => newSelection.includes(c.id));
        onCoursesSelect(newCourseObjects);
      }
    } else {
      onCourseSelect(course);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'REGULAR': 'bg-blue-100 text-blue-800',
      'ADVANCED': 'bg-purple-100 text-purple-800',
      'ELECTIVE': 'bg-green-100 text-green-800',
      'REMEDIAL': 'bg-orange-100 text-orange-800',
      'HONORS': 'bg-red-100 text-red-800',
      'AP': 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'REGULAR': 'Cơ bản',
      'ADVANCED': 'Nâng cao',
      'ELECTIVE': 'Tự chọn',
      'REMEDIAL': 'Bổ trợ',
      'HONORS': 'Chuyên sâu',
      'AP': 'AP',
    };
    return labels[type] || type;
  };

  const getEnrollmentPercentage = (course: Course) => {
    const enrolled = course._count?.enrollments || 0;
    return Math.round((enrolled / course.maxStudents) * 100);
  };

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
            <BookOpen size={16} className="text-gray-400" />
            {multiSelect ? (
              <div className="flex-1">
                {selectedCourseObjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedCourseObjects.map((course) => (
                      <span
                        key={course.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {course.code}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    {placeholder}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1">
                {selectedCourse ? (
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedCourse.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedCourse.code} • {getTypeLabel(selectedCourse.type)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    {placeholder}
                  </div>
                )}
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Course list */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {searchTerm ? 'Không tìm thấy khóa học nào' : 'Chưa có khóa học nào'}
              </div>
            ) : (
              filteredCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleCourseClick(course)}
                  className={`
                    w-full px-3 py-3 text-left hover:bg-blue-50 transition-colors
                    border-b border-gray-100 last:border-0
                    ${!multiSelect && selectedCourseId === course.id ? 'bg-blue-50 text-blue-600' : ''}
                    ${multiSelect && selectedCourses.includes(course.id) ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen size={18} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 truncate">
                          {course.name}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(course.type)}`}>
                          {getTypeLabel(course.type)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <div className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                          {course.code}
                        </div>
                        {showCredits && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {course.credits} tín chỉ
                          </div>
                        )}
                        {showEnrollmentCount && (
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            {course._count?.enrollments || 0}/{course.maxStudents}
                          </div>
                        )}
                      </div>
                      
                      {/* Enrollment progress bar */}
                      {showEnrollmentCount && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                getEnrollmentPercentage(course) >= 90
                                  ? 'bg-red-500'
                                  : getEnrollmentPercentage(course) >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${getEnrollmentPercentage(course)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {course.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {course.description}
                        </div>
                      )}
                    </div>
                    
                    {multiSelect && (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center">
                        {selectedCourses.includes(course.id) && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Clear button */}
          {((selectedCourse && !multiSelect) || (selectedCourses.length > 0 && multiSelect)) && (
            <div className="p-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  if (multiSelect) {
                    onCoursesSelect?.([]);
                  } else {
                    onCourseSelect(null);
                  }
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

export default CourseSelector;
