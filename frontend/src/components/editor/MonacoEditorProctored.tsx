import React, { useEffect, useRef, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  ShieldAlert,
  Save,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Code2,
  GitCompare,
  Terminal,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useProctoringMonitor } from '../../hooks/useProctoringMonitor';
import { crdtWalManager } from './CrdtWalManager';
import { computeParameterizedSpec, submissionService } from '../../services/submissionService';

interface MonacoEditorProctoredProps {
  onOpenViva?: () => void;
}

export const MonacoEditorProctored: React.FC<MonacoEditorProctoredProps> = ({ onOpenViva }) => {
  const { user } = useAuthStore();
  const {
    code,
    language,
    activePracticalId,
    syncStatus,
    lastSavedAt,
    violations,
    focusLostCount,
    testResults,
    isRunningTests,
    terminalLogs,
    setCode,
    setLanguage,
    setSyncStatus,
    setDiffModalOpen,
    runTests,
  } = useEditorStore();

  const editorRef = useRef<any>(null);
  const previousCodeLengthRef = useRef<number>(code.length);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const studentRollNo = user?.rollNo || 'VU4F2526072';
  const studentPrn = user?.prn || 'PRN20269941';
  const paramSpec = computeParameterizedSpec(studentRollNo, studentPrn);

  const { checkVelocityClamping } = useProctoringMonitor({
    practicalId: activePracticalId,
    studentId: user?.id || 'stud_default',
    enabled: true,
  });

  // Restore from IndexedDB WAL on boot (Power-cut immunity)
  useEffect(() => {
    async function restoreWal() {
      const restored = await crdtWalManager.restoreFromWal(activePracticalId);
      if (restored && restored.content) {
        setCode(restored.content);
        setSyncStatus('CLOUD_VERIFIED');
        if (editorRef.current && restored.cursor) {
          editorRef.current.setPosition(restored.cursor);
        }
      }
    }
    restoreWal();
  }, [activePracticalId, setCode, setSyncStatus]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define GovTech OLED Dark Theme
    monaco.editor.defineTheme('govtech-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: 'a78bfa' },
      ],
      colors: {
        'editor.background': '#0b1120',
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#151e32',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#27354f',
      },
    });

    monaco.editor.setTheme('govtech-dark');
  };

  const handleCodeChange = (newVal?: string) => {
    const val = newVal || '';

    // Check typing velocity
    const isAllowed = checkVelocityClamping(val, previousCodeLengthRef.current);
    previousCodeLengthRef.current = val.length;

    if (!isAllowed) {
      // Clamped velocity alert
      return;
    }

    setCode(val);

    // Save to IndexedDB WAL with 100ms debounce
    const cursor = editorRef.current?.getPosition() || { lineNumber: 1, column: 1 };
    crdtWalManager.recordKeystroke(
      {
        practicalId: activePracticalId,
        studentId: user?.id || 'stud_default',
        content: val,
        language,
        cursor,
      },
      () => {
        setSyncStatus('CLOUD_VERIFIED');
      }
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submissionService.submitPractical({
        practicalId: activePracticalId,
        studentId: user?.id || 'stud_default',
        code,
        language,
        violations,
        testResults,
      });
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 4000);
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1120] text-slate-100 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top IDE Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#151e32] border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm tracking-wide">
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>Monaco Proctored IDE</span>
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#0b1120] text-slate-300 text-xs px-2.5 py-1 rounded border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="java">Java 17 (OpenSDK)</option>
            <option value="python">Python 3.11</option>
            <option value="cpp">C++ 20 (GCC)</option>
            <option value="sql">PostgreSQL 16</option>
            <option value="javascript">JavaScript (Node 20)</option>
          </select>

          {/* Sync Status Badge */}
          <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'CLOUD_VERIFIED'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 font-mono">
              {syncStatus === 'CLOUD_VERIFIED' ? 'WAL Synced (IndexedDB)' : 'Syncing...'}
            </span>
          </div>
        </div>

        {/* Proctoring & Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Violations Warning Pill */}
          {violations.length > 0 && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{violations.length} Violations ({focusLostCount} Blur)</span>
            </div>
          )}

          {/* Parameterized Spec Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 font-mono bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-500">Roll:</span>
            <span className="text-blue-400 font-semibold">{paramSpec.rollNo}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">N:</span>
            <span className="text-emerald-400">{paramSpec.n}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">Seed:</span>
            <span className="text-amber-400">{paramSpec.seed}</span>
          </div>

          {/* Diff Viewer Button */}
          <button
            onClick={() => setDiffModalOpen(true)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition"
            title="Compare Code against Oracle Implementation"
          >
            <GitCompare className="w-3.5 h-3.5 text-slate-400" />
            <span>Diff Viewer</span>
          </button>

          {/* Run Tests Button */}
          <button
            onClick={() => runTests(studentRollNo)}
            disabled={isRunningTests}
            className="flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded transition shadow"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
            <span>{isRunningTests ? 'Running...' : 'Run Tests'}</span>
          </button>

          {/* AI Viva Trigger Button */}
          {onOpenViva && (
            <button
              onClick={onOpenViva}
              className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium rounded transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Viva Defense</span>
            </button>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded transition shadow"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Practical'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Monaco Editor + Dynamic Parameterized Runner */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden min-h-[460px]">
        {/* Editor Area (2 cols) */}
        <div className="lg:col-span-2 relative h-full flex flex-col border-r border-slate-800">
          <div className="flex-1 min-h-[380px]">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme="govtech-dark"
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              options={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                lineHeight: 20,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Steganographic Watermark & Status Footbar */}
          <div className="px-4 py-1.5 bg-[#0f172a] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Watermark: {paramSpec.steganographicWatermark ? 'SHA-256 Stego Locked' : 'None'}</span>
            <span>Last WAL flush: {lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : 'Never'}</span>
          </div>
        </div>

        {/* Dynamic Parameterized Test Runner & Terminal (1 col) */}
        <div className="flex flex-col bg-[#0b1120] p-4 overflow-y-auto space-y-4">
          {/* Dynamic Test Vectors Card */}
          <div className="p-3.5 bg-[#151e32] border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Parameterized Test Specs
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">
                Formula Engine Active
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">N Formula:</span>
                <span className="text-emerald-400">(Roll % 50) + 50 = {paramSpec.n}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-500">Seed S:</span>
                <span className="text-amber-400">Hash(PRN) % 10000 = {paramSpec.seed}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Clamping Velocity:</span>
                <span className="text-blue-400">&lt; 50 chars / 100ms</span>
              </div>
            </div>
          </div>

          {/* Test Case Execution Results */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Test Case Suite ({testResults.length ? `${testResults.filter(t => t.passed).length}/${testResults.length} Pass` : 'Unexecuted'})
              </span>
            </div>

            {testResults.length === 0 ? (
              <div className="p-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-lg text-center text-xs text-slate-500">
                Click "Run Tests" to execute student code against parameterized test vectors.
              </div>
            ) : (
              <div className="space-y-2">
                {testResults.map((test) => (
                  <div
                    key={test.id}
                    className={`p-2.5 rounded-lg border text-xs font-mono transition ${
                      test.passed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        {test.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )}
                        <span className="font-semibold">{test.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{test.durationMs}ms</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">In: {test.input}</div>
                    <div className="text-[11px] text-slate-400 truncate">Out: {test.actual}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terminal Logs Window */}
          <div className="flex-1 flex flex-col p-3 bg-black/60 border border-slate-800 rounded-lg font-mono text-[11px] min-h-[140px]">
            <div className="flex items-center space-x-2 text-slate-400 mb-2 border-b border-slate-800/80 pb-1">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>Console Output & Security Log</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-slate-300">
              {terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    log.includes('⚠️')
                      ? 'text-amber-400'
                      : log.includes('✅')
                      ? 'text-emerald-400'
                      : log.includes('❌')
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Success Toast */}
      {submissionSuccess && (
        <div className="p-3 bg-emerald-600/90 text-white text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Practical submission recorded successfully with zero-loss cryptographic hash!</span>
          </div>
        </div>
      )}
    </div>
  );
};
