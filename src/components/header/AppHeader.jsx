import React, { useState, useRef } from 'react';
import {
  FileText,
  FolderOpen,
  Download,
  Plus,
  Edit2,
  Check,
  Eye,
  Edit3,
  Maximize,
  Minimize,
  Pilcrow,
  Sliders,
  Ruler,
  HelpCircle
} from 'lucide-react';
import { cleanDocxFileName } from '../../utils/fileHelpers.js';

export default function AppHeader({
  fileName,
  onFileNameChange,
  isDirty,
  isReady,
  isExporting,
  onNewDocument,
  onOpenDocxClick,
  onExportDocx,
  onExportPdf,
  documentMode,
  onToggleDocumentMode,
  onToggleFormattingMarks,
  showFormattingMarks,
  onToggleRuler,
  showRuler,
  isFullscreen,
  onToggleFullscreen,
  activeTab = 'Home',
  onTabChange,
  showNavSidebar,
  onToggleNavSidebar,
  showPropsSidebar,
  onTogglePropsSidebar,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(fileName);
  const nameInputRef = useRef(null);

  const ribbonTabs = ['Home', 'Insert', 'Layout', 'References', 'Review', 'View', 'Help'];

  const handleStartRename = () => {
    setTempName(fileName.replace(/\.docx$/i, ''));
    setIsEditingName(true);
    setTimeout(() => {
      nameInputRef.current?.select();
    }, 50);
  };

  const handleSaveRename = () => {
    setIsEditingName(false);
    const cleaned = cleanDocxFileName(tempName);
    onFileNameChange(cleaned);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setTempName(fileName);
    }
  };

  return (
    <header
      id="app-main-header"
      className="bg-white border-b border-gray-200 select-none z-20 shrink-0 font-sans shadow-xs"
    >
      {/* Top Application Ribbon Bar in Classic Word #2B579A */}
      <div className="h-14 bg-[#2B579A] text-white flex items-center justify-between px-4 shrink-0 shadow-md">
        {/* Left: Brand Icon & Editable Document Title */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="bg-white p-[3px] rounded shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-[22px] h-[22px] bg-gradient-to-br from-[#2B579A] to-[#1A365D] rounded-sm flex items-center justify-center text-white font-black text-xs shadow-inner">
              W
            </div>
          </div>

          <span className="font-extrabold text-[17px] tracking-wide hidden md:inline bg-gradient-to-b from-white to-blue-100 bg-clip-text text-transparent drop-shadow-sm">
            MZ Word
          </span>

          <div className="h-4 w-[1px] bg-white/30 mx-1 hidden md:block" />

          <div className="flex items-center gap-2 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded border border-white/30">
                <input
                  ref={nameInputRef}
                  id="document-name-input"
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleSaveRename}
                  onKeyDown={handleKeyDown}
                  className="px-1.5 py-0.5 text-xs font-semibold text-white bg-white/20 rounded focus:outline-none focus:ring-1 focus:ring-white/50 max-w-[180px] sm:max-w-xs"
                />
                <span className="text-xs text-white/70 font-mono">.docx</span>
                <button
                  type="button"
                  onClick={handleSaveRename}
                  className="p-1 text-white hover:bg-white/20 rounded transition-colors"
                  title="Apply Name"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="document-name-display-btn"
                onClick={handleStartRename}
                className="group flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/10 transition-colors text-left truncate"
                title="Click to rename document"
              >
                <span className="text-xs sm:text-sm font-medium opacity-95 text-white truncate max-w-[150px] sm:max-w-xs md:max-w-sm">
                  {fileName}
                </span>
                <Edit2 className="w-3 h-3 text-white/50 group-hover:text-white transition-opacity shrink-0" />
              </button>
            )}

            {/* Saved state badge */}
            <span
              id="document-saved-status-badge"
              className={`hidden lg:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${isDirty
                ? 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                : 'bg-white/10 text-white/80 border border-white/15'
                }`}
            >
              {isDirty ? 'Unsaved' : 'Saved'}
            </span>
          </div>
        </div>

        {/* Right: Quick View, Tool Toggles & Primary Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
          {/* Navigation Panel Toggle */}
          {onToggleNavSidebar && (
            <button
              id="header-toggle-nav-btn"
              type="button"
              onClick={onToggleNavSidebar}
              className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${showNavSidebar
                ? 'bg-white text-[#2B579A] border-white'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              title="Toggle Navigation Outline Panel"
            >
              Navigation
            </button>
          )}

          {/* Properties Panel Toggle */}
          {onTogglePropsSidebar && (
            <button
              id="header-toggle-props-btn"
              type="button"
              onClick={onTogglePropsSidebar}
              className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${showPropsSidebar
                ? 'bg-white text-[#2B579A] border-white'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              title="Toggle Document Properties Panel"
            >
              Properties
            </button>
          )}

          {/* Formatting Marks (¶) */}
          {onToggleFormattingMarks && (
            <button
              id="header-toggle-marks-btn"
              type="button"
              onClick={onToggleFormattingMarks}
              className={`p-1.5 rounded transition-colors ${showFormattingMarks ? 'bg-white text-[#2B579A]' : 'text-white hover:bg-white/20'
                }`}
              title="Non-Printing Formatting Marks (¶)"
            >
              <Pilcrow className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Ruler */}
          {onToggleRuler && (
            <button
              id="header-toggle-ruler-btn"
              type="button"
              onClick={onToggleRuler}
              className={`p-1.5 rounded transition-colors ${showRuler ? 'bg-white text-[#2B579A]' : 'text-white hover:bg-white/20'
                }`}
              title="Toggle Document Ruler"
            >
              <Ruler className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Mode Switch: Editing / Viewing */}
          <button
            id="header-mode-toggle-btn"
            type="button"
            onClick={onToggleDocumentMode}
            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border transition-colors ${documentMode === 'editing'
              ? 'bg-white text-[#2B579A] border-white'
              : 'bg-amber-400 text-amber-900 border-amber-400'
              }`}
            title={`Mode: ${documentMode === 'editing' ? 'Editing' : 'Reading'}`}
          >
            {documentMode === 'editing' ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-[#2B579A]" />
                <span className="hidden sm:inline">Editing</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-900" />
                <span className="hidden sm:inline">Reading</span>
              </>
            )}
          </button>

          {/* Fullscreen */}
          {onToggleFullscreen && (
            <button
              id="header-toggle-fullscreen-btn"
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          )}

          <div className="h-5 w-[1px] bg-white/30 hidden sm:block mx-1" />

          {/* New Document */}
          <button
            id="header-new-doc-btn"
            type="button"
            onClick={onNewDocument}
            className="bg-white/10 hover:bg-white/20 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors border border-white/20 flex items-center gap-1.5"
            title="Create a new blank document"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">New</span>
          </button>

          {/* Open DOCX */}
          <button
            id="header-open-doc-btn"
            type="button"
            onClick={onOpenDocxClick}
            className="bg-white/10 hover:bg-white/20 text-white px-2 sm:px-3 py-1 rounded text-xs transition-colors border border-white/20 flex items-center gap-1.5"
            title="Open a .docx file from your computer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Open</span>
          </button>

          {/* Download / Export PDF in Professional Red */}
          <button
            id="header-export-pdf-btn"
            type="button"
            onClick={onExportPdf}
            disabled={!isReady || isExporting}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-2 sm:px-3.5 py-1 rounded text-xs transition-colors shadow-sm font-medium flex items-center gap-1.5"
            title="Download document as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Download PDF'}</span>
          </button>

          {/* Download / Export DOCX in Professional Green */}
          <button
            id="header-export-doc-btn"
            type="button"
            onClick={onExportDocx}
            disabled={!isReady || isExporting}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-2 sm:px-3.5 py-1 rounded text-xs transition-colors shadow-sm font-medium flex items-center gap-1.5"
            title="Download edited document as .docx"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Download .docx'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
