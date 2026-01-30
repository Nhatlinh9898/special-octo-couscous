import React, { useState } from 'react';
import { Button } from './components';

interface CreateClubFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

const CreateClubForm: React.FC<CreateClubFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    schoolId: 1, // Default school ID
    name: '',
    description: '',
    category: 'ACADEMIC',
    advisorId: '',
    maxMembers: 50,
    meetingRoom: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      advisorId: formData.advisorId ? parseInt(formData.advisorId) : null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên Câu lạc bộ
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập tên câu lạc bộ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Mô tả về câu lạc bộ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loại hình
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ACADEMIC">Học thuật</option>
          <option value="SPORTS">Thể thao</option>
          <option value="ARTS">Nghệ thuật</option>
          <option value="TECHNOLOGY">Công nghệ</option>
          <option value="COMMUNITY_SERVICE">Dịch vụ cộng đồng</option>
          <option value="CULTURAL">Văn hóa</option>
          <option value="RECREATION">Giải trí</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Cố vấn (không bắt buộc)
        </label>
        <input
          type="number"
          name="advisorId"
          value={formData.advisorId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ID giáo viên cố vấn"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Số thành viên tối đa
        </label>
        <input
          type="number"
          name="maxMembers"
          value={formData.maxMembers}
          onChange={handleChange}
          min="1"
          max="200"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phòng sinh hoạt (không bắt buộc)
        </label>
        <input
          type="text"
          name="meetingRoom"
          value={formData.meetingRoom}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ví dụ: P.101, Hội trường"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Đang tạo...' : 'Tạo Câu lạc bộ'}
        </Button>
      </div>
    </form>
  );
};

export default CreateClubForm;
