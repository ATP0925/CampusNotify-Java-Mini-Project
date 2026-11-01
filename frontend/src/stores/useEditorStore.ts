import { create } from 'zustand';
import { ViolationLog, ViolationType } from '../types';

export interface TestCaseResult {
  id: number;
  name: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  durationMs: number;
}

interface EditorState {
  code: string;
  language: string;
  activePracticalId: string;
  syncStatus: 'LOCAL_WAL' | 'SYNCING' | 'CLOUD_VERIFIED';
  lastSavedAt: number | null;
  violations: ViolationLog[];
  focusLostCount: number;
  testResults: TestCaseResult[];
  isRunningTests: boolean;
  isDiffModalOpen: boolean;
  terminalLogs: string[];

  setCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  setSyncStatus: (status: 'LOCAL_WAL' | 'SYNCING' | 'CLOUD_VERIFIED') => void;
  recordViolation: (type: ViolationType, details?: string) => void;
  resetViolations: () => void;
  setDiffModalOpen: (open: boolean) => void;
  addTerminalLog: (log: string) => void;
  runTests: (rollNo: string) => Promise<boolean>;
}

const DEFAULT_JAVA_CODE = `import java.util.*;

/**
 * Problem: Subarray Sum Closest to Target
 * Dynamic Parameterization: N = (Roll % 50) + 50
 */
public class Solution {
    public static int[] findSubarray(int[] nums, int target) {
        if (nums == null || nums.length == 0) return new int[0];
        
        int n = nums.length;
        int minDiff = Integer.MAX_VALUE;
        int bestStart = 0, bestEnd = 0;
        
        int currentSum = 0;
        int left = 0;
        
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

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Solution initialized for proctored evaluation.");
    }
}
`;

export const useEditorStore = create<EditorState>((set, get) => ({
  code: DEFAULT_JAVA_CODE,
  language: 'java',
  activePracticalId: 'prac_itc501_exp04',
  syncStatus: 'CLOUD_VERIFIED',
  lastSavedAt: Date.now(),
  violations: [],
  focusLostCount: 0,
  testResults: [],
  isRunningTests: false,
  isDiffModalOpen: false,
  terminalLogs: [
    'CampusNotify Proctored Environment v2.4 initialized.',
    'IndexedDB Write-Ahead Log (WAL) active: 100ms debounce buffer.',
    'Anti-Cheat Keystroke Dynamics Clamping: Active (< 50 chars / 100ms).',
    'Ready for parameter test runs.',
  ],

  setCode: (code) => {
    set({ code, syncStatus: 'LOCAL_WAL', lastSavedAt: Date.now() });
  },

  setLanguage: (language) => {
    set({ language });
  },

  setSyncStatus: (syncStatus) => {
    set({ syncStatus });
  },

  recordViolation: (type, details) => {
    const violation: ViolationLog = {
      id: `viol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      details,
    };
    set((state) => {
      const isFocus = type === 'FOCUS_LOST' || type === 'WINDOW_BLUR';
      return {
        violations: [violation, ...state.violations],
        focusLostCount: isFocus ? state.focusLostCount + 1 : state.focusLostCount,
        terminalLogs: [
          `⚠️ [SECURITY AUDIT] ${type} logged at ${new Date().toLocaleTimeString()} ${details ? `(${details})` : ''}`,
          ...state.terminalLogs,
        ],
      };
    });
  },

  resetViolations: () => {
    set({ violations: [], focusLostCount: 0 });
  },

  setDiffModalOpen: (isDiffModalOpen) => {
    set({ isDiffModalOpen });
  },

  addTerminalLog: (log) => {
    set((state) => ({ terminalLogs: [log, ...state.terminalLogs.slice(0, 49)] }));
  },

  runTests: async (rollNo: string) => {
    set({ isRunningTests: true });
    get().addTerminalLog(`⚙️ Compiling and running parameterized test vectors for Roll: ${rollNo}...`);

    await new Promise((r) => setTimeout(r, 600));

    const mockResults: TestCaseResult[] = [
      {
        id: 1,
        name: 'Test Case 1: Parameterized Boundary (N=72, Target=150)',
        input: 'nums = [12, 28, 45, 10, ...], target = 150',
        expected: 'Subarray indices: [1, 4]',
        actual: 'Subarray indices: [1, 4]',
        passed: true,
        durationMs: 14,
      },
      {
        id: 2,
        name: 'Test Case 2: Zero Frequency & Negative Array Values',
        input: 'nums = [-5, 0, 10, -2, 8], target = 6',
        expected: 'Subarray indices: [2, 3]',
        actual: 'Subarray indices: [2, 3]',
        passed: true,
        durationMs: 9,
      },
      {
        id: 3,
        name: 'Test Case 3: Single Element Array Boundary',
        input: 'nums = [42], target = 50',
        expected: 'Subarray indices: [0, 0]',
        actual: 'Subarray indices: [0, 0]',
        passed: true,
        durationMs: 4,
      },
      {
        id: 4,
        name: 'Test Case 4: High-Volume Random Seed Hash(PRN)',
        input: 'N = 10000, seed = 9421',
        expected: 'Optimal subrange within diff threshold <= 2',
        actual: 'Optimal subrange within diff threshold <= 2',
        passed: true,
        durationMs: 38,
      },
    ];

    const allPassed = mockResults.every((r) => r.passed);
    set({
      testResults: mockResults,
      isRunningTests: false,
      terminalLogs: [
        allPassed
          ? '✅ All 4/4 Parameterized Test Cases PASSED (Execution time: 65ms).'
          : '❌ Some test cases failed.',
        ...get().terminalLogs,
      ],
    });

    return allPassed;
  },
}));
