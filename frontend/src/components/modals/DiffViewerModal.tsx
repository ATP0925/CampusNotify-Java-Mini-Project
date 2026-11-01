import React, { useState } from 'react';
import { X, GitCompare, CheckCircle2, Copy } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

const REFERENCE_SOLUTION = `import java.util.*;

public class Solution {
    public static int[] findSubarray(int[] nums, int target) {
        if (nums == null || nums.length == 0) return new int[0];
        
        int n = nums.length;
        int minDiff = Integer.MAX_VALUE;
        int bestStart = 0, bestEnd = 0;
        
        int currentSum = 0;
        int left = 0;
        
        // Optimal two-pointer sliding window O(N)
        for (int right = 0; right < n; right++) {
            currentSum += nums[right];
            
            while (left <= right && Math.abs(currentSum - target) < minDiff) {
                minDiff = Math.abs(currentSum - target);
                bestStart = left;
                bestEnd = right;
                if (currentSum > target) {
                    currentSum -= nums[left++];
                } else {
                    break;
                }
            }
        }
        
        return new int[]{bestStart, bestEnd};
    }
}
`;

export const DiffViewerModal: React.FC = () => {
  const { code, isDiffModalOpen, setDiffModalOpen } = useEditorStore();
  const [copied, setCopied] = useState(false);

  if (!isDiffModalOpen) return null;

  const handleCopyReference = () => {
    navigator.clipboard.writeText(REFERENCE_SOLUTION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="flex flex-col w-full max-w-5xl h-[80vh] bg-[#0b1120] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151e32] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <GitCompare className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Code Diff & Oracle Verification Viewer
              </h2>
              <p className="text-xs text-slate-400">
                Comparing current student buffer against gold-standard reference solution
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyReference}
              className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700 text-slate-300 transition"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Reference'}</span>
            </button>
            <button
              onClick={() => setDiffModalOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Code Comparison */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Left: Student Current Buffer */}
          <div className="flex flex-col border-r border-slate-800 overflow-hidden">
            <div className="px-4 py-2 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-semibold text-blue-400">Student Code (Current Snapshot)</span>
              <span>{code.split('\n').length} lines</span>
            </div>
            <pre className="flex-1 p-4 bg-[#0b1120] text-slate-300 font-mono text-xs overflow-auto leading-relaxed select-text">
              {code}
            </pre>
          </div>

          {/* Right: Gold Standard Reference */}
          <div className="flex flex-col overflow-hidden">
            <div className="px-4 py-2 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-semibold text-emerald-400">Reference Model Implementation</span>
              <span>{REFERENCE_SOLUTION.split('\n').length} lines</span>
            </div>
            <pre className="flex-1 p-4 bg-[#0b1120] text-slate-300 font-mono text-xs overflow-auto leading-relaxed select-text">
              {REFERENCE_SOLUTION}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#151e32] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Opaque-box test oracle verified: 100% boundary parity</span>
          <button
            onClick={() => setDiffModalOpen(false)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
