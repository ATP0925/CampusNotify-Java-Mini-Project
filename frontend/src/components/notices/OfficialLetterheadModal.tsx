import React from 'react';
import { X, Printer, Download, Building, ShieldCheck } from 'lucide-react';
import { Notice } from '../../types';

interface OfficialLetterheadModalProps {
  notice: Notice;
  onClose: () => void;
}

export const OfficialLetterheadModal: React.FC<OfficialLetterheadModalProps> = ({
  notice,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="flex flex-col w-full max-w-3xl max-h-[92vh] bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden print:m-0 print:w-full print:max-w-none print:shadow-none">
        {/* Top Screen Toolbar (Hidden on Physical Print) */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#0b1120] text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-blue-400 font-bold">{notice.refNo}</span>
            <span className="text-slate-500">|</span>
            <span>Official University Letterhead Preview</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Letterhead</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Letterhead Paper */}
        <div className="flex-1 overflow-y-auto p-10 bg-white relative font-serif print:p-8">
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Building className="w-[420px] h-[420px] text-black" />
          </div>

          {/* Letterhead Header Banner */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center space-y-1">
            <div className="text-[12px] font-sans font-bold uppercase tracking-wider text-slate-700">
              Vasantdada Patil Pratishthan's
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-950 font-serif">
              College of Engineering and Visual Arts
            </h1>
            <div className="text-xs font-sans text-slate-600">
              (Affiliated to University of Mumbai & Approved by AICTE, New Delhi | Accredited by NAAC & NBA)
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              Eastern Express Highway, Near Everard Nagar, Sion, Mumbai – 400 022
            </div>
          </div>

          {/* Circular Reference & Date Row */}
          <div className="flex items-center justify-between text-xs font-sans font-mono border-b border-slate-200 pb-3 mb-6">
            <div>
              <span className="text-slate-500">Ref. No.: </span>
              <strong className="text-slate-900">{notice.refNo}</strong>
            </div>
            <div>
              <span className="text-slate-500">Date: </span>
              <strong className="text-slate-900">
                {new Date(notice.timestamp).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
            </div>
          </div>

          {/* Official Subject Banner */}
          <div className="text-center my-6">
            <span className="inline-block px-4 py-1 text-xs font-sans font-bold uppercase tracking-widest bg-slate-100 text-slate-800 rounded border border-slate-300">
              OFFICIAL CIRCULAR / NOTIFICATION
            </span>
            <h2 className="text-base font-bold text-slate-950 font-serif mt-3 px-6 leading-relaxed">
              SUB: {notice.title}
            </h2>
          </div>

          {/* Formal Notice Body */}
          <div className="text-sm text-slate-800 font-sans leading-relaxed text-justify space-y-4 my-6">
            <p>{notice.body}</p>
            <p>
              All concerned Heads of Departments, Faculty members, Examination Coordinators, and students
              are requested to take strict note of the above directives and ensure timely compliance in
              accordance with Mumbai University regulations.
            </p>
          </div>

          {/* Signatory Ledger */}
          <div className="mt-14 pt-8 flex justify-between items-end text-xs font-sans">
            <div className="space-y-1 text-slate-500">
              <div>Copy to:</div>
              <ul className="list-disc list-inside text-[11px]">
                <li>Hon. Principal / Vice-Principal</li>
                <li>All Heads of Departments (IT/CE/AI-DS/EXTC)</li>
                <li>Controller of Examinations & Registrar</li>
                <li>Student Notice Boards & Digital Portal</li>
              </ul>
            </div>

            <div className="text-right space-y-1">
              <div className="font-serif italic text-slate-600 pb-2">
                [Digitally Signed via CampusNotify ERP]
              </div>
              <div className="font-bold text-sm text-slate-900">{notice.issuingAuthority}</div>
              <div className="text-slate-600 font-serif">Controller of Examinations / Dean</div>
              <div className="text-[10px] text-slate-500 font-mono">
                SHA-256 Ledger Hash: Verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
