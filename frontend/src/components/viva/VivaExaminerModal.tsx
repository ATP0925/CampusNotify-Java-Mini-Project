import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
} from 'lucide-react';
import { useVivaStore } from '../../stores/useVivaStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { AudioWaveform } from './AudioWaveform';

export const VivaExaminerModal: React.FC = () => {
  const {
    isOpen,
    examinerState,
    currentQuestionIndex,
    questions,
    timeRemainingSeconds,
    transcripts,
    finalEvaluation,
    isLoading,
    closeVivaModal,
    setExaminerState,
    startVivaSession,
    updateTranscript,
    setTimeRemaining,
    nextQuestion,
    prevQuestion,
    completeViva,
  } = useVivaStore();

  const { code, activePracticalId } = useEditorStore();

  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [sttListening, setSttListening] = useState(false);
  const [speechWarning, setSpeechWarning] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize or start session when opened
  useEffect(() => {
    if (isOpen && questions.length === 0) {
      startVivaSession(activePracticalId, code);
    }
  }, [isOpen, questions.length, activePracticalId, code, startVivaSession]);

  const currentQ = questions[currentQuestionIndex];
  const currentTranscript = transcripts[currentQuestionIndex] || '';

  // Timer Countdown Engine: 60s per question
  useEffect(() => {
    if (!isOpen || finalEvaluation || examinerState === 'EVALUATING') return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time expired for this question
          if (currentQuestionIndex < questions.length - 1) {
            nextQuestion();
            return 60;
          } else {
            completeViva();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, finalEvaluation, examinerState, currentQuestionIndex, questions.length, nextQuestion, completeViva, setTimeRemaining]);

  // Web Speech Synthesis (TTS): Read question aloud when question changes
  useEffect(() => {
    if (!isOpen || !ttsEnabled || !currentQ || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ.text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    setExaminerState('SPEAKING');

    utterance.onend = () => {
      setExaminerState('IDLE');
    };

    utterance.onerror = () => {
      setExaminerState('IDLE');
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestionIndex, isOpen, ttsEnabled, currentQ, setExaminerState]);

  // Web Speech Recognition (STT): Capture student spoken response
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechWarning('Web Speech API is not supported in this browser. You can type your defense response directly into the transcript box below.');
      return;
    }

    if (sttListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setSttListening(false);
      setExaminerState('IDLE');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setSpeechWarning(null);
      setSttListening(true);
      setExaminerState('LISTENING');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        const existing = transcripts[currentQuestionIndex] || '';
        updateTranscript(currentQuestionIndex, existing ? `${existing} ${finalTranscript}` : finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setSttListening(false);
      setExaminerState('IDLE');
      if (event?.error === 'not-allowed') {
        setSpeechWarning('Microphone access was denied. Please allow microphone permissions or type your response below.');
      } else if (event?.error) {
        setSpeechWarning(`Speech recognition notice: ${event.error}. You can type your response below.`);
      }
    };

    recognition.onend = () => {
      setSttListening(false);
      setExaminerState('IDLE');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-[#0b1120] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151e32] border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                AI Viva Voce Proctored Oral Defense
              </h2>
              <p className="text-xs text-slate-400">
                Automated 4-Axis Rubric Evaluation mapped to NBA CO3 & MU 5-Mark Term Work
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Audio TTS Toggle */}
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={ttsEnabled ? 'Mute AI Examiner Voice' : 'Unmute AI Examiner Voice'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Close Button */}
            <button
              onClick={closeVivaModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {speechWarning && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-amber-300 text-xs animate-fadeIn">
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{speechWarning}</span>
              </div>
              <button
                onClick={() => setSpeechWarning(null)}
                className="text-amber-400 hover:text-amber-200 p-1 rounded hover:bg-amber-500/20 transition"
                aria-label="Dismiss warning"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {finalEvaluation ? (
            /* Final Rubric Scorecard View */
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center p-6 bg-gradient-to-b from-purple-950/30 to-[#151e32] border border-purple-500/30 rounded-xl">
                <Award className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-white">Oral Defense Evaluation Complete</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto">
                  {finalEvaluation.feedbackSummary}
                </p>

                <div className="mt-4 flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-purple-400">
                      {finalEvaluation.overallScore} / 10
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                      Composite Viva Score
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {finalEvaluation.normalizedVivaMark} / 5.0
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                      MU Term Work Marks
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Axis Rubric Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#151e32] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Technical Depth & Architecture</span>
                    <span className="text-blue-400 font-mono">{finalEvaluation.technicalDepth} / 10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${(finalEvaluation.technicalDepth / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#151e32] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Problem Solving & Complexity</span>
                    <span className="text-emerald-400 font-mono">{finalEvaluation.problemSolving} / 10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${(finalEvaluation.problemSolving / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#151e32] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Verbal Defense & Communication</span>
                    <span className="text-amber-400 font-mono">{finalEvaluation.communication} / 10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-700"
                      style={{ width: `${(finalEvaluation.communication / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#151e32] border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Code Understanding & Invariants</span>
                    <span className="text-purple-400 font-mono">{finalEvaluation.codeUnderstanding} / 10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${(finalEvaluation.codeUnderstanding / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Oral Defense Session View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Avatar & Waveform Visualizer */}
              <div className="flex flex-col space-y-4">
                <AudioWaveform state={examinerState} />

                {/* Per-Question Countdown Timer Card */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                    timeRemainingSeconds <= 15
                      ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 animate-pulse'
                      : 'bg-[#151e32] border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Question Timer
                    </span>
                  </div>
                  <div className="text-lg font-bold font-mono">
                    00:{timeRemainingSeconds.toString().padStart(2, '0')}s
                  </div>
                </div>

                {/* Speech Microphone Controller */}
                <div className="p-4 bg-[#151e32] border border-slate-800 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Voice Response (Web Speech STT)</div>
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-semibold transition ${
                      sttListening
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {sttListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{sttListening ? 'Stop Recording' : 'Speak Spoken Defense'}</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Language: Indian English (en-IN)
                  </p>
                </div>
              </div>

              {/* Right Column (2 cols): Active Question & Transcript */}
              <div className="md:col-span-2 space-y-4">
                {currentQ && (
                  <div className="p-5 bg-[#151e32] border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-500/20 text-blue-300 font-bold">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold ${
                            currentQ.difficulty === 'EASY'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : currentQ.difficulty === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {currentQ.difficulty}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{currentQ.topic}</span>
                    </div>

                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {currentQ.text}
                    </p>

                    {currentQ.codeReferenceSnippet && (
                      <div className="p-3 bg-[#0b1120] border border-slate-800 rounded-lg">
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono mb-1">
                          <BookOpen className="w-3 h-3 text-blue-400" />
                          <span>Code Snippet under Examination</span>
                        </div>
                        <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
                          {currentQ.codeReferenceSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Candidate Transcript Input / Live STT Preview */}
                <div className="p-5 bg-[#151e32] border border-slate-800 rounded-xl space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Candidate Spoken or Typed Response</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {currentTranscript.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={currentTranscript}
                    onChange={(e) => updateTranscript(currentQuestionIndex, e.target.value)}
                    placeholder="Speak via microphone or type your technical explanation here..."
                    className="w-full p-3 bg-[#0b1120] border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                  />
                </div>

                {/* Question Navigation Footer */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition shadow"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={completeViva}
                      disabled={isLoading}
                      className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Evaluating Rubric...' : 'Finalize & Score Viva'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#151e32] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AI Viva Model: Groq / Gemini Llama-3 (Zero Human Subjectivity Bias)</span>
          <button
            onClick={closeVivaModal}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition border border-slate-700"
          >
            {finalEvaluation ? 'Close & Save Score' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};
