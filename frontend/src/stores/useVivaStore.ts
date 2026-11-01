import { create } from 'zustand';
import { VivaExaminerState, VivaQuestion, VivaRubricScores } from '../types';
import { vivaService } from '../services/vivaService';

interface VivaState {
  isOpen: boolean;
  examinerState: VivaExaminerState;
  activePracticalId: string | null;
  currentQuestionIndex: number;
  questions: VivaQuestion[];
  timeRemainingSeconds: number;
  transcripts: Record<number, string>;
  finalEvaluation: VivaRubricScores | null;
  isLoading: boolean;

  openVivaModal: () => void;
  closeVivaModal: () => void;
  setExaminerState: (state: VivaExaminerState) => void;
  startVivaSession: (practicalId: string, code: string) => Promise<void>;
  updateTranscript: (index: number, text: string) => void;
  setTimeRemaining: (sec: number | ((prev: number) => number)) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  completeViva: () => Promise<void>;
  resetViva: () => void;
}

export const useVivaStore = create<VivaState>((set, get) => ({
  isOpen: false,
  examinerState: 'IDLE',
  activePracticalId: null,
  currentQuestionIndex: 0,
  questions: [],
  timeRemainingSeconds: 60,
  transcripts: {},
  finalEvaluation: null,
  isLoading: false,

  openVivaModal: () => {
    set({ isOpen: true });
  },

  closeVivaModal: () => {
    set({ isOpen: false });
  },

  setExaminerState: (examinerState) => {
    set({ examinerState });
  },

  startVivaSession: async (practicalId: string, code: string) => {
    set({ isLoading: true, activePracticalId: practicalId });
    try {
      const questions = await vivaService.generateQuestions(practicalId, code);
      set({
        questions,
        currentQuestionIndex: 0,
        timeRemainingSeconds: 60,
        transcripts: {},
        finalEvaluation: null,
        examinerState: 'SPEAKING',
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  updateTranscript: (index, text) => {
    set((state) => ({
      transcripts: {
        ...state.transcripts,
        [index]: text,
      },
    }));
  },

  setTimeRemaining: (sec) => {
    set((state) => ({
      timeRemainingSeconds: typeof sec === 'function' ? sec(state.timeRemainingSeconds) : sec,
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        timeRemainingSeconds: 60,
        examinerState: 'SPEAKING',
      });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({
        currentQuestionIndex: currentQuestionIndex - 1,
        timeRemainingSeconds: 60,
        examinerState: 'IDLE',
      });
    }
  },

  completeViva: async () => {
    set({ isLoading: true, examinerState: 'EVALUATING' });
    const { activePracticalId, transcripts } = get();
    try {
      const evalScores = await vivaService.evaluateResponses(activePracticalId || 'prac_default', transcripts);
      set({
        finalEvaluation: evalScores,
        examinerState: 'IDLE',
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, examinerState: 'IDLE' });
    }
  },

  resetViva: () => {
    set({
      currentQuestionIndex: 0,
      timeRemainingSeconds: 60,
      transcripts: {},
      finalEvaluation: null,
      examinerState: 'IDLE',
    });
  },
}));
