import React, { useState } from 'react';
import { Clock, Plus, Edit, Trash2, MapPin, Users } from 'lucide-react';
import { Button } from './components';

interface ClubScheduleViewProps {
  club: any;
  schedules: any[];
  onUpdate: () => void;
}

const ClubScheduleView: React.FC<ClubScheduleViewProps> = ({ club, schedules, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    teacherId: '',
    room: '',
    semester: 'FALL',
    academicYear: '2024-2025',
  });

  const days = [
    { value: 1, label: 'Thứ 2' },
    { value: 2, label: 'Thứ 3' },
    { value: 3, label: 'Thứ 4' },
    { value: 4, label: 'Thứ 5' },
    { value: 5, label: 'Thứ 6' },
    { value: 6, label: 'Thứ 6' },
    { value: 7, label: 'Thứ 7' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const scheduleData = {
      clubId: club.id,
      dayOfWeek: parseInt(formData.dayOfWeek),
      startTime: formData.startTime,
      endTime: formData.endTime,
      teacherId: formData.teacherId ? parseInt(formData.teacherId) : null,
      room: formData.room,
      semester: formData.semester,
      academicYear: formData.academicYear,
    };

    try {
      const url = editingSchedule 
        ? `/api/club-schedules/${editingSchedule.id}`
        : '/api/club-schedules';
      
      const response = await fetch(url, {
        method: editingSchedule ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (response.ok) {
        onUpdate();
        setShowAddForm(false);
        setEditingSchedule(null);
        setFormData({
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          teacherId: '',
          room: '',
          semester: 'FALL',
          academicYear: '2024-2025',
        });
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleEdit = (schedule: any) => {
    setEditingSchedule(schedule);
    setFormData({
      dayOfWeek: schedule.dayOfWeek.toString(),
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      teacherId: schedule.teacherId?.toString() || '',
      room: schedule.room || '',
      semester: schedule.semester,
      academicYear: schedule.academicYear,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch sinh hoạt này?')) return;

    try {
      const response = await fetch(`/api/club-schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const getDayLabel = (dayOfWeek: number) => {
    const day = days.find(d => d.value === dayOfWeek);
    return day?.label || `Thứ ${dayOfWeek}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">Lịch sinh hoạt</h4>
        <Button
          onClick={() => setShowAddForm(true)}
          className="text-sm"
        >
          <Plus size={16} className="mr-1" />
          Thêm lịch
        </Button>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock size={48} className="mx-auto mb-2 opacity-50" />
          <p>Chưa có lịch sinh hoạt nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="font-medium text-gray-800">
                    {getDayLabel(schedule.dayOfWeek)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                  {schedule.room && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={14} />
                      {schedule.room}
                    </div>
                  )}
                  {schedule.teacher && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Users size={14} />
                      {schedule.teacher.fullName}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(schedule)}
                  className="p-1"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(schedule.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingSchedule ? 'Cập nhật lịch' : 'Thêm lịch sinh hoạt mới'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ
                </label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn thứ</option>
                  {days.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phòng
                </label>
                <input
                  type="text"
                  name="room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ví dụ: P.101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Giáo viên phụ trách (không bắt buộc)
                </label>
                <input
                  type="number"
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID giáo viên"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSchedule(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {editingSchedule ? 'Cập nhật' : 'Thêm'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubScheduleView;
