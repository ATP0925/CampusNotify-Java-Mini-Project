import { create } from 'zustand';
import { StudentSubmission } from '../types';
import { submissionService } from '../services/submissionService';

interface SubmissionState {
  submissions: StudentSubmission[];
  selectedSubmission: StudentSubmission | null;
  filterTab: 'ALL' | 'SUBMITTED' | 'MISSING' | 'GRADED' | 'REDO_REQUESTED';
  isLoading: boolean;
  isSubmissionListOpen: boolean;
  isBulkGradingOpen: boolean;
  isRedoModalOpen: boolean;
  isDiffViewerOpen: boolean;
  redoTargetSubmissionId: string | null;
  redoReason: string;

  loadRoster: (taskId: string) => Promise<void>;
  setFilterTab: (tab: 'ALL' | 'SUBMITTED' | 'MISSING' | 'GRADED' | 'REDO_REQUESTED') => void;
  selectSubmission: (sub: StudentSubmission | null) => void;
  setSubmissionListOpen: (open: boolean) => void;
  setBulkGradingOpen: (open: boolean) => void;
  setRedoModalOpen: (open: boolean, submissionId?: string) => void;
  setDiffViewerOpen: (open: boolean) => void;
  setRedoReason: (reason: string) => void;
  submitBulkGrades: (grades: { submissionId: string; marks: number; feedback?: string }[]) => Promise<void>;
  dispatchRedo: () => Promise<void>;
  autoAdoptAiScores: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  submissions: [],
  selectedSubmission: null,
  filterTab: 'ALL',
  isLoading: false,
  isSubmissionListOpen: false,
  isBulkGradingOpen: false,
  isRedoModalOpen: false,
  isDiffViewerOpen: false,
  redoTargetSubmissionId: null,
  redoReason: '',

  loadRoster: async (taskId) => {
    set({ isLoading: true });
    try {
      const submissions = await submissionService.getFacultyRoster(taskId);
      set({ submissions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setFilterTab: (filterTab) => {
    set({ filterTab });
  },

  selectSubmission: (sub) => {
    set({ selectedSubmission: sub });
  },

  setSubmissionListOpen: (isSubmissionListOpen) => {
    set({ isSubmissionListOpen });
  },

  setBulkGradingOpen: (isBulkGradingOpen) => {
    set({ isBulkGradingOpen });
  },

  setRedoModalOpen: (isRedoModalOpen, submissionId) => {
    set({
      isRedoModalOpen,
      redoTargetSubmissionId: submissionId || null,
      redoReason: '',
    });
  },

  setDiffViewerOpen: (isDiffViewerOpen) => {
    set({ isDiffViewerOpen });
  },

  setRedoReason: (redoReason) => {
    set({ redoReason });
  },

  submitBulkGrades: async (grades) => {
    await submissionService.bulkGrade(grades);
    set((state) => ({
      submissions: state.submissions.map((sub) => {
        const entry = grades.find((g) => g.submissionId === sub.id);
        if (entry) {
          return {
            ...sub,
            marks: entry.marks,
            feedback: entry.feedback || sub.feedback,
            status: 'EVALUATED' as const,
          };
        }
        return sub;
      }),
      isBulkGradingOpen: false,
    }));
  },

  dispatchRedo: async () => {
    const { redoTargetSubmissionId, redoReason } = get();
    if (!redoTargetSubmissionId) return;

    await submissionService.requestRedo(redoTargetSubmissionId, redoReason);
    set((state) => ({
      submissions: state.submissions.map((sub) => {
        if (sub.id === redoTargetSubmissionId) {
          return {
            ...sub,
            status: 'REDO_REQUESTED' as const,
            feedback: redoReason,
          };
        }
        return sub;
      }),
      isRedoModalOpen: false,
      redoTargetSubmissionId: null,
      redoReason: '',
    }));
  },

  autoAdoptAiScores: () => {
    set((state) => ({
      submissions: state.submissions.map((sub) => {
        if (sub.status === 'SUBMITTED' && sub.aiVivaScore !== undefined) {
          return {
            ...sub,
            marks: sub.aiVivaScore,
            feedback: 'Adopted automated AI Viva evaluation rubric score.',
            status: 'EVALUATED' as const,
          };
        }
        return sub;
      }),
    }));
  },
}));
