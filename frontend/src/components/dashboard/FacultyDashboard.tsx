import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  QrCode,
  Calendar,
  Sparkles,
  BarChart3,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useSubmissionStore } from '../../stores/useSubmissionStore';
import { SubmissionListModal } from '../modals/SubmissionListModal';
import { BulkGradingModal } from '../modals/BulkGradingModal';
import { DiffViewerModal } from '../modals/DiffViewerModal';

export const FacultyDashboard: React.FC = () => {
  const { setSubmissionListOpen, setBulkGradingOpen } = useSubmissionStore();

  const [totpQrActive, setTotpQrActive] = useState(false);
  const [totpCountdown, setTotpCountdown] = useState(15);
  const [sessionCount, setSessionCount] = useState(48);

  // Rotating TOTP QR countdown timer (15s rotation per L4 spec)
  useEffect(() => {
    if (!totpQrActive) return;

    const interval = setInterval(() => {
      setTotpCountdown((prev) => {
        if (prev <= 1) {
          setSessionCount((c) => c + Math.floor(Math.random() * 2));
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totpQrActive]);

  return (
    <div className="space-y-6">
      {/* Faculty Profile Banner */}
      <div className="p-5 bg-gradient-to-r from-[#151e32] to-[#1c2742] border border-slate-800 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white">Dr. Vivek Patil</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
              Professor & Head of Department
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Department of Information Technology | Faculty ID: FAC_IT_001
          </p>
        </div>

        {/* Quick Review Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setBulkGradingOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition shadow"
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click Bulk Grading</span>
          </button>

          <button
            onClick={() => setSubmissionListOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition shadow"
          >
            <Users className="w-4 h-4" />
            <span>Open Submission Roster</span>
          </button>
        </div>
      </div>

      {/* Grid: Live TOTP QR Attendance Session & NAAC/NBA Attainment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Rotating TOTP Attendance Projector */}
        <div className="p-5 bg-[#151e32] border border-slate-800 rounded-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Dynamic Rotating TOTP QR Attendance Session
                </h3>
                <p className="text-xs text-slate-400">
                  L4 Defense: 15s rotating HMAC-SHA256 with 45s heartbeat watchdog
                </p>
              </div>
            </div>

            <button
              onClick={() => setTotpQrActive(!totpQrActive)}
              className={`px-3 py-1 rounded text-xs font-bold transition ${
                totpQrActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {totpQrActive ? 'Stop Session' : 'Project Live QR'}
            </button>
          </div>

          {totpQrActive ? (
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl space-y-3">
              <QrCode className="w-44 h-44 text-black animate-pulse" />
              <div className="text-center font-mono">
                <div className="text-xs font-bold text-slate-900">
                  Token Rotates in: <span className="text-rose-600 text-sm font-black">{totpCountdown}s</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {sessionCount} / 60 Students Verified via Geofence + Wi-Fi BSSID
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 bg-[#0b1120] border border-dashed border-slate-800 rounded-xl text-center space-y-2">
              <QrCode className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Click "Project Live QR" to project the classroom attendance screen.
              </p>
            </div>
          )}
        </div>

        {/* NAAC / NBA CO-PO Direct Attainment Metric Card */}
        <div className="p-5 bg-[#151e32] border border-slate-800 rounded-xl shadow-lg space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                NBA / NAAC Course Outcome Attainment
              </h3>
              <p className="text-xs text-slate-400">
                Direct calculation of CO-PO matrix (Threshold: &ge; 60% marks)
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>CO1: Algorithmic Complexity (ITC501)</span>
                <span className="text-emerald-400 font-bold">88.4% [Attainment Level 3]</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88.4%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>CO2: Network Protocol Security (ITC502)</span>
                <span className="text-blue-400 font-bold">81.2% [Attainment Level 3]</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '81.2%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>CO3: Oral Defense Viva & Defense (ITC503)</span>
                <span className="text-purple-400 font-bold">92.6% [Attainment Level 3]</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '92.6%' }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400">Ready for NBA Peer Review Audit</span>
            <button
              onClick={() => alert('Compiling NAAC / NBA Course Dossier PDF...')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold border border-slate-700"
            >
              Export Course Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubmissionListModal />
      <BulkGradingModal />
      <DiffViewerModal />
    </div>
  );
};
