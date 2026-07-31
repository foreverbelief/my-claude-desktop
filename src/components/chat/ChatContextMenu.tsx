import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '../../lib/i18n';

interface Props {
  x: number;
  y: number;
  selectedText: string;
  fullText: string;
  onClose: () => void;
}

export function ChatContextMenu({ x, y, selectedText, fullText, onClose }: Props) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const hasSelection = selectedText.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => onClose());
  };

  // Adjust position to stay within viewport
  const menuW = 180;
  const menuH = hasSelection ? 80 : 40;
  const adjustedX = Math.min(x, window.innerWidth - menuW - 8);
  const adjustedY = Math.min(y, window.innerHeight - menuH - 8);

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[9999] min-w-[160px] py-1.5 rounded-xl
        bg-bg-card border border-border-subtle shadow-xl animate-fade-in"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {hasSelection && (
        <button
          onClick={() => copyText(selectedText)}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs
            text-text-primary hover:bg-bg-secondary transition-smooth cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
            <rect x="5" y="5" width="9" height="9" rx="1.5" />
            <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
          </svg>
          {t('msg.copyText')}
        </button>
      )}
      {hasSelection && <div className="my-1 border-t border-border-subtle" />}
      <button
        onClick={() => copyText(fullText)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs
          text-text-primary hover:bg-bg-secondary transition-smooth cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary">
          <rect x="5" y="5" width="9" height="9" rx="1.5" />
          <path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
        </svg>
        {t('msg.copyMessages')}
      </button>
    </div>,
    document.body,
  );
}
