import { create } from 'zustand';
import { AttendanceSummary, DefaulterTier } from '../types';
import { attendanceService, calculateMedicalGrace } from '../services/attendanceService';

interface AttendanceState {
  summary: AttendanceSummary | null;
  isLoading: boolean;
  medicalGraceRequested: number; // percentage (0 to 15%)
  graceResult: {
    eligible: boolean;
    graceAwarded: number;
    finalPercentage: number;
    reason: string;
  } | null;

  loadSummary: (studentId: string) => Promise<void>;
  setMedicalGraceRequested: (grace: number) => void;
  applyGrace: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  summary: null,
  isLoading: false,
  medicalGraceRequested: 5.0,
  graceResult: null,

  loadSummary: async (studentId: string) => {
    set({ isLoading: true });
    try {
      const summary = await attendanceService.getMySummary(studentId);
      set({ summary, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setMedicalGraceRequested: (medicalGraceRequested) => {
    set({ medicalGraceRequested });
  },

  applyGrace: () => {
    const { summary, medicalGraceRequested } = get();
    if (!summary) return;

    const res = calculateMedicalGrace(summary.overallPercentage, medicalGraceRequested);
    set({
      graceResult: res,
      summary: {
        ...summary,
        overallPercentage: res.finalPercentage,
        defaulterTier: res.finalPercentage >= 75.0 ? 'SAFE' : summary.defaulterTier,
      },
    });
  },
}));
