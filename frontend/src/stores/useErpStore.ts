import { create } from 'zustand';
import { DagNode, FacultyGuide, TermWorkBreakdown } from '../types';
import { calculateTermWorkFormula, erpService } from '../services/erpService';

interface ErpState {
  // Term Work Simulator
  twAttendancePct: number;
  twLabAvg: number;
  twVivaScore: number;
  termWork: TermWorkBreakdown;

  // No-Dues DAG
  dagNodes: DagNode[];
  hallTicketUnlocked: boolean;
  selectedDagNode: DagNode | null;
  isUpiModalOpen: boolean;
  isHallTicketModalOpen: boolean;

  // Guide Allocation
  facultyGuides: FacultyGuide[];
  selectedPreferences: string[]; // array of guide IDs in ranked order
  matchedGuide: FacultyGuide | null;
  allocationStatus: 'NOT_SUBMITTED' | 'PREFERENCES_SUBMITTED' | 'ALLOCATED';

  // Actions
  setTwAttendancePct: (pct: number) => void;
  setTwLabAvg: (avg: number) => void;
  setTwVivaScore: (score: number) => void;
  recomputeTermWork: () => void;

  loadDagStatus: (studentId: string) => Promise<void>;
  selectDagNode: (node: DagNode | null) => void;
  setUpiModalOpen: (open: boolean) => void;
  setHallTicketModalOpen: (open: boolean) => void;
  payDueFine: (studentId: string, nodeId: string) => Promise<void>;

  loadFacultyGuides: () => Promise<void>;
  addPreference: (guideId: string) => void;
  removePreference: (guideId: string) => void;
  movePreference: (index: number, direction: 'UP' | 'DOWN') => void;
  submitPreferences: (groupId: string) => Promise<void>;
}

export const useErpStore = create<ErpState>((set, get) => {
  const initialTw = calculateTermWorkFormula(81.42, [9, 8.5, 9.5, 9, 8], 4.5);

  return {
    twAttendancePct: 81.42,
    twLabAvg: 8.8,
    twVivaScore: 4.5,
    termWork: initialTw,

    dagNodes: [],
    hallTicketUnlocked: false,
    selectedDagNode: null,
    isUpiModalOpen: false,
    isHallTicketModalOpen: false,

    facultyGuides: [],
    selectedPreferences: [],
    matchedGuide: null,
    allocationStatus: 'NOT_SUBMITTED',

    setTwAttendancePct: (pct) => {
      set({ twAttendancePct: pct });
      get().recomputeTermWork();
    },

    setTwLabAvg: (avg) => {
      set({ twLabAvg: avg });
      get().recomputeTermWork();
    },

    setTwVivaScore: (score) => {
      set({ twVivaScore: score });
      get().recomputeTermWork();
    },

    recomputeTermWork: () => {
      const { twAttendancePct, twLabAvg, twVivaScore } = get();
      const tw = calculateTermWorkFormula(twAttendancePct, [twLabAvg], twVivaScore);
      set({ termWork: tw });
    },

    loadDagStatus: async (studentId: string) => {
      const res = await erpService.getNoDuesDag(studentId);
      set({
        dagNodes: res.nodes,
        hallTicketUnlocked: res.nodes.every((n) => n.status === 'CLEARED'),
      });
    },

    selectDagNode: (node) => {
      set({ selectedDagNode: node });
    },

    setUpiModalOpen: (isUpiModalOpen) => {
      set({ isUpiModalOpen });
    },

    setHallTicketModalOpen: (isHallTicketModalOpen) => {
      set({ isHallTicketModalOpen });
    },

    payDueFine: async (studentId: string, nodeId: string) => {
      const node = get().dagNodes.find((n) => n.id === nodeId);
      if (!node) return;

      await erpService.payDueFine(studentId, nodeId, node.pendingFineAmount || 0);

      // Update DAG state
      set((state) => {
        const updated = state.dagNodes.map((n) => {
          if (n.id === nodeId) {
            return { ...n, status: 'CLEARED' as const, pendingFineAmount: 0, clearedAt: new Date().toISOString() };
          }
          return n;
        });

        // Automatically unlock dependent nodes if prerequisites are cleared
        const resolved = updated.map((n) => {
          if (n.status === 'LOCKED') {
            const depsCleared = n.dependsOn.every((depId) => {
              const depNode = updated.find((d) => d.id === depId);
              return depNode?.status === 'CLEARED';
            });
            if (depsCleared) {
              return { ...n, status: 'PENDING' as const };
            }
          }
          return n;
        });

        const allCleared = resolved.every((n) => n.status === 'CLEARED');
        return {
          dagNodes: resolved,
          hallTicketUnlocked: allCleared,
          isUpiModalOpen: false,
          selectedDagNode: null,
        };
      });
    },

    loadFacultyGuides: async () => {
      const guides = await erpService.getFacultyGuides();
      set({ facultyGuides: guides });
    },

    addPreference: (guideId) => {
      const { selectedPreferences } = get();
      if (!selectedPreferences.includes(guideId) && selectedPreferences.length < 5) {
        set({ selectedPreferences: [...selectedPreferences, guideId] });
      }
    },

    removePreference: (guideId) => {
      set((state) => ({
        selectedPreferences: state.selectedPreferences.filter((id) => id !== guideId),
      }));
    },

    movePreference: (index, direction) => {
      set((state) => {
        const list = [...state.selectedPreferences];
        if (direction === 'UP' && index > 0) {
          const temp = list[index];
          list[index] = list[index - 1];
          list[index - 1] = temp;
        } else if (direction === 'DOWN' && index < list.length - 1) {
          const temp = list[index];
          list[index] = list[index + 1];
          list[index + 1] = temp;
        }
        return { selectedPreferences: list };
      });
    },

    submitPreferences: async (groupId) => {
      const { selectedPreferences, facultyGuides } = get();
      if (selectedPreferences.length === 0) return;

      await erpService.submitGuidePreferences({
        groupId,
        rankedGuideIds: selectedPreferences,
        domain: 'AI & Distributed Systems',
        projectTitle: 'Smart Autonomous Campus Infrastructure with Zero-Lag Synchronization',
      });

      const matchedId = selectedPreferences[0];
      const matched = facultyGuides.find((g) => g.id === matchedId) || facultyGuides[0];

      set({
        allocationStatus: 'ALLOCATED',
        matchedGuide: matched,
      });
    },
  };
});
