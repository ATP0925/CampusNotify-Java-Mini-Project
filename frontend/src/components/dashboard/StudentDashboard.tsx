import React from 'react';
import { AttendanceGauge } from '../erp/AttendanceGauge';
import { TermWorkSimulator } from '../erp/TermWorkSimulator';
import { NoDuesDagVisualizer } from '../erp/NoDuesDagVisualizer';
import { GuideAllocationRanker } from '../erp/GuideAllocationRanker';
import { useAuthStore } from '../../stores/useAuthStore';
import { User, GraduationCap, Building2, BookOpen } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Student Profile Overview Card */}
      <div className="p-5 bg-gradient-to-r from-[#151e32] to-[#1c2742] border border-slate-800 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">{user?.name || 'Aarav Sharma'}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                Sem {user?.semester || 7} (Batch {user?.batch || 'B3'})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {user?.department || 'Information Technology'} | Roll: {user?.rollNo || 'VU4F2526072'} | PRN: {user?.prn || 'PRN20269941'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#0b1120] border border-slate-800">
            <span className="text-slate-500 block text-[10px]">CURRENT CGPA</span>
            <span className="text-emerald-400 font-bold">9.14 / 10.0</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#0b1120] border border-slate-800">
            <span className="text-slate-500 block text-[10px]">ACADEMIC YEAR</span>
            <span className="text-blue-400 font-bold">2026 – 2027</span>
          </div>
        </div>
      </div>

      {/* Grid: Attendance Gauge & Term Work Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceGauge />
        <TermWorkSimulator />
      </div>

      {/* Full Width: Asynchronous 8-Node DAG No-Dues Clearance */}
      <NoDuesDagVisualizer />

      {/* Full Width: Gale-Shapley Major Project Guide Allocation */}
      <GuideAllocationRanker />
    </div>
  );
};
