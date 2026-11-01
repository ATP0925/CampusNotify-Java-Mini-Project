import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, AlertCircle, Save } from 'lucide-react';
import { useSubmissionStore } from '../../stores/useSubmissionStore';

export const BulkGradingModal: React.FC = () => {
  const {
    submissions,
    isBulkGradingOpen,
    setBulkGradingOpen,
    submitBulkGrades,
    autoAdoptAiScores,
  } = useSubmissionStore();

  const [grades, setGrades] = useState<Record<string, { marks: number; feedback: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isBulkGradingOpen) return null;

  const submittedList = submissions.filter((s) => !s.isVirtualMissing && s.status !== 'NOT_SUBMITTED');

  const handleMarkChange = (submissionId: string, val: string) => {
    const marks = Math.min(10, Math.max(0, parseFloat(val) || 0));
    setGrades((prev) => ({
      ...prev,
      [submissionId]: {
        marks,
        feedback: prev[submissionId]?.feedback || 'Graded in batch.',
      },
    }));
  };

  const handleFeedbackChange = (submissionId: string, feedback: string) => {
    setGrades((prev) => ({
      ...prev,
      [submissionId]: {
        marks: prev[submissionId]?.marks ?? 8.5,
        feedback,
      },
    }));
  };

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    const payload = Object.entries(grades).map(([submissionId, data]) => ({
      submissionId,
      marks: data.marks,
      feedback: data.feedback,
    }));

    try {
      if (payload.length > 0) {
        await submitBulkGrades(payload);
      }
      setBulkGradingOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="flex flex-col w-full max-w-4xl max-h-[85vh] bg-[#0b1120] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151e32] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Faculty Bulk Grading & AI Score Adoption
              </h2>
              <p className="text-xs text-slate-400">
                Fast inline grade entry for {submittedList.length} candidate submissions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Auto-Adopt AI Scores Button */}
            <button
              onClick={autoAdoptAiScores}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded text-xs font-semibold transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Adopt AI Viva Scores</span>
            </button>

            <button
              onClick={() => setBulkGradingOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table Roster */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#151e32] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">AI Viva Score</th>
                <th className="p-3">Marks (0-10)</th>
                <th className="p-3">Faculty Feedback Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {submittedList.map((sub) => {
                const currentMark = grades[sub.id]?.marks ?? sub.marks ?? sub.aiVivaScore ?? 8.0;
                const currentFeedback = grades[sub.id]?.feedback ?? sub.feedback ?? '';

                return (
                  <tr key={sub.id} className="hover:bg-slate-900/60 transition">
                    <td className="p-3 font-bold text-blue-400">{sub.rollNo || 'N/A'}</td>
                    <td className="p-3 text-white font-sans">{sub.studentName}</td>
                    <td className="p-3">
                      {sub.aiVivaScore !== undefined ? (
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          {sub.aiVivaScore.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="text-slate-500">Pending Viva</span>
                      )}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={currentMark}
                        onChange={(e) => handleMarkChange(sub.id, e.target.value)}
                        className="w-20 p-1.5 bg-[#0b1120] border border-slate-700 rounded text-center text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="p-3 font-sans">
                      <input
                        type="text"
                        value={currentFeedback}
                        onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                        placeholder="Enter assessment remarks..."
                        className="w-full p-1.5 bg-[#0b1120] border border-slate-700 rounded text-slate-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#151e32] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Grades will be chained with cryptographic two-man revision hash (L8)
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setBulkGradingOpen(false)}
              className="px-4 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition shadow"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving Batch...' : 'Save & Publish Grades'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
