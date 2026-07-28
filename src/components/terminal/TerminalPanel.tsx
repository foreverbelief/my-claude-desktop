import { useEffect, useRef, useState, useCallback } from 'react';
import { useTerminalStore, type TerminalEntry } from '../../stores/terminalStore';
import { useSessionStore } from '../../stores/sessionStore';

/** Convert ANSI color codes to CSS classes (basic subset) */
function ansiToHtml(s: string): string {
  let result = '';
  let i = 0;
  let currentClass = '';
  while (i < s.length) {
    if (s[i] === '\x1b' && s[i + 1] === '[') {
      const end = s.indexOf('m', i);
      if (end === -1) { result += escapeHtml(s[i]); i++; continue; }
      const code = s.slice(i + 2, end);
      i = end + 1;
      if (code === '0' || code === '') { currentClass = ''; continue; }
      const c = parseInt(code, 10);
      if (c === 1) currentClass = 'font-bold';
      else if (c === 2) currentClass = 'opacity-60';
      else if (c === 31) currentClass = 'text-red-400';
      else if (c === 32) currentClass = 'text-green-400';
      else if (c === 33) currentClass = 'text-yellow-400';
      else if (c === 34) currentClass = 'text-blue-400';
      else if (c === 35) currentClass = 'text-purple-400';
      else if (c === 36) currentClass = 'text-cyan-400';
      else if (c === 37) currentClass = 'text-gray-300';
      else if (c === 90) currentClass = 'text-gray-500';
      else if (c === 91) currentClass = 'text-red-300';
      else if (c === 92) currentClass = 'text-green-300';
      else if (c === 93) currentClass = 'text-yellow-300';
      else if (c === 94) currentClass = 'text-blue-300';
      else if (c === 95) currentClass = 'text-purple-300';
      else if (c === 96) currentClass = 'text-cyan-300';
      else if (c === 97) currentClass = 'text-gray-100';
      continue;
    }
    result += `<span class="${currentClass}">${escapeHtml(s[i])}</span>`;
    i++;
  }
  return result;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function TerminalLine({ entry }: { entry: TerminalEntry }) {
  const time = formatTime(entry.timestamp);
  if (entry.kind === 'command') {
    return (
      <div className="flex gap-2 py-0.5">
        <span className="text-text-tertiary flex-shrink-0 select-none text-[11px]">{time}</span>
        <span className="text-accent font-semibold text-[12px]">$ {entry.command || entry.text}</span>
      </div>
    );
  }
  if (entry.kind === 'exit') {
    return (
      <div className="flex gap-2 py-0.5">
        <span className="text-text-tertiary flex-shrink-0 select-none text-[11px]">{time}</span>
        <span className="text-text-tertiary text-[11px] italic">{entry.text}</span>
      </div>
    );
  }
  if (entry.kind === 'stderr') {
    return (
      <div className="flex gap-2 py-0.5">
        <span className="text-text-tertiary flex-shrink-0 select-none text-[11px]">{time}</span>
        <span
          className="text-error text-[11px]"
          dangerouslySetInnerHTML={{ __html: ansiToHtml(entry.text) }}
        />
      </div>
    );
  }
  // stdout
  if (!entry.text.trim()) return null;
  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-text-tertiary flex-shrink-0 select-none text-[11px]">{time}</span>
      <span
        className="text-text-muted text-[11px] whitespace-pre-wrap break-all"
        dangerouslySetInnerHTML={{ __html: ansiToHtml(entry.text) }}
      />
    </div>
  );
}

export function TerminalPanel() {
  const selectedSessionId = useSessionStore((s) => s.selectedSessionId);
  const entries = useTerminalStore((s) =>
    selectedSessionId ? (s.entriesBySession[selectedSessionId] || []) : []
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('');

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(atBottom);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setAutoScroll(true);
    }
  };

  const filtered = filter
    ? entries.filter((e) => e.text.toLowerCase().includes(filter.toLowerCase()))
    : entries;

  return (
    <div className="flex flex-col h-full bg-bg-chat relative">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border-subtle">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          className="text-text-tertiary flex-shrink-0">
          <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
        </svg>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="过滤..."
          className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-tertiary outline-none"
        />
        {entries.length > 0 && (
          <button
            onClick={() => useTerminalStore.getState().clearSession(selectedSessionId || '')}
            className="text-[11px] text-text-tertiary hover:text-text-primary transition-smooth flex-shrink-0 px-1"
            title="清除"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 4h10M6 4V2h4v2M5 4v9h6V4" />
            </svg>
          </button>
        )}
      </div>

      {/* Terminal output */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-relaxed"
        style={{ fontFamily: 'var(--mycode-font-family, "Cascadia Code", "JetBrains Mono", Consolas, monospace)' }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="opacity-30">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M8 9l4 3-4 3" />
            </svg>
            <span className="text-[12px]">
              {entries.length === 0 ? 'Bash 命令输出将在此显示' : '无匹配结果'}
            </span>
          </div>
        ) : (
          <div className="min-h-full">
            {filtered.map((entry, i) => (
              <TerminalLine key={i} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Scroll-to-bottom button */}
      {!autoScroll && entries.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-2 right-3 w-8 h-8 rounded-full bg-accent/20 hover:bg-accent/30
            text-accent flex items-center justify-center transition-smooth shadow-md"
          style={{ marginBottom: '8px' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
      )}
    </div>
  );
}
