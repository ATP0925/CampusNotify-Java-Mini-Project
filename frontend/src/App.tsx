import React, { useState } from 'react';
import {
  Building2,
  Monitor,
  Code2,
  GraduationCap,
  Users,
  Bell,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from './stores/useAuthStore';
import { useThreeStore } from './stores/useThreeStore';
import { useVivaStore } from './stores/useVivaStore';
import { CampusScene } from './components/three/CampusScene';
import { LabDeskWorkspace } from './components/three/LabDeskWorkspace';
import { MonacoEditorProctored } from './components/editor/MonacoEditorProctored';
import { DiffViewerModal } from './components/modals/DiffViewerModal';
import { VivaExaminerModal } from './components/viva/VivaExaminerModal';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { FacultyDashboard } from './components/dashboard/FacultyDashboard';
import { NoticeBoard } from './components/notices/NoticeBoard';

type ActiveTab = 'CAMPUS_3D' | 'LAB_DESK_3D' | 'MONACO_IDE' | 'STUDENT_ERP' | 'FACULTY_ERP' | 'NOTICES';

export const App: React.FC = () => {
  const { user, role, switchRole } = useAuthStore();
  const { viewMode, setViewMode } = useThreeStore();
  const { openVivaModal } = useVivaStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('CAMPUS_3D');

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'CAMPUS_3D') setViewMode('CAMPUS');
    if (tab === 'LAB_DESK_3D') setViewMode('LAB_DESK');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Institutional Top Header */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & College Identity */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                CN
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm font-bold tracking-tight text-white">
                    CampusNotify
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                    ERP v2.4 (React 19)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                  Padmabhushan Vasantdada Patil Pratishthan's College of Engineering (PVPPCOE)
                </p>
              </div>
            </div>

            {/* Role Switcher & User Profile Pill */}
            <div className="flex items-center space-x-3">
              {/* Role Toggle Pill */}
              <div className="flex items-center bg-[#151e32] border border-slate-700/80 rounded-lg p-1 text-xs">
                <button
                  onClick={() => {
                    switchRole('STUDENT');
                    setActiveTab('STUDENT_ERP');
                  }}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    role === 'STUDENT'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => {
                    switchRole('FACULTY');
                    setActiveTab('FACULTY_ERP');
                  }}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    role === 'FACULTY' || role === 'HOD'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Faculty / HOD
                </button>
              </div>

              {/* User Identity Pill */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#151e32] border border-slate-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300 font-medium">{user?.name}</span>
                <span className="text-slate-500 font-mono">({role})</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
            <button
              onClick={() => handleTabChange('CAMPUS_3D')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'CAMPUS_3D'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>3D Campus Graph</span>
            </button>

            <button
              onClick={() => handleTabChange('LAB_DESK_3D')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'LAB_DESK_3D'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>3D Lab Desk</span>
            </button>

            <button
              onClick={() => handleTabChange('MONACO_IDE')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'MONACO_IDE'
                  ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Monaco Proctored IDE</span>
            </button>

            <button
              onClick={() => handleTabChange('STUDENT_ERP')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'STUDENT_ERP'
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Academic Hub</span>
            </button>

            <button
              onClick={() => handleTabChange('FACULTY_ERP')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'FACULTY_ERP'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Faculty Evaluation Console</span>
            </button>

            <button
              onClick={() => handleTabChange('NOTICES')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'NOTICES'
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Official Circulars</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'CAMPUS_3D' && <CampusScene />}
        {activeTab === 'LAB_DESK_3D' && <LabDeskWorkspace />}
        {activeTab === 'MONACO_IDE' && (
          <div className="h-[640px]">
            <MonacoEditorProctored onOpenViva={openVivaModal} />
          </div>
        )}
        {activeTab === 'STUDENT_ERP' && <StudentDashboard />}
        {activeTab === 'FACULTY_ERP' && <FacultyDashboard />}
        {activeTab === 'NOTICES' && <NoticeBoard />}
      </main>

      {/* Global AI Viva Voce Examiner Modal */}
      <VivaExaminerModal />
      <DiffViewerModal />

      {/* Institutional Footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 py-4 text-center text-xs text-slate-500 font-mono print:hidden">
        CampusNotify Academic Operating System | Enterprise GovTech Architecture | University of Mumbai Compliant
      </footer>
    </div>
  );
};

export default App;
