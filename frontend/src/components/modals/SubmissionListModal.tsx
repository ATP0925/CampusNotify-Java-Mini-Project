import React, { useEffect } from 'react';
import {
  X,
  Users,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  GitCompare,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useSubmissionStore } from '../../stores/useSubmissionStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { StudentSubmission } from '../../types';

export const SubmissionListModal: React.FC = () => {
  const {
    submissions,
    filterTab,
    isSubmissionListOpen,
    isRedoModalOpen,
    redoReason,
    loadRoster,
    setFilterTab,
    setSubmissionListOpen,
    setBulkGradingOpen,
    setRedoModalOpen,
    setRedoReason,
    dispatchRedo,
  } = useSubmissionStore();

  const { setDiffModalOpen } = useEditorStore();

  useEffect(() => {
    if (isSubmissionListOpen) {
      loadRoster('task_exp04');
    }
  }, [isSubmissionListOpen, loadRoster]);

  if (!isSubmissionListOpen) return null;

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterTab === 'ALL') return true;
    if (filterTab === 'SUBMITTED') return !sub.isVirtualMissing && sub.status === 'SUBMITTED';
    if (filterTab === 'MISSING') return sub.isVirtualMissing || sub.status === 'NOT_SUBMITTED';
    if (filterTab === 'GRADED') return sub.status === 'EVALUATED';
    if (filterTab === 'REDO_REQUESTED') return sub.status === 'REDO_REQUESTED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="flex flex-col w-full max-w-5xl max-h-[88vh] bg-[#0b1120] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151e32] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Faculty Submission Roster & Evaluation Console
              </h2>
              <p className="text-xs text-slate-400">
                Batch practical review with synthesized virtual unsubmitted student records
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Launch Bulk Grading */}
            <button
              onClick={() => setBulkGradingOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition shadow"
            >
              Open Bulk Grading
            </button>

            <button
              onClick={() => setSubmissionListOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Roster Summary */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#0f172a] border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            {(['ALL', 'SUBMITTED', 'MISSING', 'GRADED', 'REDO_REQUESTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-lg font-mono font-medium transition ${
                  filterTab === tab
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="text-slate-400 font-mono">
            Total Enrolled: <span className="text-white font-bold">{submissions.length}</span> (
            <span className="text-amber-400">
              {submissions.filter((s) => s.isVirtualMissing).length} Virtual Missing
            </span>
            )
          </div>
        </div>

        {/* Submissions Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#151e32] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Proctoring Telemetry</th>
                <th className="p-3">AI Viva</th>
                <th className="p-3">Marks</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSubmissions.map((sub) => {
                const isVirtual = sub.isVirtualMissing;

                return (
                  <tr
                    key={sub.id}
                    className={`transition ${
                      isVirtual
                        ? 'bg-amber-950/15 border-l-4 border-amber-500 hover:bg-amber-950/25'
                        : sub.status === 'REDO_REQUESTED'
                        ? 'bg-rose-950/15 border-l-4 border-rose-500 hover:bg-rose-950/25'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Roll No */}
                    <td className="p-3 font-bold text-blue-400">
                      {sub.rollNo || <span className="text-slate-500">Unassigned</span>}
                    </td>

                    {/* Student Name */}
                    <td className="p-3 font-sans">
                      <div className="font-semibold text-white">{sub.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{sub.prn}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-3">
                      {isVirtual ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Virtual Missing
                        </span>
                      ) : sub.status === 'EVALUATED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Graded
                        </span>
                      ) : sub.status === 'REDO_REQUESTED' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Redo Requested
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          Submitted
                        </span>
                      )}
                    </td>

                    {/* Proctoring Telemetry */}
                    <td className="p-3">
                      {isVirtual ? (
                        <span className="text-slate-500">—</span>
                      ) : sub.violationsCount && sub.violationsCount > 0 ? (
                        <span className="flex items-center space-x-1 text-rose-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{sub.violationsCount} Violations</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400">0 Violations (Clean)</span>
                      )}
                    </td>

                    {/* AI Viva */}
                    <td className="p-3">
                      {sub.aiVivaScore !== undefined ? (
                        <span className="text-purple-400 font-semibold">
                          {sub.aiVivaScore.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Marks */}
                    <td className="p-3">
                      {sub.marks !== undefined ? (
                        <span className="text-emerald-400 font-bold text-sm">
                          {sub.marks.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="text-slate-500">Ungraded</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {!isVirtual && (
                          <>
                            <button
                              onClick={() => setDiffModalOpen(true)}
                              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
                              title="Compare Diff with Reference Model"
                            >
                              <GitCompare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRedoModalOpen(true, sub.id)}
                              className="p-1.5 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300 transition"
                              title="Dispatch Redo Request"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Redo Request Confirmation Modal */}
        {isRedoModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div className="flex flex-col w-full max-w-md bg-[#0b1120] border border-slate-800 rounded-xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-rose-400">
                  <RotateCcw className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white">Dispatch Redo Request Email</h3>
                </div>
                <button
                  onClick={() => setRedoModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                This will reset the student's submission status to <strong>REDO_REQUESTED</strong> and
                send an urgent email notification via JavaMailSender with your feedback.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Reason / Required Code Rectifications:
                </label>
                <textarea
                  rows={3}
                  value={redoReason}
                  onChange={(e) => setRedoReason(e.target.value)}
                  placeholder="e.g. Please fix edge-case boundary check for empty inputs and remove external library calls..."
                  className="w-full p-2.5 bg-[#151e32] border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setRedoModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={dispatchRedo}
                  disabled={!redoReason.trim()}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded text-xs font-semibold transition shadow"
                >
                  Send Redo Notice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 bg-[#151e32] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Roster synced with college database via Spring Data JPA</span>
          <button
            onClick={() => setSubmissionListOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
