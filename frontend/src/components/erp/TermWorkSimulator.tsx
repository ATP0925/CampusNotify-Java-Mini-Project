import React from 'react';
import { useErpStore } from '../../stores/useErpStore';
import { Calculator, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const TermWorkSimulator: React.FC = () => {
  const {
    twAttendancePct,
    twLabAvg,
    twVivaScore,
    termWork,
    setTwAttendancePct,
    setTwLabAvg,
    setTwVivaScore,
  } = useErpStore();

  return (
    <div className="flex flex-col bg-[#151e32] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Calculator className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Mumbai University 25-Mark Term Work Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Formula: TW = Attendance(5) + Lab Experiments(15) + Viva-Voce(5)
            </p>
          </div>
        </div>

        {/* Total Score Badge */}
        <div className="flex items-center space-x-2 bg-[#0b1120] px-3.5 py-1.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Predicted TW:</span>
          <span className="text-lg font-black font-mono text-emerald-400">
            {termWork.totalMarks.toFixed(1)} / 25.0
          </span>
        </div>
      </div>

      {/* Defaulter Zeroing Warning Banner */}
      {termWork.isDefaulterZeroed && (
        <div className="flex items-center space-x-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>
            <strong>Defaulter Zeroing Active:</strong> Under MU regulations, students with attendance &lt; 75.00% receive 0 marks in the attendance component.
          </span>
        </div>
      )}

      {/* 3 Component Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Attendance Component (5M) */}
        <div className="p-3.5 bg-[#0b1120] border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Attendance Component</span>
            <span className="text-blue-400 font-mono font-bold">
              {termWork.attendanceMarks} / 5 M
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Current: {twAttendancePct.toFixed(2)}%
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="0.5"
            value={twAttendancePct}
            onChange={(e) => setTwAttendancePct(parseFloat(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 flex justify-between font-mono">
            <span>&lt;75% (0M)</span>
            <span>75-79% (2M)</span>
            <span>&gt;=90% (5M)</span>
          </div>
        </div>

        {/* Lab Practical Component (15M) */}
        <div className="p-3.5 bg-[#0b1120] border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Lab Experiments (10 Practicals)</span>
            <span className="text-emerald-400 font-mono font-bold">
              {termWork.labMarks.toFixed(1)} / 15 M
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Average: {twLabAvg.toFixed(1)} / 10 M
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={twLabAvg}
            onChange={(e) => setTwLabAvg(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 flex justify-between font-mono">
            <span>0M</span>
            <span>Scale: (Avg/10)*15</span>
            <span>15M</span>
          </div>
        </div>

        {/* Viva-Voce / Mini-Project (5M) */}
        <div className="p-3.5 bg-[#0b1120] border border-slate-800 rounded-lg space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">AI Viva Voce Defense</span>
            <span className="text-purple-400 font-mono font-bold">
              {termWork.vivaMarks.toFixed(1)} / 5 M
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Rubric: {twVivaScore.toFixed(1)} / 5.0
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={twVivaScore}
            onChange={(e) => setTwVivaScore(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-500 flex justify-between font-mono">
            <span>0M</span>
            <span>4-Axis Rubric</span>
            <span>5M</span>
          </div>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>Formula Cumulative Breakdown:</span>
          <span>{((termWork.totalMarks / 25) * 100).toFixed(1)}% of Term Work Attained</span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(termWork.attendanceMarks / 25) * 100}%` }}
            title={`Attendance: ${termWork.attendanceMarks}M`}
          />
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(termWork.labMarks / 25) * 100}%` }}
            title={`Lab Experiments: ${termWork.labMarks}M`}
          />
          <div
            className="h-full bg-purple-500 transition-all duration-300"
            style={{ width: `${(termWork.vivaMarks / 25) * 100}%` }}
            title={`Viva-Voce: ${termWork.vivaMarks}M`}
          />
        </div>
      </div>
    </div>
  );
};
