import React, { useEffect } from 'react';
import { useAttendanceStore } from '../../stores/useAttendanceStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { ShieldAlert, CheckCircle2, AlertTriangle, FileText, HeartPulse } from 'lucide-react';

export const AttendanceGauge: React.FC = () => {
  const { user } = useAuthStore();
  const {
    summary,
    isLoading,
    medicalGraceRequested,
    graceResult,
    loadSummary,
    setMedicalGraceRequested,
    applyGrace,
  } = useAttendanceStore();

  useEffect(() => {
    loadSummary(user?.id || 'stud_72');
  }, [user?.id, loadSummary]);

  if (isLoading || !summary) {
    return (
      <div className="flex flex-col bg-[#151e32] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-52 bg-slate-800 rounded" />
            <div className="h-3 w-36 bg-slate-800/60 rounded" />
          </div>
          <div className="h-6 w-28 bg-slate-800 rounded-full" />
        </div>

        {/* Circular Gauge Skeleton */}
        <div className="flex items-center justify-center space-x-6 py-6">
          <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-blue-500/50 animate-spin flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-800/40" />
          </div>
          <div className="space-y-2.5">
            <div className="h-3.5 w-32 bg-slate-800 rounded" />
            <div className="h-3.5 w-28 bg-slate-800 rounded" />
            <div className="h-3.5 w-36 bg-slate-800 rounded" />
          </div>
        </div>

        {/* Action / Calculator Skeleton */}
        <div className="h-14 bg-slate-800/40 rounded-lg" />
      </div>
    );
  }

  const percentage = summary.overallPercentage;
  const isSafe = percentage >= 75.0;
  const tier = summary.defaulterTier;

  // SVG circular gauge math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  const gaugeColor = percentage >= 75.0 ? '#10b981' : percentage >= 65.0 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="flex flex-col bg-[#151e32] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            Attendance Engine (MU Ordinance 6086)
          </h3>
          <p className="text-xs text-slate-400">Strict 2-decimal truncation precision</p>
        </div>

        {/* 3-Tier Defaulter Badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
            tier === 'SAFE'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : tier === 'D1_WARNING'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
              : tier === 'D2_PARENT_ALERT'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}
        >
          {tier === 'SAFE'
            ? 'Safe (>=75%)'
            : tier === 'D1_WARNING'
            ? 'D1 Warning (<75%)'
            : tier === 'D2_PARENT_ALERT'
            ? 'D2 Parent Alert (<65%)'
            : 'D3 Debarred (<50%)'}
        </span>
      </div>

      {/* Circular Gauge Display */}
      <div className="flex items-center justify-center space-x-6 py-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#0f172a"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Foreground Animated Gauge */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke={gaugeColor}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Percentage Text */}
          <div className="absolute text-center">
            <div className="text-2xl font-black font-mono tracking-tight" style={{ color: gaugeColor }}>
              {percentage.toFixed(2)}%
            </div>
            <div className="text-[10px] uppercase font-mono text-slate-400">
              {summary ? `${summary.totalAttended}/${summary.totalConducted} Slots` : 'Loading'}
            </div>
          </div>
        </div>

        {/* Ordinance Summary List */}
        <div className="space-y-2 text-xs font-mono text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">MU Minimum:</span>
            <span className="text-white font-semibold">75.00%</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">Shortage:</span>
            <span className={percentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}>
              {percentage >= 75 ? '0 sessions' : '1 session required'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-slate-400">Precision:</span>
            <span className="text-blue-400">BigDecimal Truncate</span>
          </div>
        </div>
      </div>

      {/* Subject-Wise Breakdown Table */}
      {summary?.subjects && (
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Subject Roster Attendance
          </div>
          <div className="space-y-1">
            {summary.subjects.map((sub) => (
              <div
                key={sub.subjectId}
                className="flex items-center justify-between p-2 rounded bg-[#0b1120] border border-slate-800/80 text-xs font-mono"
              >
                <div className="truncate max-w-[180px]">
                  <span className="text-blue-400 font-semibold">{sub.subjectCode}</span> - {sub.subjectName}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">
                    {sub.attended}/{sub.conducted}
                  </span>
                  <span
                    className={`font-bold ${
                      sub.percentage >= 75.0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {sub.percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Grace Calculator (Ordinance 6086) */}
      <div className="p-3.5 bg-[#0b1120] border border-slate-800 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-purple-400">
            <HeartPulse className="w-4 h-4 text-purple-400" />
            <span>Medical Grace Condonation Calculator</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Floor: 60.00% | Max: 15%</span>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="1"
            max="15"
            step="0.5"
            value={medicalGraceRequested}
            onChange={(e) => setMedicalGraceRequested(parseFloat(e.target.value))}
            className="flex-1 accent-purple-500 cursor-pointer"
          />
          <span className="text-xs font-mono font-bold text-purple-300 w-12 text-right">
            +{medicalGraceRequested.toFixed(1)}%
          </span>
          <button
            onClick={applyGrace}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium transition"
          >
            Apply Grace
          </button>
        </div>

        {graceResult && (
          <div
            className={`p-2 rounded text-xs font-mono ${
              graceResult.eligible
                ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
            }`}
          >
            {graceResult.reason}
          </div>
        )}
      </div>
    </div>
  );
};
