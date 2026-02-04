import React, { useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, AppContext } from './context';
import { SharedDataProvider } from './sharedDataContext';
import { NotificationToast } from './components';
import { Sidebar, Header } from './Layout';
import LoginScreen from './LoginScreen';

// Import Views
import DashboardView from './DashboardView';
import TimetableView from './TimetableView';
import ClassesView from './ClassesView';
import StudentsView from './StudentsView';
import TeachersView from './TeachersView';
import LMSView from './LMSView';
import AttendanceView from './AttendanceView';
import GradesView from './GradesView';
import ChatView from './ChatView';
import FinanceView from './FinanceView';
import LibraryView from './LibraryView';
import EventsView from './EventsView';
import ExaminationView from './ExaminationView';
import TransportView from './TransportView';
import InventoryView from './InventoryView';
import SettingsView from './SettingsView';
import HRView from './HRView';
import CanteenView from './CanteenView';
import CanteenFinanceView from './CanteenFinanceView';
import DormitoryView from './DormitoryView';
import AlumniView from './AlumniView';
import HealthView from './HealthView';
import FeedbackView from './FeedbackView';
import EnhancedAdmissionsView from './EnhancedAdmissionsView';
import AdmissionsLandingPage from './AdmissionsLandingPage';
import AdmissionsAdminPanel from './AdmissionsAdminPanel';
import ClubsView from './ClubsView';
import ResearchView from './ResearchView';
import CounselingView from './CounselingView';
import StudyAbroadView from './StudyAbroadView';
import AnalyticsView from './AnalyticsView';
import SmartCampusView from './SmartCampusView';
import AIAssistantView from './AIAssistantView';
import ServerMonitorView from './ServerMonitorView';
import KtxView from './KtxView';
import HotelManagementView from './HotelManagementView';
import KtxFinanceView from './KtxFinanceView';
import IntegratedFinanceView from './IntegratedFinanceView';
import StudentDetailView from './StudentDetailView';

const AppContent: React.FC = () => {
  const { user, activeTab, isMobileMenuOpen, toggleMobileMenu, showStudentDetail, selectedStudentId } = useContext(AppContext);

  if (!user) {
    return <LoginScreen />;
  }

  // Show student detail view when active
  if (showStudentDetail && selectedStudentId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentDetailView />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'timetable': return <TimetableView />;
      case 'lms': return <LMSView />;
      case 'attendance': return <AttendanceView />;
      case 'grades': return <GradesView />;
      case 'chat': return <ChatView />;
      case 'classes': return <ClassesView />;
      case 'students': return <StudentsView />;
      case 'teachers': return <TeachersView />;
      case 'settings': return <SettingsView />;
      case 'finance': return <FinanceView />; 
      case 'library': return <LibraryView />; 
      case 'events': return <EventsView />; 
      case 'exam': return <ExaminationView />; 
      case 'transport': return <TransportView />; 
      case 'inventory': return <InventoryView />;
      case 'hr': return <HRView />; 
      case 'canteen': return <CanteenView />; 
      case 'canteen_finance': return <CanteenFinanceView />; 
      case 'dormitory': return <DormitoryView />;
      case 'alumni': return <AlumniView />;
      case 'health': return <HealthView />; 
      case 'feedback': return <FeedbackView />; 
      case 'admissions': return <EnhancedAdmissionsView />; 
      case 'admissions_landing': return <AdmissionsLandingPage />; 
      case 'admissions_admin': return <AdmissionsAdminPanel />; 
      case 'clubs': return <ClubsView />; 
      case 'research': return <ResearchView />; 
      case 'counseling': return <CounselingView />; 
      case 'study_abroad': return <StudyAbroadView />;
      case 'analytics': return <AnalyticsView />;
      case 'smart_campus': return <SmartCampusView />; 
      case 'ai_assistant': return <AIAssistantView />;
      case 'server_monitor': return <ServerMonitorView />; // New
      case 'ktx': return <KtxView />; // New
      case 'hotel_management': return <HotelManagementView />; // New
      case 'ktx_finance': return <KtxFinanceView />; // New
      case 'integrated_finance': return <IntegratedFinanceView />; // New
      default: return <div>Module not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={toggleMobileMenu} />
        <main className="flex-1 p-6 overflow-y-auto print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            {renderContent()}
          </div>
        </main>
      </div>
      <NotificationToast />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-gray-800 bg-opacity-50" onClick={toggleMobileMenu}>
          <div className="h-full" onClick={e => e.stopPropagation()}>
             <Sidebar mobile />
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

const root = createRoot(document.getElementById('root')!);
root.render(
  <SharedDataProvider>
    <App />
  </SharedDataProvider>
);
