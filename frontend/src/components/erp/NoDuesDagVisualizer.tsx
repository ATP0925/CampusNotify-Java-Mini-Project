import React, { useEffect, useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  Clock,
  Lock,
  AlertTriangle,
  CreditCard,
  QrCode,
  Download,
  Printer,
  X,
  FileCheck,
} from 'lucide-react';
import { useErpStore } from '../../stores/useErpStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { DagNode } from '../../types';

export const NoDuesDagVisualizer: React.FC = () => {
  const { user } = useAuthStore();
  const {
    dagNodes,
    hallTicketUnlocked,
    selectedDagNode,
    isUpiModalOpen,
    isHallTicketModalOpen,
    loadDagStatus,
    selectDagNode,
    setUpiModalOpen,
    setHallTicketModalOpen,
    payDueFine,
  } = useErpStore();

  const [payingAmount, setPayingAmount] = useState<number>(0);
  const [upiRef, setUpiRef] = useState<string>('');

  useEffect(() => {
    loadDagStatus(user?.id || 'stud_72');
  }, [user?.id, loadDagStatus]);

  const handleOpenPayment = (node: DagNode) => {
    selectDagNode(node);
    setPayingAmount(node.pendingFineAmount || 0);
    setUpiRef(`UPI_CNMS_${Date.now().toString().slice(-6)}`);
    setUpiModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedDagNode) return;
    await payDueFine(user?.id || 'stud_72', selectedDagNode.id);
  };

  return (
    <div className="flex flex-col bg-[#151e32] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <GitFork className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Asynchronous 8-Node DAG No-Dues Clearance Engine
            </h3>
            <p className="text-xs text-slate-400">
              Kahn's topological ordering with instant fine settlement
            </p>
          </div>
        </div>

        {/* Digital Hall Ticket Unlock Trigger */}
        <button
          onClick={() => setHallTicketModalOpen(true)}
          disabled={!hallTicketUnlocked}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow ${
            hallTicketUnlocked
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white animate-bounce'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {hallTicketUnlocked ? <FileCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{hallTicketUnlocked ? 'Unlock Digital Hall Ticket' : 'Hall Ticket Locked'}</span>
        </button>
      </div>

      {/* 8-Node DAG Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {dagNodes.map((node, index) => {
          const isCleared = node.status === 'CLEARED';
          const isPending = node.status === 'PENDING';
          const isLocked = node.status === 'LOCKED';

          return (
            <div
              key={node.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition relative overflow-hidden ${
                isCleared
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : isPending
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-bold">
                    {node.code}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCleared
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isPending
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {node.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1">{node.name}</h4>
                <div className="text-[11px] text-slate-400 font-mono">
                  {node.dependsOn.length > 0
                    ? `Depends on: ${node.dependsOn.map(d => dagNodes.find(n => n.id === d)?.code || d).join(', ')}`
                    : 'Independent Root Node'}
                </div>
              </div>

              {/* Action / Status Footer */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
                {isCleared ? (
                  <div className="flex items-center space-x-1 text-emerald-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cleared</span>
                  </div>
                ) : isPending && node.pendingFineAmount ? (
                  <button
                    onClick={() => handleOpenPayment(node)}
                    className="w-full flex items-center justify-center space-x-1 py-1 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold transition"
                  >
                    <CreditCard className="w-3 h-3" />
                    <span>Pay Fine (₹{node.pendingFineAmount})</span>
                  </button>
                ) : isLocked ? (
                  <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Prerequisites Pending</span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-[11px]">Under Department Review</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated UPI Fine Clearance Modal */}
      {isUpiModalOpen && selectedDagNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="flex flex-col w-full max-w-md bg-[#0b1120] border border-slate-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Instant UPI No-Dues Clearance</h3>
              </div>
              <button
                onClick={() => setUpiModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Department:</span>
                <span className="text-white font-semibold">{selectedDagNode.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Outstanding Fine:</span>
                <span className="text-rose-400 font-bold">₹{payingAmount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Gateway Ref:</span>
                <span className="text-blue-400">{upiRef}</span>
              </div>
            </div>

            {/* Simulated UPI QR Display */}
            <div className="p-4 bg-white rounded-lg flex flex-col items-center justify-center space-y-2">
              <QrCode className="w-32 h-32 text-black" />
              <span className="text-[11px] text-slate-800 font-mono font-semibold">
                Scan via any UPI App (GPay / PhonePe / Paytm)
              </span>
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
            >
              Simulate Instant Settlement Webhook
            </button>
          </div>
        </div>
      )}

      {/* Digital Hall Ticket Modal */}
      {isHallTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="flex flex-col w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:m-0 print:w-full">
            {/* Header / Crest */}
            <div className="bg-[#0b1120] text-white p-5 flex items-center justify-between border-b-4 border-amber-500 print:bg-white print:text-black">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                  MU
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    University of Mumbai — Hall Ticket
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    B.E. Information Technology | End-Semester Examination 2026
                  </p>
                </div>
              </div>

              <button
                onClick={() => setHallTicketModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate & Verification Details */}
            <div className="p-6 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block">Candidate Name:</span>
                  <span className="font-bold text-sm text-slate-900">{user?.name || 'Aarav Sharma'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Roll Number / PRN:</span>
                  <span className="font-bold text-sm text-slate-900">{user?.rollNo || 'VU4F2526072'} / {user?.prn || 'PRN20269941'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Seat Number:</span>
                  <span className="font-bold text-sm text-blue-600">IT-2026-7042</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Center Code:</span>
                  <span className="font-bold text-sm text-slate-900">PVPPCOE-534 (Sion, Mumbai)</span>
                </div>
              </div>

              {/* No-Dues Cryptographic Attestation Block */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-800 text-xs">
                    ✓ 8-Node DAG No-Dues Clearance Attestation
                  </div>
                  <div className="text-[10px] text-emerald-600">
                    Cryptographic Kahn Topological Proof: SHA-256 Validated
                  </div>
                </div>
                <QrCode className="w-10 h-10 text-emerald-800" />
              </div>

              {/* Exam Schedule Paper List */}
              <div className="space-y-1 pt-2">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Permitted Examination Papers
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="p-2">Date</th>
                        <th className="p-2">Paper Code</th>
                        <th className="p-2">Subject Name</th>
                        <th className="p-2">Invigilator Sign</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2">15-Nov-2026</td>
                        <td className="p-2 font-bold">ITC701</td>
                        <td className="p-2">Storage Area Networks & Cloud</td>
                        <td className="p-2 text-slate-400">______________</td>
                      </tr>
                      <tr>
                        <td className="p-2">18-Nov-2026</td>
                        <td className="p-2 font-bold">ITC702</td>
                        <td className="p-2">Information Security & Cryptography</td>
                        <td className="p-2 text-slate-400">______________</td>
                      </tr>
                      <tr>
                        <td className="p-2">22-Nov-2026</td>
                        <td className="p-2 font-bold">ITC703</td>
                        <td className="p-2">Deep Learning & Generative Models</td>
                        <td className="p-2 text-slate-400">______________</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Print & Download Action Footbar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
              <span className="text-[11px] text-slate-500 font-mono">
                Official Hall Ticket generated via CampusNotify ERP
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Hall Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
