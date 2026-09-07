import React, { useState, useRef, useCallback, useEffect } from 'react';
import { BlankDOCX } from 'superdoc';
import AppHeader from './components/header/AppHeader.jsx';
import DocxEditor from './components/editor/DocxEditor.jsx';
import EditorEmptyState from './components/editor/EditorEmptyState.jsx';
import FindReplacePanel from './components/editor/FindReplacePanel.jsx';
import StatusBar from './components/status/StatusBar.jsx';
import ErrorModal from './components/ui/ErrorModal.jsx';
import { validateDocxFile, cleanDocxFileName, triggerBrowserDownload } from './utils/fileHelpers.js';
import { getTemplateById } from './templates/sampleDocs.js';

export default function App() {
  // Document state
  const [documentSource, setDocumentSource] = useState(BlankDOCX);
  const [fileName, setFileName] = useState('Untitled Document.docx');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [documentMode, setDocumentMode] = useState('editing');
  const [zoom, setZoom] = useState(100);
  const [showFormattingMarks, setShowFormattingMarks] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [showNavSidebar, setShowNavSidebar] = useState(false);
  const [showPropsSidebar, setShowPropsSidebar] = useState(false);
  const [authorName, setAuthorName] = useState('Zohaib Saeed');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  // References
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      window.superdocInstance = editorRef.current.getInstance();
      window.editorRef = editorRef;
    }
  }, [editorRef.current]);

  // Keyboard shortcuts (Ctrl+S / Cmd+S to export, Ctrl+O to open)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportDocx();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenDocxClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fileName]);

  // Actions
  const handleNewDocument = useCallback(() => {
    setIsLoading(true);
    setIsReady(false);
    setIsDirty(false);
    setFileName('Untitled Document.docx');
    setDocumentSource(BlankDOCX);
    setIsEmptyState(false);
  }, []);

  const handleOpenDocxClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback((file) => {
    if (!file) return;

    const validation = validateDocxFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file format. Please select a valid .docx file.');
      return;
    }

    setIsLoading(true);
    setIsReady(false);
    setIsDirty(false);
    setFileName(cleanDocxFileName(file.name));
    setDocumentSource(file);
    setIsEmptyState(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelected(e.target.files[0]);
        e.target.value = '';
      }
    },
    [handleFileSelected]
  );

  const handleSelectTemplate = useCallback((templateId) => {
    const template = getTemplateById(templateId);
    setIsLoading(true);
    setIsReady(false);
    setIsDirty(false);
    setFileName(template.fileName);
    setDocumentSource(template.source);
    setIsEmptyState(false);
  }, []);

  const handleExportDocx = useCallback(async () => {
    if (!editorRef.current) return;
    try {
      setIsExporting(true);
      await editorRef.current.exportDocument(fileName);
      setIsDirty(false);
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export document. Please try again or check document permissions.');
    } finally {
      setIsExporting(false);
    }
  }, [fileName]);

  const handleExportPdf = useCallback(async () => {
    if (!editorRef.current) return;
    try {
      setIsExporting(true);

      // Get DOCX blob without triggering browser download from SuperDoc
      const docxBlob = await editorRef.current.exportDocument(fileName, true);

      // Prepare form data for ConvertAPI
      const formData = new FormData();
      formData.append('File', docxBlob, cleanDocxFileName(fileName));
      formData.append('StoreFile', 'true');

      // Call ConvertAPI
      const response = await fetch('https://v2.convertapi.com/convert/docx/to/pdf', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 2pPwZouMv564Jac9NEBFKBnhp80w0Z9o'
        },
        body: formData
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.statusText} - ${errText}`);
      }

      const data = await response.json();
      if (!data.Files || !data.Files[0]) {
        throw new Error('No file returned from API');
      }

      const fileInfo = data.Files[0];
      const pdfName = cleanDocxFileName(fileName).replace(/\.docx$/i, '.pdf');

      if (fileInfo.Url) {
        // If StoreFile=true was used, we get a direct URL
        const anchor = document.createElement('a');
        anchor.href = fileInfo.Url;
        anchor.download = pdfName;
        anchor.rel = 'noopener noreferrer';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      } else if (fileInfo.FileData) {
        // Fallback for base64
        const binaryString = atob(fileInfo.FileData);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
        triggerBrowserDownload(pdfBlob, pdfName);
      } else {
        throw new Error('Invalid API response format');
      }

    } catch (err) {
      console.error('PDF Export failed:', err);
      setError('Failed to export PDF. ' + err.message);
    } finally {
      setIsExporting(false);
    }
  }, [fileName]);

  const handleToggleDocumentMode = useCallback(() => {
    setDocumentMode((prev) => {
      const next = prev === 'editing' ? 'viewing' : 'editing';
      editorRef.current?.setDocumentMode(next);
      return next;
    });
  }, []);

  const handleToggleFormattingMarks = useCallback(() => {
    setShowFormattingMarks((prev) => !prev);
    editorRef.current?.toggleFormattingMarks();
  }, []);

  const handleToggleRuler = useCallback(() => {
    setShowRuler((prev) => !prev);
    editorRef.current?.toggleRuler();
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn('Could not enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn('Could not exit fullscreen:', err);
      });
    }
  }, []);

  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
    editorRef.current?.setZoom(newZoom);
  }, []);

  const handleFitWidth = useCallback(() => {
    editorRef.current?.setZoomMode('fit-width');
  }, []);

  const handleEditorReady = useCallback(() => {
    setIsLoading(false);
    setIsReady(true);
  }, []);

  const handleEditorUpdate = useCallback(() => {
    setIsDirty(true);
  }, []);

  const handleEditorError = useCallback((err) => {
    setIsLoading(false);
    setError(err?.message || 'Error loading or parsing the DOCX document.');
  }, []);

  return (
    <div
      id="app-root-container"
      className="flex flex-col h-screen w-screen bg-[#F3F4F6] overflow-hidden select-none font-sans antialiased"
    >
      {/* Hidden File Input for Header and Actions */}
      <input
        ref={fileInputRef}
        id="global-docx-file-input"
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Top Application Header / Word Ribbon */}
      <AppHeader
        fileName={fileName}
        onFileNameChange={setFileName}
        isDirty={isDirty}
        isReady={isReady}
        isExporting={isExporting}
        onNewDocument={handleNewDocument}
        onOpenDocxClick={handleOpenDocxClick}
        onExportDocx={handleExportDocx}
        onExportPdf={handleExportPdf}
        documentMode={documentMode}
        onToggleDocumentMode={handleToggleDocumentMode}
        onToggleFormattingMarks={handleToggleFormattingMarks}
        showFormattingMarks={showFormattingMarks}
        onToggleRuler={handleToggleRuler}
        showRuler={showRuler}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showNavSidebar={showNavSidebar}
        onToggleNavSidebar={() => setShowNavSidebar((prev) => !prev)}
        showPropsSidebar={showPropsSidebar}
        onTogglePropsSidebar={() => setShowPropsSidebar((prev) => !prev)}
      />

      {/* Main Document Workspace */}
      <main id="app-workspace" className="flex-1 relative flex flex-row min-h-0 overflow-hidden bg-[#E2E4E7]">
        {isEmptyState ? (
          <EditorEmptyState
            onNewDocument={handleNewDocument}
            onOpenFile={handleFileSelected}
            onSelectTemplate={handleSelectTemplate}
          />
        ) : (
          <>
            {/* Left Navigation Sidebar */}
            {showNavSidebar && (
              <aside
                id="document-navigation-panel"
                className="w-48 bg-white border-r border-gray-200 p-4 shrink-0 flex flex-col z-10 animate-in fade-in slide-in-from-left duration-150"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Navigation
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNavSidebar(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs px-1"
                    title="Close Navigation"
                  >
                    ✕
                  </button>
                </div>
                <ul className="space-y-1 text-xs">
                  <li className="font-semibold text-[#2B579A] bg-blue-50/70 p-2 rounded cursor-pointer flex items-center justify-between">
                    <span>Document View</span>
                    <span className="text-[10px] text-blue-600 font-mono">1</span>
                  </li>
                  <li className="text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded cursor-pointer">
                    Heading 1 (Sections)
                  </li>
                  <li className="text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded cursor-pointer">
                    Tables & Elements
                  </li>
                  <li className="text-gray-600 hover:text-black hover:bg-gray-50 p-2 rounded cursor-pointer">
                    Appendix & Notes
                  </li>
                </ul>
                <div className="mt-auto p-3 bg-blue-50 rounded-lg border border-blue-100 text-[11px] text-blue-700">
                  <p className="font-bold mb-1">Local Mode Active</p>
                  <p className="opacity-80 leading-snug">Document is stored safely in your browser session.</p>
                </div>
              </aside>
            )}

            {/* Central Document Canvas */}
            <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden bg-[#E2E4E7]">
              <DocxEditor
                ref={editorRef}
                documentSource={documentSource}
                documentMode={documentMode}
                onReady={handleEditorReady}
                onUpdate={handleEditorUpdate}
                onError={handleEditorError}
                onZoomChange={setZoom}
                onDropFile={handleFileSelected}
                onPageChange={(curr, total) => {
                  setCurrentPage(curr);
                  setTotalPages(total);
                }}
                className="flex-1"
              />
              
              {showSearchPanel && (
                <FindReplacePanel 
                  onClose={() => setShowSearchPanel(false)} 
                />
              )}
            </div>

            {/* Right Properties Sidebar */}
            {showPropsSidebar && (
              <aside
                id="document-properties-panel"
                className="w-64 bg-white border-l border-gray-200 p-4 shrink-0 flex flex-col z-10 animate-in fade-in slide-in-from-right duration-150"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Properties
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPropsSidebar(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs px-1"
                    title="Close Properties"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium text-[11px]">Author</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded p-1.5 text-gray-700 focus:outline-none focus:border-[#2B579A] text-xs"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium text-[11px]">Status</label>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      <span className="text-gray-700 font-medium">{isDirty ? 'Drafting' : 'Saved'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium text-[11px]">File Format</label>
                    <span className="text-gray-700 font-medium font-mono text-[11px]">.docx (Word DOCX)</span>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1 font-medium text-[11px]">Local Security</label>
                    <span className="text-emerald-700 font-medium text-[11px]">100% Client-Side Engine</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      All edits are kept strictly in this browser session. Zero data uploaded.
                    </p>
                  </div>
                </div>
              </aside>
            )}
          </>
        )}

        {/* Right Status Bar (now vertical) */}
        <StatusBar
          zoom={zoom}
          onZoomChange={handleZoomChange}
          onFitWidth={handleFitWidth}
          documentMode={documentMode}
          isReady={isReady && !isEmptyState}
          isDirty={isDirty}
          fileName={fileName}
          currentPage={currentPage}
          totalPages={totalPages}
          onToggleSearch={() => setShowSearchPanel((prev) => !prev)}
        />
      </main>

      {/* Error Modal */}
      {error && (
        <ErrorModal
          error={error}
          onClose={() => setError(null)}
          onOpenFile={handleOpenDocxClick}
        />
      )}
    </div>
  );
}
