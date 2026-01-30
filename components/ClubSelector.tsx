import React, { useState, useEffect } from 'react';
import { Trophy, Search, Loader2, Users } from 'lucide-react';

interface Club {
  id: number;
  name: string;
  category: string;
  description?: string;
  advisor?: {
    id: number;
    fullName: string;
  };
  _count?: {
    members: number;
    schedules: number;
  };
}

interface ClubSelectorProps {
  selectedClubId?: number;
  onClubSelect: (club: Club | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  filterByCategory?: string;
  showMemberCount?: boolean;
  showAdvisor?: boolean;
  multiSelect?: boolean;
  selectedClubs?: number[];
  onClubsSelect?: (clubs: Club[]) => void;
}

const ClubSelector: React.FC<ClubSelectorProps> = ({
  selectedClubId,
  onClubSelect,
  placeholder = "Chọn câu lạc bộ",
  disabled = false,
  className = "",
  filterByCategory,
  showMemberCount = true,
  showAdvisor = true,
  multiSelect = false,
  selectedClubs = [],
  onClubsSelect,
}) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadClubs();
  }, [filterByCategory]);

  const loadClubs = async () => {
    setLoading(true);
    try {
      let url = '/api/clubs';
      if (filterByCategory) {
        url += `?category=${filterByCategory}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setClubs(data.data.clubs || []);
      }
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClub = clubs.find(c => c.id === selectedClubId);
  const selectedClubObjects = clubs.filter(c => selectedClubs.includes(c.id));

  const handleClubClick = (club: Club) => {
    if (multiSelect) {
      const newSelection = selectedClubs.includes(club.id)
        ? selectedClubs.filter(id => id !== club.id)
        : [...selectedClubs, club.id];
      
      if (onClubsSelect) {
        const newClubObjects = clubs.filter(c => newSelection.includes(c.id));
        onClubsSelect(newClubObjects);
      }
    } else {
      onClubSelect(club);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'ACADEMIC': 'bg-blue-100 text-blue-800',
      'SPORTS': 'bg-green-100 text-green-800',
      'ARTS': 'bg-purple-100 text-purple-800',
      'TECHNOLOGY': 'bg-orange-100 text-orange-800',
      'COMMUNITY_SERVICE': 'bg-pink-100 text-pink-800',
      'CULTURAL': 'bg-yellow-100 text-yellow-800',
      'RECREATION': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'ACADEMIC': 'Học thuật',
      'SPORTS': 'Thể thao',
      'ARTS': 'Nghệ thuật',
      'TECHNOLOGY': 'Công nghệ',
      'COMMUNITY_SERVICE': 'Dịch vụ cộng đồng',
      'CULTURAL': 'Văn hóa',
      'RECREATION': 'Giải trí',
    };
    return labels[category] || category;
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
            <Trophy size={16} className="text-gray-400" />
            {multiSelect ? (
              <div className="flex-1">
                {selectedClubObjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedClubObjects.map((club) => (
                      <span
                        key={club.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {club.name}
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
                {selectedClub ? (
                  <div>
                    <div className="font-medium text-gray-900">
                      {selectedClub.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getCategoryLabel(selectedClub.category)}
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm câu lạc bộ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Club list */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {searchTerm ? 'Không tìm thấy câu lạc bộ nào' : 'Chưa có câu lạc bộ nào'}
              </div>
            ) : (
              filteredClubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => handleClubClick(club)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors
                    border-b border-gray-100 last:border-0
                    ${!multiSelect && selectedClubId === club.id ? 'bg-blue-50 text-blue-600' : ''}
                    ${multiSelect && selectedClubs.includes(club.id) ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Trophy size={18} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 truncate">
                          {club.name}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(club.category)}`}>
                          {getCategoryLabel(club.category)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {showMemberCount && (
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            {club._count?.members || 0} thành viên
                          </div>
                        )}
                        {showAdvisor && club.advisor && (
                          <div>Cố vấn: {club.advisor.fullName}</div>
                        )}
                      </div>
                      
                      {club.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {club.description}
                        </div>
                      )}
                    </div>
                    
                    {multiSelect && (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center">
                        {selectedClubs.includes(club.id) && (
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
          {((selectedClub && !multiSelect) || (selectedClubs.length > 0 && multiSelect)) && (
            <div className="p-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  if (multiSelect) {
                    onClubsSelect?.([]);
                  } else {
                    onClubSelect(null);
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

export default ClubSelector;
