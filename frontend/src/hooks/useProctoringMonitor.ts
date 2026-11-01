import { useEffect, useRef } from 'react';
import { useEditorStore } from '../stores/useEditorStore';

interface UseProctoringMonitorProps {
  practicalId: string;
  studentId: string;
  enabled?: boolean;
}

export const useProctoringMonitor = ({
  practicalId,
  studentId,
  enabled = true,
}: UseProctoringMonitorProps) => {
  const { recordViolation } = useEditorStore();
  const blurStartTimeRef = useRef<number | null>(null);
  const keystrokeHistoryRef = useRef<{ time: number; length: number }[]>([]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 1. Focus Lost & Window Blur Proctoring
    const handleBlur = () => {
      blurStartTimeRef.current = Date.now();
      recordViolation('WINDOW_BLUR', 'Active workstation window lost focus.');
    };

    const handleFocus = () => {
      if (blurStartTimeRef.current) {
        const durationMs = Date.now() - blurStartTimeRef.current;
        recordViolation('FOCUS_LOST', `Workstation blurred for ${durationMs}ms.`);
        blurStartTimeRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurStartTimeRef.current = Date.now();
        recordViolation('FOCUS_LOST', 'Document tab switched to background.');
      } else if (blurStartTimeRef.current) {
        const durationMs = Date.now() - blurStartTimeRef.current;
        recordViolation('FOCUS_LOST', `Returned to tab after ${durationMs}ms.`);
        blurStartTimeRef.current = null;
      }
    };

    // 2. Clipboard Violation Trapping
    const handlePaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text') || '';
      if (text.length > 50) {
        recordViolation('CLIPBOARD_PASTE', `External paste of ${text.length} characters detected.`);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('paste', handlePaste);
    };
  }, [enabled, practicalId, studentId, recordViolation]);

  // 3. Typing dynamics velocity check (called on editor content changes)
  const checkVelocityClamping = (newCode: string, previousLength: number) => {
    const now = Date.now();
    const currentLength = newCode.length;
    const deltaChars = Math.abs(currentLength - previousLength);

    // Keep 2-second history
    keystrokeHistoryRef.current.push({ time: now, length: currentLength });
    keystrokeHistoryRef.current = keystrokeHistoryRef.current.filter((k) => now - k.time <= 2000);

    // If more than 50 characters injected within 100ms => Burst injection violation
    const recent100ms = keystrokeHistoryRef.current.filter((k) => now - k.time <= 100);
    if (recent100ms.length >= 2) {
      const charDiff100ms = Math.abs(
        recent100ms[recent100ms.length - 1].length - recent100ms[0].length
      );
      if (charDiff100ms > 50) {
        recordViolation(
          'BURST_INJECTION',
          `Burst injection velocity clamped: ${charDiff100ms} chars inserted in <100ms.`
        );
        return false; // rejected velocity
      }
    }

    return true;
  };

  return {
    checkVelocityClamping,
  };
};
