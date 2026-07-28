import { create } from 'zustand';

export interface TerminalEntry {
  timestamp: number;
  text: string;
  kind: 'stdout' | 'stderr' | 'command' | 'exit';
  command?: string;
}

interface TerminalState {
  /** Per-session log entries: sessionId → entries */
  entriesBySession: Record<string, TerminalEntry[]>;
  addEntry: (sessionId: string, entry: TerminalEntry) => void;
  clearSession: (sessionId: string) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  entriesBySession: {},

  addEntry: (sessionId, entry) =>
    set((state) => {
      const existing = state.entriesBySession[sessionId] || [];
      return {
        entriesBySession: {
          ...state.entriesBySession,
          [sessionId]: [...existing, entry],
        },
      };
    }),

  clearSession: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...rest } = state.entriesBySession;
      return { entriesBySession: rest };
    }),
}));
