import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Edit3,
  ChevronUp,
  Search
} from 'lucide-react';

export const ZOOM_PRESETS = [50, 75, 90, 100, 125, 150, 175, 200];

export default function StatusBar({
  zoom = 100,
  onZoomChange,
  onFitWidth,
  documentMode = 'editing',
  isReady = false,
  isDirty = false,
  fileName = 'Document.docx',
  currentPage = 1,
  totalPages = 1,
  onToggleSearch
}) {
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const menuRef = useRef(null);

  // Close preset menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowPresetMenu(false);
      }
    }
    if (showPresetMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPresetMenu]);

  const handleZoomIn = () => {
    const next = Math.min(250, Math.round(zoom + 10));
    onZoomChange(next);
  };

  const handleZoomOut = () => {
    const prev = Math.max(30, Math.round(zoom - 10));
    onZoomChange(prev);
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      onZoomChange(val);
    }
  };

  return (
    <aside
      id="app-status-bar"
      className="absolute right-0 top-[48px] bottom-0 w-10 sm:w-12 bg-[#2B579A] text-white pt-6 pb-6 flex flex-col items-center justify-between text-xs select-none z-20 shrink-0 font-sans border-l border-[#204377] shadow-inner"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Find & Replace Button */}
        <button
          type="button"
          onClick={onToggleSearch}
          className="p-8.5 rounded-full hover:bg-white/20 transition-colors mt-0"
          title="Find & Replace"
        >
          <Search className="w-4 h-4 text-white/90" />
        </button>

        {/* Top: Page Number */}
        <div className="flex flex-col items-center text-[11px] text-white/90 font-bold tracking-wide gap-2">
          <span>{currentPage}</span>
          <div className="w-5 h-[1px] bg-white/40 rounded-full"></div>
          <span className="text-white/60">{totalPages}</span>
        </div>
      </div>

      {/* Bottom: Zoom Controls */}
      <div className="mb-8 flex flex-col items-center gap-4 relative" ref={menuRef}>
        {/* Fit width quick button */}
        {onFitWidth && (
          <button
            id="status-bar-fit-width-btn"
            type="button"
            onClick={onFitWidth}
            className="hidden sm:flex flex-col items-center justify-center w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
            title="Fit to Window Width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Zoom In */}
        <button
          id="status-bar-zoom-in-btn"
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= 250}
          className="p-1 rounded hover:bg-white/15 disabled:opacity-40 text-white transition-colors"
          title="Zoom In (Ctrl +)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Slider (Rotated Vertically) */}
        <input
          id="status-bar-zoom-slider"
          type="range"
          min="30"
          max="250"
          step="5"
          value={Math.round(zoom)}
          onChange={handleSliderChange}
          className="w-24 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none -rotate-90 my-10"
          title={`Zoom: ${Math.round(zoom)}%`}
        />

        {/* Zoom Out */}
        <button
          id="status-bar-zoom-out-btn"
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= 30}
          className="p-1 rounded hover:bg-white/15 disabled:opacity-40 text-white transition-colors"
          title="Zoom Out (Ctrl -)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Zoom Percentage Dropdown Trigger */}
        <button
          id="status-bar-zoom-preset-btn"
          type="button"
          onClick={() => setShowPresetMenu(!showPresetMenu)}
          className="flex flex-col items-center justify-center mt-2 px-1 py-1 rounded bg-white/10 hover:bg-white/20 font-mono font-bold text-white text-[9px] transition-colors border border-white/20 w-8"
          title="Zoom Presets"
        >
          <span>{Math.round(zoom)}%</span>
        </button>

        {/* Preset Menu */}
        {showPresetMenu && (
          <div
            id="status-bar-zoom-menu"
            className="absolute bottom-0 right-full mr-3 w-32 bg-white rounded-lg shadow-2xl border border-neutral-200 py-1 z-40 text-xs text-neutral-800 animate-in fade-in slide-in-from-right-2 duration-150"
          >
            <div className="px-3 py-1 font-semibold text-neutral-400 text-[10px] uppercase tracking-wider">
              Zoom Presets
            </div>
            {ZOOM_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onZoomChange(p);
                  setShowPresetMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-neutral-100 flex items-center justify-between ${Math.round(zoom) === p ? 'font-semibold text-[#2B579A] bg-blue-50/70' : 'text-neutral-700'
                  }`}
              >
                <span>{p}%</span>
                {Math.round(zoom) === p && <span className="w-1.5 h-1.5 rounded-full bg-[#2B579A]" />}
              </button>
            ))}
            {onFitWidth && (
              <>
                <div className="my-1 border-t border-neutral-100" />
                <button
                  type="button"
                  onClick={() => {
                    onFitWidth();
                    setShowPresetMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-neutral-100 text-neutral-700 font-medium"
                >
                  Fit to Width
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
