import { useCallback, useRef, useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useSettingsStore } from '../../stores/settingsStore';
import { useFileStore } from '../../stores/fileStore';
import { FilePreview } from '../files/FilePreview';

interface AppShellProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  secondary?: React.ReactNode;
}

const MIN_PANEL_WIDTH = 200;
const MAX_PANEL_WIDTH = 600;
const COLLAPSE_THRESHOLD = 120;

const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 450;
const SIDEBAR_COLLAPSE_THRESHOLD = 100;

const MIN_PREVIEW_WIDTH = 300;
const MAX_PREVIEW_WIDTH = 1200;

/* ─── Resize handle with divider + pill indicator ─── */
function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="w-[6px] -ml-[3px] -mr-[3px] h-full flex-shrink-0 relative cursor-col-resize z-10
        flex items-center justify-center group"
    >
      {/* Full-height divider */}
      <div className="w-px h-full bg-border-subtle group-hover:bg-border-default transition-colors" />
      {/* Pill handle with 3 dots */}
      <div className="absolute top-1/2 -translate-y-1/2 w-[4px] h-8 rounded-full
        bg-border-subtle group-hover:bg-border-default transition-colors
        flex flex-col items-center justify-center gap-[3px] opacity-50 group-hover:opacity-100">
        <span className="w-[2px] h-[2px] rounded-full bg-text-tertiary/70" />
        <span className="w-[2px] h-[2px] rounded-full bg-text-tertiary/70" />
        <span className="w-[2px] h-[2px] rounded-full bg-text-tertiary/70" />
      </div>
    </div>
  );
}

export function AppShell({ sidebar, main, secondary }: AppShellProps) {
  const sidebarOpen = useSettingsStore((s) => s.sidebarOpen);
  const sidebarWidth = useSettingsStore((s) => s.sidebarWidth);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const secondaryPanelOpen = useSettingsStore((s) => s.secondaryPanelOpen);
  const secondaryPanelWidth = useSettingsStore((s) => s.secondaryPanelWidth);
  const toggleSecondaryPanel = useSettingsStore((s) => s.toggleSecondaryPanel);

  const selectedFile = useFileStore((s) => s.selectedFile);
  const isFilePreviewMode = !!selectedFile;

  /* Refs for direct DOM manipulation during drag (no React re-renders) */
  const sidebarOuterRef = useRef<HTMLDivElement>(null);
  const sidebarInnerRef = useRef<HTMLDivElement>(null);
  const secondaryOuterRef = useRef<HTMLDivElement>(null);
  const secondaryInnerRef = useRef<HTMLDivElement>(null);
  const previewOuterRef = useRef<HTMLDivElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);

  /* Preview panel width */
  const [previewWidth, setPreviewWidth] = useState(() =>
    Math.round(window.innerWidth * 0.5)
  );
  const previewInnerW = useRef(previewWidth);
  previewInnerW.current = previewWidth;

  const panelStateBeforePreview = useRef<{ sidebar: boolean; secondary: boolean } | null>(null);

  const prevPreviewMode = useRef(false);
  useEffect(() => {
    if (isFilePreviewMode && !prevPreviewMode.current) {
      setPreviewWidth(Math.round(window.innerWidth * 0.5));
      panelStateBeforePreview.current = {
        sidebar: sidebarOpen,
        secondary: secondaryPanelOpen,
      };
      if (sidebarOpen) toggleSidebar();
      if (secondaryPanelOpen) toggleSecondaryPanel();
    } else if (!isFilePreviewMode && prevPreviewMode.current) {
      const saved = panelStateBeforePreview.current;
      if (saved) {
        if (saved.sidebar && !sidebarOpen) toggleSidebar();
        if (saved.secondary && !secondaryPanelOpen) toggleSecondaryPanel();
        panelStateBeforePreview.current = null;
      }
    }
    prevPreviewMode.current = isFilePreviewMode;
  }, [isFilePreviewMode, sidebarOpen, toggleSidebar, secondaryPanelOpen, toggleSecondaryPanel]);

  // ── Helper: set panel width directly on DOM during drag ──
  const setPanelWidths = useCallback((
    type: 'sidebar' | 'secondary' | 'preview',
    w: number,
  ) => {
    const outer = type === 'sidebar' ? sidebarOuterRef.current
      : type === 'secondary' ? secondaryOuterRef.current
      : previewOuterRef.current;
    const inner = type === 'sidebar' ? sidebarInnerRef.current
      : type === 'secondary' ? secondaryInnerRef.current
      : previewInnerRef.current;
    if (outer) {
      outer.style.transition = 'none';
      outer.style.width = `${w}px`;
    }
    if (inner) inner.style.width = `${w}px`;
  }, []);

  const restoreTransition = useCallback((
    type: 'sidebar' | 'secondary' | 'preview',
  ) => {
    const outer = type === 'sidebar' ? sidebarOuterRef.current
      : type === 'secondary' ? secondaryOuterRef.current
      : previewOuterRef.current;
    if (outer) outer.style.transition = '';
  }, []);

  // ── Right panel dragging (secondary + preview) ──
  const isRightDragging = useRef(false);
  const rightStartX = useRef(0);
  const rightStartWidth = useRef(0);
  const rightDragType = useRef<'secondary' | 'preview'>('secondary');

  const isFilePreviewModeRef = useRef(isFilePreviewMode);
  isFilePreviewModeRef.current = isFilePreviewMode;
  const secondaryPanelWidthRef = useRef(secondaryPanelWidth);
  secondaryPanelWidthRef.current = secondaryPanelWidth;

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isRightDragging.current = true;
    rightStartX.current = e.clientX;
    rightDragType.current = isFilePreviewModeRef.current ? 'preview' : 'secondary';
    rightStartWidth.current = isFilePreviewModeRef.current
      ? previewInnerW.current
      : secondaryPanelWidthRef.current;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isRightDragging.current) return;
      const delta = rightStartX.current - e.clientX;
      const newWidth = rightStartWidth.current + delta;
      const type = rightDragType.current;

      if (type === 'preview') {
        if (newWidth < COLLAPSE_THRESHOLD) {
          isRightDragging.current = false;
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          restoreTransition('preview');
          useFileStore.getState().closePreview();
          return;
        }
        const w = Math.max(MIN_PREVIEW_WIDTH, Math.min(MAX_PREVIEW_WIDTH, newWidth));
        setPanelWidths('preview', w);
        previewInnerW.current = w;
      } else {
        if (newWidth < COLLAPSE_THRESHOLD) {
          isRightDragging.current = false;
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
          restoreTransition('secondary');
          const settings = useSettingsStore.getState();
          if (settings.secondaryPanelOpen) settings.toggleSecondaryPanel();
          return;
        }
        const w = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth));
        setPanelWidths('secondary', w);
      }
    };

    const handleMouseUp = () => {
      if (!isRightDragging.current) return;
      isRightDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      const type = rightDragType.current;
      restoreTransition(type);

      if (type === 'preview') {
        setPreviewWidth(previewInnerW.current);
      } else {
        // Sync final width back to store
        const outer = secondaryOuterRef.current;
        if (outer) {
          const finalW = parseInt(outer.style.width, 10) || secondaryPanelWidthRef.current;
          useSettingsStore.getState().setSecondaryPanelWidth(finalW);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (isRightDragging.current) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [setPanelWidths, restoreTransition]);

  // ── Sidebar dragging ──
  const isSidebarDragging = useRef(false);
  const sidebarStartX = useRef(0);
  const sidebarStartW = useRef(0);

  const sidebarWidthRef = useRef(sidebarWidth);
  sidebarWidthRef.current = sidebarWidth;

  const handleSidebarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isSidebarDragging.current = true;
    sidebarStartX.current = e.clientX;
    sidebarStartW.current = sidebarWidthRef.current;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isSidebarDragging.current) return;
      const delta = e.clientX - sidebarStartX.current;
      const newW = sidebarStartW.current + delta;
      if (newW < SIDEBAR_COLLAPSE_THRESHOLD) {
        isSidebarDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        restoreTransition('sidebar');
        const settings = useSettingsStore.getState();
        if (settings.sidebarOpen) settings.toggleSidebar();
        return;
      }
      const w = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, newW));
      setPanelWidths('sidebar', w);
    };
    const handleUp = () => {
      if (!isSidebarDragging.current) return;
      isSidebarDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      restoreTransition('sidebar');
      // Sync final width to store
      const outer = sidebarOuterRef.current;
      if (outer) {
        const finalW = parseInt(outer.style.width, 10) || sidebarWidthRef.current;
        useSettingsStore.getState().setSidebarWidth(finalW);
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      if (isSidebarDragging.current) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
  }, [setPanelWidths, restoreTransition]);

  const showSidebar = sidebarOpen && !isFilePreviewMode;
  const showFloatingSidebar = sidebarOpen && isFilePreviewMode;
  const showSecondary = secondaryPanelOpen && !isFilePreviewMode;
  const showFloatingSecondary = secondaryPanelOpen && isFilePreviewMode;

  return (
    <div className="flex h-full w-full overflow-hidden gradient-bg">
      {/* Custom title bar */}
      <div
        data-tauri-drag-region
        className="fixed top-0 left-0 right-0 h-[32px] z-50 flex items-center justify-end
          bg-bg-primary border-b border-border-subtle"
      >
        <button
          onClick={() => getCurrentWindow().minimize()}
          className="h-full w-[46px] flex items-center justify-center
            text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-smooth"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M2 6h8" />
          </svg>
        </button>
        <button
          onClick={() => getCurrentWindow().toggleMaximize()}
          className="h-full w-[46px] flex items-center justify-center
            text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-smooth"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1.5" y="1.5" width="9" height="9" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => getCurrentWindow().close()}
          className="h-full w-[46px] flex items-center justify-center
            text-text-tertiary hover:bg-error hover:text-white transition-smooth"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarOuterRef}
        className="flex-shrink-0 transition-all duration-300 ease-out overflow-hidden"
        style={{ width: showSidebar ? `${sidebarWidth}px` : '0px' }}
      >
        <div
          ref={sidebarInnerRef}
          className="h-full overflow-y-auto overflow-x-hidden bg-bg-sidebar"
          style={{ width: `${sidebarWidth}px` }}
        >
          {sidebar}
        </div>
      </div>

      {showSidebar && <ResizeHandle onMouseDown={handleSidebarMouseDown} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col bg-bg-chat overflow-hidden pt-[32px]">
        {main}
      </div>

      {/* File Preview */}
      {isFilePreviewMode && <ResizeHandle onMouseDown={handleRightMouseDown} />}
      <div
        ref={previewOuterRef}
        className="flex-shrink-0 overflow-hidden transition-all duration-300 ease-out"
        style={{ width: isFilePreviewMode ? `${previewWidth}px` : '0px' }}
      >
        <div ref={previewInnerRef} className="h-full overflow-hidden flex flex-col bg-bg-chat"
          style={{ width: `${previewWidth}px` }}>
          <FilePreview />
        </div>
      </div>

      {/* Secondary Panel */}
      {secondary && showSecondary && <ResizeHandle onMouseDown={handleRightMouseDown} />}
      {secondary && (
        <div
          ref={secondaryOuterRef}
          className="flex-shrink-0 transition-all duration-300 ease-out overflow-hidden"
          style={{ width: showSecondary ? `${secondaryPanelWidth}px` : '0px' }}
        >
          <div
            ref={secondaryInnerRef}
            className="h-full overflow-y-auto overflow-x-hidden bg-bg-sidebar"
            style={{ width: `${secondaryPanelWidth}px` }}
          >
            {secondary}
          </div>
        </div>
      )}

      {/* Floating Sidebar */}
      {showFloatingSidebar && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10" onClick={toggleSidebar} />
          <div
            className="fixed top-0 left-0 h-full z-50 flex animate-in slide-in-from-left duration-200"
            style={{ width: `${sidebarWidth}px` }}
          >
            <div className="flex-1 h-full overflow-y-auto bg-bg-sidebar
              border-r border-border-subtle shadow-lg">
              {sidebar}
            </div>
          </div>
        </>
      )}

      {/* Floating Secondary Panel */}
      {secondary && showFloatingSecondary && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10" onClick={toggleSecondaryPanel} />
          <div
            className="fixed top-0 right-0 h-full z-50 flex animate-in slide-in-from-right duration-200"
            style={{ width: `${secondaryPanelWidth}px` }}
          >
            <div className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-bg-sidebar
              border-l border-border-subtle shadow-lg">
              {secondary}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
