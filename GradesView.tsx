import React, { useState, useEffect, useContext } from 'react';
import { Upload, Download, Printer, FileSpreadsheet, LineChart, Loader2 } from 'lucide-react';
import { api, MOCK_CLASSES, MOCK_SUBJECTS } from './data';
import { Student, AIAnalysisResult } from './types';
import { Button, Modal } from './components';
import { aiService } from './aiService';
import { gradesService } from './gradesService';
import { AppContext } from './context';

const GradesView = () => {
  const { user } = useContext(AppContext);
  const [selectedClassId, setSelectedClassId] = useState<number>(MOCK_CLASSES[0]?.id || 1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(MOCK_SUBJECTS[0]?.id || 1);
  const [students, setStudents] = useState<Student[]>([]);
  const [gradesData, setGradesData] = useState<any[]>([]);

  // AI
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    api.getStudents().then(allStudents => {
       setStudents(allStudents.filter(s => s.classId === Number(selectedClassId)));
    });
  }, [selectedClassId]);

  // Load grades data and subscribe to changes
  useEffect(() => {
    const loadGrades = () => {
      const grades = gradesService.getClassGrades(selectedClassId, selectedSubjectId);
      setGradesData(grades);
    };

    loadGrades();
    
    const unsubscribe = gradesService.subscribe(loadGrades);
    return unsubscribe;
  }, [selectedClassId, selectedSubjectId]);

  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await aiService.grades.analyzePerformance();
      setAiResult(res);
      setShowAIModal(true);
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  const handleGradeChange = (studentId: number, gradeType: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
      gradesService.updateGrade({
        studentId,
        subjectId: selectedSubjectId,
        gradeType: gradeType as any,
        value: numValue,
        semester: "2024-1", // Could be dynamic
        academicYear: "2024"
      });
    }
  };

  const getStudentGrade = (studentId: number, gradeType: string) => {
    const grade = gradesData.find(g => g.studentId === studentId);
    return grade ? (grade as any)[gradeType] || 0 : 0;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const csvContent = gradesService.exportToCSV(undefined, selectedClassId, selectedSubjectId);
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bang_diem.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-gray-800">Sổ điểm & Báo cáo</h2>
            <p className="text-gray-500">Quản lý điểm số và xuất báo cáo học tập</p>
         </div>
         <div className="flex gap-2">
            <Button 
               variant="secondary" 
               className="text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100"
               onClick={handleAIAnalyze}
               disabled={isAnalyzing}
            >
               {isAnalyzing ? <Loader2 size={18} className="animate-spin"/> : <LineChart size={18}/>}
               {isAnalyzing ? 'Đang phân tích...' : 'AI Phân tích Điểm'}
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer size={18} /> In Báo Cáo
            </Button>
            <Button variant="success" onClick={handleExportExcel}>
              <FileSpreadsheet size={18} /> Xuất Excel
            </Button>
         </div>
       </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Lớp:</span>
            <select 
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
            >
              {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
         </div>
         <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Môn học:</span>
            <select 
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            >
              {MOCK_SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto" id="printable-area">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4 sticky left-0 bg-gray-50 border-r">Họ và Tên</th>
              <th className="p-4 text-center">Miệng</th>
              <th className="p-4 text-center">15 phút (1)</th>
              <th className="p-4 text-center">15 phút (2)</th>
              <th className="p-4 text-center">1 tiết</th>
              <th className="p-4 text-center">Giữa kỳ</th>
              <th className="p-4 text-center">Cuối kỳ</th>
              <th className="p-4 text-center font-bold">TB Môn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((s, idx) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium sticky left-0 bg-white border-r shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">{s.fullName}</td>
                <td className="p-2 text-center">
                  <input 
                    className="w-12 h-8 text-center border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="-"
                    value={getStudentGrade(s.id, 'oral') || ''}
                    onChange={(e) => handleGradeChange(s.id, 'oral', e.target.value)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input 
                    className="w-12 h-8 text-center border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="-"
                    value={getStudentGrade(s.id, 'quiz1') || ''}
                    onChange={(e) => handleGradeChange(s.id, 'quiz1', e.target.value)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input 
                    className="w-12 h-8 text-center border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="-"
                    value={getStudentGrade(s.id, 'quiz2') || ''}
                    onChange={(e) => handleGradeChange(s.id, 'quiz2', e.target.value)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input 
                    className="w-12 h-8 text-center border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="-"
                    value={getStudentGrade(s.id, 'oneHour') || ''}
                    onChange={(e) => handleGradeChange(s.id, 'oneHour', e.target.value)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input 
                    className="w-12 h-8 text-center border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="-"
                    value={getStudentGrade(s.id, 'midterm') || ''}
                    onChange={(e) => handleGradeChange(s.id, 'midterm', e.target.value)}
                  />
                </td>
                <td className="p-2 text-center">
                  <input 
                    className="w-12 h-8 text-center border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="-"
                    value={getStudentGrade(s.id, 'final') || ''}
                    onChange={(e) => handleGradeChange(s.id, 'final', e.target.value)}
                  />
                </td>
                <td className="p-4 text-center font-bold text-indigo-600">
                   {getStudentGrade(s.id, 'average').toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Modal */}
      <Modal isOpen={showAIModal} onClose={() => setShowAIModal(false)} title="AI Phân tích Học lực (Grades AI)">
         {aiResult && (
            <div className="space-y-4">
               <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-bold text-purple-800 mb-2">{aiResult.title}</h4>
                  <p className="text-purple-700 text-sm">{aiResult.summary}</p>
               </div>
               {aiResult.dataPoints && (
                  <div className="text-center py-4 bg-white border rounded">
                     <div className="text-gray-500 text-xs">{aiResult.dataPoints[0].label}</div>
                     <div className="text-lg font-bold text-purple-600">{aiResult.dataPoints[0].value}</div>
                  </div>
               )}
               <div>
                  <h5 className="font-semibold mb-2">Đánh giá chung:</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                     {aiResult.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                  </ul>
               </div>
               <div className="flex justify-end pt-2"><Button onClick={() => setShowAIModal(false)}>Đóng</Button></div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default GradesView;
